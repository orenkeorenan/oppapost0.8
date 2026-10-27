
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await requireAdminApi();

    if (auth.response) return auth.response;

    const { id } = await params;
    const shipmentId = Number(id);

    if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0) {
      return NextResponse.json(
        { error: "Invalid shipment ID." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
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

      if (!shipment) {
        return {
          error: "Shipment not found.",
          status: 404 as const,
        };
      }

      if (shipment.status !== "PENDING_DISPATCH") {
        return {
          error: "Only pending or active shipments can be dispatched.",
          status: 409 as const,
        };
      }

      if (shipment.shippedAt) {
        return {
          error: "This shipment has already been dispatched.",
          status: 409 as const,
        };
      }

      
      if (shipment.packages.length === 0) {
        return {
          error: "A shipment must contain at least one package before dispatch.",
          status: 409 as const,
        };
      }

      if (
        shipment.packages.some(
          ({ package: pkg }) => pkg.status !== "READY_TO_SHIP"
        )
      ) {
        return {
          error: "All packages must be READY_TO_SHIP before dispatch.",
          status: 409 as const,
        };
      }

      const now = new Date();

      const updated = await tx.shipment.updateMany({
        where: {
          id: shipmentId,
          status: shipment.status,
          shippedAt: null,
        },
        data: {
          status: "SHIPPING",
          shippedAt: now,
        },
      });

      if (updated.count === 0) {
        return {
          error: "Shipment changed. Refresh and try again.",
          status: 409 as const,
        };
      }

      const updatedPackages = await tx.package.updateMany({
        where: {
          id: {
            in: shipment.packages.map(({ package: pkg }) => pkg.id),
          },
          status: "READY_TO_SHIP",
        },
        data: {
          status: "SHIPPED",
        },
      });

      if (updatedPackages.count !== shipment.packages.length) {
        throw new Error("PACKAGE_STATUS_UPDATE_FAILED");
      }

      return {
        success: true,
        shippedAt: now,
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin shipment dispatch error:", error);

    return NextResponse.json(
      { error: "Unable to dispatch shipment." },
      { status: 500 }
    );
  }
}
