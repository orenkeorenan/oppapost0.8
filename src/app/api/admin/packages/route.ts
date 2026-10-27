
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdminApi();

    if (auth.response) {
      return auth.response;
    }

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
    const auth = await requireAdminApi();

    if (auth.response) {
      return auth.response;
    }

    let body: Record<string, unknown>;

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

      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

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
      !Number.isSafeInteger(userId) ||
      userId <= 0 ||
      typeof body.weight !== "number" ||
      !Number.isFinite(weight) ||
      weight <= 0 ||
      !source
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid customer, tracking number, source, and positive numeric weight.",
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
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That tracking number is already registered." },
        { status: 409 }
      );
    }

    console.error("Admin package creation error:", error);

    return NextResponse.json(
      { error: "Unable to register package." },
      { status: 500 }
    );
  }
}
