
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await getApiUser();

  if (auth.response) return auth.response;

  if (auth.user.role !== "CUSTOMER") {
    return NextResponse.json(
      { error: "Only customers can submit purchase requests." },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const productName =
      typeof data.productName === "string"
        ? data.productName.trim()
        : "";

    const productUrl =
      typeof data.productUrl === "string"
        ? data.productUrl.trim()
        : "";

    if (!productName || productName.length > 200) {
      return NextResponse.json(
        { error: "Product name is required and must be 200 characters or fewer." },
        { status: 400 },
      );
    }

    if (productUrl) {
      if (productUrl.length > 1000) {
        return NextResponse.json(
          { error: "Product URL must be 1000 characters or fewer." },
          { status: 400 },
        );
      }

      try {
        const parsedUrl = new URL(productUrl);

        if (
          parsedUrl.protocol !== "https:" ||
          !parsedUrl.hostname ||
          parsedUrl.username ||
          parsedUrl.password
        ) {
          throw new Error("Invalid product URL.");
        }
      } catch {
        return NextResponse.json(
          { error: "Please provide a valid HTTPS product URL." },
          { status: 400 },
        );
      }
    }

    const createdRequest = await prisma.personalShopperRequest.create({
      data: {
        userId: auth.user.id,
        productName,
        productUrl: productUrl || null,
        status: "REQUESTED",
      },
      select: {
        id: true,
        productName: true,
        productUrl: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Your product request was submitted successfully.",
        request: createdRequest,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to submit your request. Please try again." },
      { status: 500 },
    );
  }
}
