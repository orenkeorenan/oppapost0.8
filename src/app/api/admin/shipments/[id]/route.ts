
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
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

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        packages: {
          include: {
            package: {
              select: {
                id: true,
                trackingNumber: true,
                source: true,
                status: true,
                weight: true,
                receivedAt: true,
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("Admin shipment detail error:", error);

    return NextResponse.json(
      { error: "Unable to load shipment details." },
      { status: 500 }
    );
  }
}
