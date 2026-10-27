
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const destinations = await prisma.shippingDestinationConfig.findMany({
      orderBy: [{ country: "asc" }, { city: "asc" }],
    });

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error("Load shipping destinations error:", error);
    return NextResponse.json(
      { error: "Unable to load shipping destinations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Invalid destination data." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;
  const country =
    typeof data.country === "string" ? data.country.trim() : "";
  const city =
    typeof data.city === "string" && data.city.trim()
      ? data.city.trim()
      : null;
  const groupTargetWeightGrams = data.groupTargetWeightGrams;
  const minimumBillableGrams = data.minimumBillableGrams;

  if (
    !country ||
    country.length > 100 ||
    typeof groupTargetWeightGrams !== "number" ||
    !Number.isSafeInteger(groupTargetWeightGrams) ||
    groupTargetWeightGrams <= 0 ||
    typeof minimumBillableGrams !== "number" ||
    !Number.isSafeInteger(minimumBillableGrams) ||
    minimumBillableGrams <= 0 ||
    (city !== null && city.length > 100)
  ) {
    return NextResponse.json(
      { error: "Enter a country and valid positive weights in grams." },
      { status: 400 }
    );
  }

  try {
    const destination = await prisma.shippingDestinationConfig.create({
      data: {
        country,
        city,
        groupTargetWeightGrams,
        minimumBillableGrams,
        isActive: true,
      },
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (error) {
    console.error("Create shipping destination error:", error);

    return NextResponse.json(
      {
        error:
          "Could not create destination. This country and city may already exist.",
      },
      { status: 409 }
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Invalid destination data." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;
  const id = data.id;
  const isActive = data.isActive;

  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof isActive !== "boolean"
  ) {
    return NextResponse.json(
      { error: "A valid destination ID and active status are required." },
      { status: 400 }
    );
  }

  try {
    const destination = await prisma.shippingDestinationConfig.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ destination });
  } catch (error) {
    console.error("Update shipping destination error:", error);

    return NextResponse.json(
      { error: "Unable to update this destination." },
      { status: 404 }
    );
  }
}
