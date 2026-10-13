
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdminApi();

  if (auth.response) return auth.response;

  try {
    const products = await prisma.shopProduct.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve products." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if (auth.response) return auth.response;

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

    const name =
      typeof data.name === "string" ? data.name.trim() : "";
    const category =
      typeof data.category === "string"
        ? data.category.trim()
        : "";
    const description =
      typeof data.description === "string"
        ? data.description.trim()
        : "";
    const price = data.price;
    const imageUrl =
      typeof data.imageUrl === "string"
        ? data.imageUrl.trim()
        : "";
    const productUrl =
      typeof data.productUrl === "string"
        ? data.productUrl.trim()
        : "";
    const isPopular = data.isPopular ?? false;
    const isActive = data.isActive ?? true;
    const sortOrder = data.sortOrder ?? 0;

    if (
      !name ||
      name.length > 200 ||
      !category ||
      category.length > 100 ||
      description.length > 500 ||
      !Number.isInteger(price) ||
      typeof price !== "number" ||
      price < 0 ||
      price > 100_000_000 ||
      (imageUrl &&
        (imageUrl.length > 1000 ||
          !imageUrl.startsWith("https://"))) ||
      (productUrl &&
        (productUrl.length > 1000 ||
          !productUrl.startsWith("https://"))) ||
      typeof isPopular !== "boolean" ||
      typeof isActive !== "boolean" ||
      !Number.isInteger(sortOrder) ||
      typeof sortOrder !== "number" ||
      sortOrder < 0 ||
      sortOrder > 100_000
    ) {
      return NextResponse.json(
        { error: "Please check the product details." },
        { status: 400 },
      );
    }

    const product = await prisma.shopProduct.create({
      data: {
        name,
        category,
        description,
        price,
        imageUrl: imageUrl || null,
        productUrl: productUrl || null,
        isPopular,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}
