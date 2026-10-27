
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await requireAdminApi();

    if (auth.response) {
        return auth.response;
    }

    const requests = await prisma.personalShopperRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            id: true,
            trackingNumber: true,
            status: true,
            weight: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Admin personal shopper list error:", error);

    return NextResponse.json(
      { error: "Unable to load personal shopper requests." },
      { status: 500 }
    );
  }
}

