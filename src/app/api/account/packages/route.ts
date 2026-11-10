import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getApiUser();

  if (auth.response) {
    return auth.response;
  }

  if (auth.user.role !== "CUSTOMER") {
    return NextResponse.json(
      { error: "Only customers can register packages." },
      { status: 403 }
    );
  }

  try {
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

    const trackingNumber =
      typeof data.trackingNumber === "string"
        ? data.trackingNumber.trim()
        : "";

    const productName =
      typeof data.productName === "string"
        ? data.productName.trim()
        : "";

    const notes =
      typeof data.notes === "string"
        ? data.notes.trim()
        : "";

    if (!trackingNumber || trackingNumber.length > 200) {
      return NextResponse.json(
        { error: "Tracking number is required and must be 200 characters or fewer." },
        { status: 400 }
      );
    }

    if (!productName || productName.length > 200) {
      return NextResponse.json(
        { error: "Product name is required and must be 200 characters or fewer." },
        { status: 400 }
      );
    }

    if (notes.length > 5000) {
      return NextResponse.json(
        { error: "Notes must be 5000 characters or fewer." },
        { status: 400 }
      );
    }

    const existingPackage = await prisma.package.findUnique({
      where: { trackingNumber },
      select: { id: true },
    });

    if (existingPackage) {
      return NextResponse.json(
        { error: "This tracking number has already been registered." },
        { status: 409 }
      );
    }

    const newPackage = await prisma.package.create({
      data: {
        userId: auth.user.id,
        trackingNumber,
        source: "STORE",
        status: "INCOMING",
        weight: 0,
        productName,
        notes: notes || null,
        receivedAt: null,
      },
      select: {
        id: true,
        trackingNumber: true,
        productName: true,
        notes: true,
        source: true,
        status: true,
        weight: true,
        receivedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Incoming package registered successfully.",
        package: newPackage,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This tracking number has already been registered." },
        { status: 409 }
      );
    }

    console.error("Customer package registration error:", error);

    return NextResponse.json(
      { error: "Unable to register package." },
      { status: 500 }
    );
  }
}
