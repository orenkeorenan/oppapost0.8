
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

    if (auth.response) {
        return auth.response;
    }

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
    };

    try {
      body = await request.json();
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
          {
            error: `${field} must be a valid non-negative amount.`,
          },
          { status: 400 }
        );
      }

      data[field] = value;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    const existing =
      await prisma.personalShopperRequest.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          quotedPrice: true,
          serviceFee: true,
        },
      });

    if (!existing) {
      return NextResponse.json(
        { error: "Personal Shopper request not found." },
        { status: 404 }
      );
    }

    const nextStatus = data.status ?? existing.status;

    if (nextStatus !== existing.status) {
      const permitted = allowedTransitions[
        existing.status as ShopperStatus
      ];

      if (!permitted.includes(nextStatus)) {
        return NextResponse.json(
          {
            error: `Cannot change status from ${existing.status} to ${nextStatus}.`,
          },
          { status: 400 }
        );
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
      if (
        finalQuotedPrice === null ||
        finalServiceFee === null
      ) {
        return NextResponse.json(
          {
            error:
              "Enter both the quoted product price and service fee before quoting or requesting payment.",
          },
          { status: 400 }
        );
      }
    }

    
  const result = await prisma.personalShopperRequest.updateMany({
    where: {
      id,
      status: existing.status,
    },
    data,
  });

  if (result.count === 0) {
    return NextResponse.json(
      {
        error:
          "This request was changed by another operation. Refresh the list and try again.",
      },
      { status: 409 }
    );
  }

  const updated = await prisma.personalShopperRequest.findUnique({
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

  if (!updated) {
    return NextResponse.json(
      { error: "Request could not be found after updating." },
      { status: 404 }
    );
  }

return NextResponse.json({ request: updated });


    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error(
      "Admin personal shopper update error:",
      error
    );

    return NextResponse.json(
      { error: "Unable to update personal shopper request." },
      { status: 500 }
    );
  }
}
