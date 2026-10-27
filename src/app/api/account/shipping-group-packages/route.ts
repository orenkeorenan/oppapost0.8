
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getApiUser();

  if (auth.response) return auth.response;

  try {
    const packages = await prisma.package.findMany({
      where: {
        userId: auth.user.id,
        status: "READY_TO_SHIP",
      },
      select: {
        id: true,
        trackingNumber: true,
        weight: true,
        status: true,
        shippingGroupPackage: {
            select: {
            shippingGroupId: true,
            },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Load customer shipping group packages error:", error);

    return NextResponse.json(
      { error: "Unable to load your eligible packages." },
      { status: 500 }
    );
  }
}
