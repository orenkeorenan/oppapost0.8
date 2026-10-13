
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const shipments = await prisma.shipment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        packages: {
          include: {
            package: {
              select: {
                trackingNumber: true,
                weight: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ shipments });
  } catch (error) {
    console.error("Admin shipment list error:", error);

    return NextResponse.json(
      { error: "Unable to load shipments." },
      { status: 500 }
    );
  }
}
