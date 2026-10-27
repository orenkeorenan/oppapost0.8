
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireAdminApi();

    if (auth.response) {
      return auth.response;
    }

    const { id } = await params;
    const shipmentId = Number(id);

    if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0) {
      return NextResponse.json(
        { error: "Invalid shipment ID." },
        { status: 400 }
      );
    }

    let body: { status?: unknown };

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
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (body.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Only the DELIVERED status is supported." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingShipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        select: {
          id: true,
          status: true,
          shippedAt: true,
          packages: {
            select: {
              package: {
                select: {
                  id: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!existingShipment) {
        return {
          error: "Shipment not found.",
          status: 404 as const,
        };
      }

      if (existingShipment.status === "DELIVERED") {
        return {
          error: "This shipment has already been delivered.",
          status: 409 as const,
        };
      }

      if (
        existingShipment.status !== "SHIPPING" ||
        !existingShipment.shippedAt
      ) {
        return {
          error:
            "This shipment must be dispatched before it can be marked as delivered.",
          status: 409 as const,
        };
      }

      if (existingShipment.packages.length === 0) {
        return {
          error: "A shipment must contain at least one package.",
          status: 409 as const,
        };
      }

      if (
        existingShipment.packages.some(
          ({ package: pkg }) => pkg.status !== "SHIPPED"
        )
      ) {
        return {
          error:
            "All packages must be SHIPPED before the shipment can be delivered.",
          status: 409 as const,
        };
      }

      const deliveredAt = new Date();

      const updatedShipment = await tx.shipment.updateMany({
        where: {
          id: shipmentId,
          status: "SHIPPING",
          shippedAt: { not: null },
          deliveredAt: null,
        },
        data: {
          status: "DELIVERED",
          deliveredAt,
        },
      });

      if (updatedShipment.count === 0) {
        return {
          error: "Shipment status changed. Refresh and try again.",
          status: 409 as const,
        };
      }

      const updatedPackages = await tx.package.updateMany({
        where: {
          id: {
            in: existingShipment.packages.map(
              ({ package: pkg }) => pkg.id
            ),
          },
          status: "SHIPPED",
        },
        data: {
          status: "DELIVERED",
        },
      });

      if (updatedPackages.count !== existingShipment.packages.length) {
        throw new Error("PACKAGE_DELIVERY_UPDATE_FAILED");
      }

      const shipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          deliveredAt: true,
        },
      });

      if (!shipment) {
        throw new Error("SHIPMENT_NOT_FOUND_AFTER_UPDATE");
      }

      return { shipment };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ shipment: result.shipment });
  } catch (error) {
    console.error("Admin shipment status update error:", error);

    return NextResponse.json(
      { error: "Unable to update shipment status." },
      { status: 500 }
    );
  }
}
