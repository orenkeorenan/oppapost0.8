
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const packages = await prisma.package.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Admin package list error:", error);

    return NextResponse.json(
      { error: "Unable to load packages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const trackingNumber =
      typeof body.trackingNumber === "string"
        ? body.trackingNumber.trim()
        : "";

    const userId = Number(body.userId);
    const weight = Number(body.weight);

    const source =
      body.source === "PERSONAL_SHOPPER"
        ? "PERSONAL_SHOPPER"
        : body.source === "STORE"
          ? "STORE"
          : null;

    if (
      !trackingNumber ||
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      !source
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid customer, tracking number, source, and positive weight.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "CUSTOMER",
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No customer account was found for that selection." },
        { status: 404 }
      );
    }

    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber },
      select: { id: true },
    });

    if (existingPackage) {
      return NextResponse.json(
        { error: "That tracking number is already registered." },
        { status: 409 }
      );
    }

    const newPackage = await prisma.package.create({
      data: {
        userId: user.id,
        trackingNumber,
        source,
        weight,
        status: "RECEIVED",
        receivedAt: new Date(),
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

    return NextResponse.json({ package: newPackage }, { status: 201 });
  } catch (error) {
    console.error("Admin package creation error:", error);

    return NextResponse.json(
      { error: "Unable to register package." },
      { status: 500 }
    );
  }
}
