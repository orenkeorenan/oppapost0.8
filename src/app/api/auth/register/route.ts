
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  const name =
    typeof input.name === "string" ? input.name.trim() : "";
  const email =
    typeof input.email === "string"
      ? input.email.trim().toLowerCase()
      : "";
  const password =
    typeof input.password === "string" ? input.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (name.length > 100) {
    return NextResponse.json(
      { message: "Name must be 100 characters or fewer." },
      { status: 400 }
    );
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  if (password.length < 12 || password.length > 72) {
    return NextResponse.json(
      { message: "Password must be between 12 and 72 characters." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created. You can now log in.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Registration request failed.");

    return NextResponse.json(
      { message: "Unable to create your account right now." },
      { status: 500 }
    );
  }
}
