
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth = await requireAdminApi();

    if (auth.response) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  email: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 20,
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Admin customer search error:", error);

    return NextResponse.json(
      { error: "Unable to search customers." },
      { status: 500 }
    );
  }
}

