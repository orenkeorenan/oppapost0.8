
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "REQUESTED",
  "QUOTED",
  "AWAITING_PAYMENT",
  "PURCHASED",
  "PACKAGE_INCOMING",
  "COMPLETED",
  "CANCELLED",
] as const;

type ShopperStatus = (typeof allowedStatuses)[number];

const allowedTransitions: Record<ShopperStatus, ShopperStatus[]> = {
  REQUESTED: ["QUOTED", "CANCELLED"],
  QUOTED: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["PURCHASED", "CANCELLED"],
  PURCHASED: ["PACKAGE_INCOMING"],
  PACKAGE_INCOMING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireAdminApi();

    if (auth.response) return auth.response;

    const { id: rawId } = await context.params;
    const id = Number(rawId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid request ID." },
        { status: 400 }
      );
    }

    
    let body: {
      status?: unknown;
      quotedPrice?: unknown;
      serviceFee?: unknown;
      packageTrackingNumber?: unknown;
      packageWeight?: unknown;
    };

    try {
      const parsed: unknown = await request.json();

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return NextResponse.json(
          { error: "Request body must be a JSON object." },
          { status: 400 }
        );
      }

      body = parsed;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }


    const data: {
      status?: ShopperStatus;
      quotedPrice?: number | null;
      serviceFee?: number | null;
    } = {};

    if ("status" in body) {
      if (
        typeof body.status !== "string" ||
        !allowedStatuses.includes(body.status as ShopperStatus)
      ) {
        return NextResponse.json(
          { error: "Invalid request status." },
          { status: 400 }
        );
      }

      data.status = body.status as ShopperStatus;
    }

    for (const field of ["quotedPrice", "serviceFee"] as const) {
      if (!(field in body)) continue;

      const value = body[field];

      if (value === null) {
        data[field] = null;
        continue;
      }

      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 99_999_999.99
      ) {
        return NextResponse.json(
          { error: `${field} must be a valid non-negative amount.` },
          { status: 400 }
        );
      }

      data[field] = value;
    }

    const creatingPackage = body.status === "PACKAGE_INCOMING";

    let packageTrackingNumber: string | undefined;
    let packageWeight: number | undefined;

    if (creatingPackage) {
      packageTrackingNumber =
        typeof body.packageTrackingNumber === "string"
          ? body.packageTrackingNumber.trim()
          : "";

      packageWeight = body.packageWeight as number;

      if (
        !packageTrackingNumber ||
        packageTrackingNumber.length > 200 ||
        typeof body.packageWeight !== "number" ||
        !Number.isFinite(packageWeight) ||
        packageWeight <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Enter a tracking number of 1–200 characters and a positive numeric package weight.",
          },
          { status: 400 }
        );
      }
    }
        
      
    

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.personalShopperRequest.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          status: true,
          packageId: true,
          quotedPrice: true,
          serviceFee: true,
        },
      });

      if (!existing) {
        return {
          error: "Personal Shopper request not found.",
          status: 404 as const,
        };
      }

      const nextStatus = data.status ?? existing.status;

      if (nextStatus !== existing.status) {
        const permitted = allowedTransitions[
          existing.status as ShopperStatus
        ];

        if (!permitted.includes(nextStatus)) {
          return {
            error: `Cannot change status from ${existing.status} to ${nextStatus}.`,
            status: 400 as const,
          };
        }
      }

      const finalQuotedPrice =
        data.quotedPrice !== undefined
          ? data.quotedPrice
          : existing.quotedPrice === null
            ? null
            : Number(existing.quotedPrice);

      const finalServiceFee =
        data.serviceFee !== undefined
          ? data.serviceFee
          : existing.serviceFee === null
            ? null
            : Number(existing.serviceFee);

      if (
        nextStatus === "QUOTED" ||
        nextStatus === "AWAITING_PAYMENT"
      ) {
        if (finalQuotedPrice === null || finalServiceFee === null) {
          return {
            error:
              "Enter both the quoted product price and service fee before quoting or requesting payment.",
            status: 400 as const,
          };
        }
      }

      if (nextStatus === "PACKAGE_INCOMING") {
        if (existing.status !== "PURCHASED") {
          return {
            error: "Only purchased requests can receive a warehouse package.",
            status: 409 as const,
          };
        }

        if (existing.packageId) {
          return {
            error: "A warehouse package is already linked to this request.",
            status: 409 as const,
          };
        }

        const duplicate = await tx.package.findUnique({
          where: { trackingNumber: packageTrackingNumber! },
          select: { id: true },
        });

        if (duplicate) {
          return {
            error: "That tracking number is already registered.",
            status: 409 as const,
          };
        }

        // Claim the status transition before creating the package.
        // Only one concurrent request can update a PURCHASED request.
        const claimed = await tx.personalShopperRequest.updateMany({
          where: {
            id,
            status: "PURCHASED",
            packageId: null,
          },
          data: {
            ...data,
            status: "PACKAGE_INCOMING",
          },
        });

        if (claimed.count === 0) {
          return {
            error:
              "This request was changed by another operation. Refresh and try again.",
            status: 409 as const,
          };
        }

        const newPackage = await tx.package.create({
          data: {
            userId: existing.userId,
            trackingNumber: packageTrackingNumber!,
            source: "PERSONAL_SHOPPER",
            weight: packageWeight!,
            status: "RECEIVED",
            receivedAt: new Date(),
          },
          select: { id: true },
        });

        await tx.personalShopperRequest.update({
          where: { id },
          data: {
            packageId: newPackage.id,
          },
        });
      } else {
        const updated = await tx.personalShopperRequest.updateMany({
          where: {
            id,
            status: existing.status,
          },
          data,
        });

        if (updated.count === 0) {
          return {
            error:
              "This request was changed by another operation. Refresh and try again.",
            status: 409 as const,
          };
        }
      }

      const updatedRequest = await tx.personalShopperRequest.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          package: {
            select: {
              id: true,
              trackingNumber: true,
              status: true,
              weight: true,
            },
          },
        },
      });

      if (!updatedRequest) {
        return {
          error: "Request could not be found after updating.",
          status: 404 as const,
        };
      }

      return { request: updatedRequest };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ request: result.request });
  } catch (error) {
    console.error("Admin personal shopper update error:", error);

    return NextResponse.json(
      { error: "Unable to update personal shopper request." },
      { status: 500 }
    );
  }
}
