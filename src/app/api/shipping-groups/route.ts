
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function maskName(name: string): string {
  const chars = Array.from(name.trim());

  if (chars.length <= 1) return "*";
  if (chars.length === 2) return `${chars[0]}*`;

  return `${chars[0]}${"*".repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}

export async function GET() {
  try {
    const auth = await getApiUser();

    if (auth.response) {
      return auth.response;
    }

    const { shoppingCountry, shoppingCity } = auth.user;

    if (!shoppingCountry) {
      return NextResponse.json(
        {
          success: false,
          error: "Please set your shopping destination first.",
          groups: [],
        },
        { status: 400 }
      );
    }

    const groups = await prisma.shippingGroup.findMany({
      where: {
        destinationCountry: shoppingCountry,
        status: "OPEN",
        OR: [
          { destinationCity: shoppingCity },
          { destinationCity: null },
        ],
      },
      include: {
        packages: {
          select: {
            package: {
              select: {
                weight: true,
                user: {
                  select: {
                    name: true,
                    groupShippingNameConsent: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = groups.map((group) => {
      const currentWeightGrams = group.packages.reduce(
        (total, item) =>
          total + Math.round(item.package.weight * 1000),
        0
      );

      const participants = Array.from(
        new Map(
          group.packages
            .filter(
              (item) => item.package.user.groupShippingNameConsent
            )
            .map((item) => [
              item.package.user.name,
              maskName(item.package.user.name),
            ])
        ).values()
      );

      return {
        id: group.id,
        destinationCountry: group.destinationCountry,
        destinationCity: group.destinationCity,
        targetWeightGrams: group.targetWeightGrams,
        minimumBillableGrams: group.minimumBillableGrams,
        currentWeightGrams,
        remainingWeightGrams: Math.max(
          0,
          group.targetWeightGrams - currentWeightGrams
        ),
        progressPercent: Math.min(
          100,
          Math.round(
            (currentWeightGrams / group.targetWeightGrams) * 100
          )
        ),
        status: group.status,
        createdAt: group.createdAt,
        participants,
      };
    });

    return NextResponse.json({
      success: true,
      groups: result,
    });
  } catch (error) {
    console.error("Shipping group list error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to load shipping groups." },
      { status: 500 }
    );
  }
}
