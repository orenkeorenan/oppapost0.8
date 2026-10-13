
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
      body = await request.json();
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

    const existingShipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: { id: true, status: true },
    });

    if (!existingShipment) {
      return NextResponse.json(
        { error: "Shipment not found." },
        { status: 404 }
      );
    }

    if (existingShipment.status === "DELIVERED") {
      return NextResponse.json(
        { error: "This shipment has already been delivered." },
        { status: 409 }
      );
    }

    const result = await prisma.shipment.updateMany({
      where: {
        id: shipmentId,
        status: "SHIPPING",
      },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Shipment status changed. Refresh and try again." },
        { status: 409 }
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        deliveredAt: true,
      },
    });

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("Admin shipment status update error:", error);

    return NextResponse.json(
      { error: "Unable to update shipment status." },
      { status: 500 }
    );
  }
}
