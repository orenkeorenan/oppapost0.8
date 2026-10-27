import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await getApiUser();

  if (response) return response;

  return NextResponse.json({
    success: true,
    consent: user.groupShippingNameConsent,
  });
}

export async function PUT(request: Request) {
  const { user, response } = await getApiUser();

  if (response) return response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("consent" in body) ||
    typeof body.consent !== "boolean"
  ) {
    return NextResponse.json(
      { success: false, error: "Consent must be true or false." },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { groupShippingNameConsent: body.consent },
    select: { groupShippingNameConsent: true },
  });

  return NextResponse.json({
    success: true,
    consent: updatedUser.groupShippingNameConsent,
  });
}
