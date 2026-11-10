import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const packageId = Number(id);

    if (!Number.isSafeInteger(packageId) || packageId <= 0) {
      return NextResponse.json(
        { error: "Invalid package ID." },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    if (data.status !== "READY_TO_SHIP") {
      return NextResponse.json(
        { error: "Invalid package status." },
        { status: 400 }
      );
    }

    const weight = data.weight;

    if (
      typeof weight !== "number" ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      weight > 1000
    ) {
      return NextResponse.json(
        { error: "Enter a valid package weight greater than 0 kg." },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        shipmentItems: {
          select: { id: true },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 }
      );
    }

    if (pkg.shipmentItems.length > 0) {
      return NextResponse.json(
        { error: "This package is already assigned to a shipment." },
        { status: 409 }
      );
    }

    if (!["INCOMING", "RECEIVED"].includes(pkg.status)) {
      return NextResponse.json(
        { error: "This package cannot be moved to this status." },
        { status: 409 }
      );
    }

    const result = await prisma.package.updateMany({
      where: {
        id: packageId,
        status: pkg.status,
        shipmentItems: {
          none: {},
        },
      },
      data: {
        status: "READY_TO_SHIP",
        weight,
        receivedAt: pkg.receivedAt ?? new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Package status changed. Please refresh and try again." },
        { status: 409 }
      );
    }

    const updatedPackage = await prisma.package.findUnique({
      where: { id: packageId },
    });

    return NextResponse.json({
      success: true,
      message: "Package marked as ready to ship.",
      package: updatedPackage,
    });
  } catch (error) {
    console.error("Admin package status update error:", error);

    return NextResponse.json(
      { error: "Failed to update package status." },
      { status: 500 }
    );
  }
}
