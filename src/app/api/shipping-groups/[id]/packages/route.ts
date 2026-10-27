
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};


function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await getApiUser();

  if (auth.response) return auth.response;

  const groupId = parsePositiveInteger((await context.params).id);

  if (groupId === null) {
    return NextResponse.json(
      { error: "Invalid shipping group." },
      { status: 400 }
    );
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

  const packageId =
    typeof body === "object" &&
    body !== null &&
    "packageId" in body &&
    typeof body.packageId === "number" &&
    Number.isSafeInteger(body.packageId) &&
    body.packageId > 0
      ? body.packageId
      : null;

  if (packageId === null) {
    return NextResponse.json(
      { error: "A valid package ID is required." },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const group = await tx.shippingGroup.findUnique({
        where: { id: groupId },
      });

      if (!group || group.status !== "OPEN") {
        return { error: "This shipping group is not open.", status: 409 };
      }

      const pkg = await tx.package.findFirst({
        where: {
            id: packageId,
            userId: auth.user.id,
            status: "READY_TO_SHIP",
            shipmentItems: { none: {} },
            shippingGroupPackage: { is: null },
        },
        select: {
            id: true,
            weight: true,
            status: true,
        },
      });

      if (!pkg) {
        return {
          error: "Package is unavailable, already shipped, or already assigned to a shipping group.",
          status: 404,
        };
      }

      if (pkg.status !== "READY_TO_SHIP") {
        return {
          error: "Only packages marked READY_TO_SHIP can join a group.",
          status: 400,
        };
      }

      const user = await tx.user.findUnique({
        where: { id: auth.user.id },
        select: {
          shoppingCountry: true,
          shoppingCity: true,
        },
      });

      const countryMatches =
        user?.shoppingCountry?.trim().toLowerCase() ===
        group.destinationCountry.trim().toLowerCase();

      const cityMatches =
        !group.destinationCity ||
        user?.shoppingCity?.trim().toLowerCase() ===
          group.destinationCity.trim().toLowerCase();

      if (!countryMatches || !cityMatches) {
        return {
          error: "Your saved destination does not match this group.",
          status: 400,
        };
      }

      await tx.shippingGroupPackage.create({
        data: {
          shippingGroupId: group.id,
          packageId: pkg.id,
        },
      });

      const members = await tx.shippingGroupPackage.findMany({
        where: { shippingGroupId: group.id },
        select: { package: { select: { weight: true } } },
      });

      const currentWeightGrams = members.reduce(
        (sum, item) => sum + Math.round(item.package.weight * 1000),
        0
      );

      const status =
        currentWeightGrams >= group.targetWeightGrams ? "READY" : "OPEN";

      await tx.shippingGroup.update({
        where: { id: group.id },
        data: { status },
      });

      return {
        success: true,
        groupId: group.id,
        currentWeightGrams,
        targetWeightGrams: group.targetWeightGrams,
        status,
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: Number(result.status) }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Join shipping group error:", error);

    return NextResponse.json(
      { error: "Unable to join group. The package may already be in a group." },
      { status: 409 }
    );
  }
}


export async function DELETE(request: Request, context: RouteContext) {
  const auth = await getApiUser();

  if (auth.response) return auth.response;

  const groupId = parsePositiveInteger((await context.params).id);
  const { searchParams } = new URL(request.url);
  const packageId = parsePositiveInteger(searchParams.get("packageId") ?? "");

  if (groupId === null || packageId === null) {
    return NextResponse.json(
      { error: "A valid group ID and package ID are required." },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const group = await tx.shippingGroup.findUnique({
        where: { id: groupId },
      });

      if (!group || !["OPEN", "READY"].includes(group.status)) {
        return {
          error: "Packages cannot be removed from this group now.",
          status: 409,
        };
      }

        const membership = await tx.shippingGroupPackage.findFirst({
            where: {
                shippingGroupId: Number(groupId),
                packageId: Number(packageId),
                package: { userId: auth.user.id },
            },
            select: { id: true },
        });

      if (!membership) {
        return {
          error: "That package is not in this group under your account.",
          status: 404,
        };
      }

      await tx.shippingGroupPackage.delete({
        where: { id: membership.id },
      });

      const members = await tx.shippingGroupPackage.findMany({
        where: { shippingGroupId: groupId },
        select: { package: { select: { weight: true } } },
      });

      const currentWeightGrams = members.reduce(
        (sum, item) => sum + Math.round(item.package.weight * 1000),
        0
      );

      const status =
        currentWeightGrams >= group.targetWeightGrams ? "READY" : "OPEN";

        await tx.shippingGroup.update({
            where: { id: Number(groupId) },
            data: { status },
        });

      return {
        success: true,
        groupId,
        currentWeightGrams,
        targetWeightGrams: group.targetWeightGrams,
        status,
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: Number(result.status) }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Leave shipping group error:", error);

    return NextResponse.json(
      { error: "Unable to remove package from the group." },
      { status: 500 }
    );
  }
}
