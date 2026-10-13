
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function requireUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/");
  }

  return user;
}



export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/account");
  }

  return user;
}


type ApiAuthResult =
  | {
      user: NonNullable<
        Awaited<ReturnType<typeof prisma.user.findUnique>>
      >;
      response: null;
    }
  | {
      user: null;
      response: NextResponse;
    };

export async function getApiUser(): Promise<ApiAuthResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function requireAdminApi(): Promise<ApiAuthResult> {
  const result = await getApiUser();

  if (result.response) {
    return result;
  }

  if (result.user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return result;
}
