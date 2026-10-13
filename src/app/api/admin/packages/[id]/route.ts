
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedStatuses = [
  "INCOMING",
  "RECEIVED",
  "READY_TO_SHIP",
] as const;

type EditableStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const packageId = Number(id);

    if (!Number.isInteger(packageId) || packageId <= 0) {
      return NextResponse.json(
        { error: "Invalid package ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = body.status as EditableStatus;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid package status." },
        { status: 400 }
      );
    }

    const existingPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        shipmentItems: {
          select: { id: true },
        },
      },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 }
      );
    }

    if (existingPackage.shipmentItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "This package is already assigned to a shipment. Its status is managed by the shipment workflow.",
        },
        { status: 409 }
      );
    }

    const allowedTransitions: Record<string, string[]> = {
      INCOMING: ["RECEIVED"],
      RECEIVED: ["READY_TO_SHIP"],
      READY_TO_SHIP: ["RECEIVED"],
    };

    if (!allowedTransitions[existingPackage.status]?.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot change package status from ${existingPackage.status} to ${status}.`,
        },
        { status: 409 }
      );
    }

    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data: {
        status,
        ...(status === "RECEIVED" && !existingPackage.receivedAt
          ? { receivedAt: new Date() }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error("Admin package status update error:", error);

    return NextResponse.json(
      { error: "Unable to update package status." },
      { status: 500 }
    );
  }
}
