import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdminApi();

    if (auth.response) {
      return auth.response;
    }

    const [configs, groups] = await Promise.all([
      prisma.shippingDestinationConfig.findMany({
        where: { isActive: true },
        orderBy: [
          { country: "asc" },
          { city: "asc" },
        ],
      }),
      prisma.shippingGroup.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({ configs, groups });
  } catch (error) {
    console.error("Admin shipping groups list error:", error);

    return NextResponse.json(
      { error: "Unable to load shipping group data." },
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("configId" in body) ||
      typeof body.configId !== "number" ||
      !Number.isInteger(body.configId) ||
      body.configId <= 0
    ) {
      return NextResponse.json(
        { error: "Select a valid destination configuration." },
        { status: 400 }
      );
    }

    const config = await prisma.shippingDestinationConfig.findFirst({
      where: {
        id: body.configId,
        isActive: true,
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: "The destination configuration is unavailable." },
        { status: 404 }
      );
    }

    const existingGroup = await prisma.shippingGroup.findFirst({
      where: {
        destinationCountry: config.country,
        destinationCity: config.city,
        status: "OPEN",
      },
      select: { id: true },
    });

    if (existingGroup) {
      return NextResponse.json(
        {
          error: "An open group already exists for this destination.",
          groupId: existingGroup.id,
        },
        { status: 409 }
      );
    }

    const group = await prisma.shippingGroup.create({
      data: {
        destinationCountry: config.country,
        destinationCity: config.city,
        targetWeightGrams: config.groupTargetWeightGrams,
        minimumBillableGrams: config.minimumBillableGrams,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    console.error("Admin shipping group creation error:", error);

    return NextResponse.json(
      { error: "Unable to create shipping group." },
      { status: 500 }
    );
  }
}
