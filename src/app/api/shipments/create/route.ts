
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    
    const sessionUser = await requireUser();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid shipment details." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;
    const packageIds: unknown = data.packageIds;
    const method: unknown = data.method;


    if (
      !Array.isArray(packageIds) ||
      packageIds.length === 0 ||
      !packageIds.every(
        (id) => Number.isSafeInteger(id) && id > 0
      ) ||
      new Set(packageIds).size !== packageIds.length ||
      (method !== "EMS" && method !== "AIR_CARGO")
    ) {
      return NextResponse.json(
        { error: "Invalid shipment details." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { address: true },
    });

    if (!user?.address) {
      return NextResponse.json(
        { error: "Please save a delivery address first." },
        { status: 400 }
      );
    }
    const address = user.address;

    const isIndonesia =
      address.country.trim().toLowerCase() === "indonesia";

    if (method === "AIR_CARGO" && !isIndonesia) {
      return NextResponse.json(
        { error: "Air Cargo is only available for Indonesia." },
        { status: 400 }
      );
    }

    const createdShipment = await prisma.$transaction(async (tx) => {
      const packages = await tx.package.findMany({
        where: {
          id: { in: packageIds as number[] },
          userId: sessionUser.id,
          status: "READY_TO_SHIP",
          shipmentItems: { none: {} },
          shippingGroupPackage: { is: null },
        },
        select: {
          id: true,
          weight: true,
        },
      });

      if (packages.length !== packageIds.length) {
        throw new Error("PACKAGES_UNAVAILABLE");
      }

      const trackingNumber = `OPP-${crypto.randomUUID()
        .replaceAll("-", "")
        .slice(0, 12)
        .toUpperCase()}`;

      const shipment = await tx.shipment.create({
        data: {
          userId: sessionUser.id,
          method,
          trackingNumber,
          weight: packages.reduce(
            (total, pkg) => total + pkg.weight,
            0
          ),
          status: "PENDING_DISPATCH",
          recipientName: address.recipientName,
          deliveryPhone: address.phone,
          deliveryAddress: address.address,
          deliveryCity: address.city,
          deliveryState: address.stateProvince,
          deliveryPostalCode: address.postalCode,
          deliveryCountry: address.country,
          packages: {
            create: packages.map((pkg) => ({
              packageId: pkg.id,
            })),
          },
        },
        select: {
          id: true,
          trackingNumber: true,
        },
      });

    

      return shipment;
    });

    return NextResponse.json(
      { shipment: createdShipment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PACKAGES_UNAVAILABLE") {
      return NextResponse.json(
        { error: "One or more packages are no longer available to ship." },
        { status: 409 }
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Please try submitting the shipment again." },
        { status: 409 }
      );
    }

    console.error("Shipment creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create shipment right now." },
      { status: 500 }
    );
  }
}
