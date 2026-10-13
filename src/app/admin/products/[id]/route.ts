
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const auth = await requireAdminApi();

  if (auth.response) return auth.response;

  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID." },
        { status: 400 },
      );
    }

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

    const input = body as Record<string, unknown>;

    const existing = await prisma.shopProduct.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 },
      );
    }

    const data: {
      name?: string;
      category?: string;
      description?: string;
      price?: number;
      imageUrl?: string | null;
      productUrl?: string | null;
      isPopular?: boolean;
      isActive?: boolean;
      sortOrder?: number;
    } = {};

    if ("name" in input) {
      if (
        typeof input.name !== "string" ||
        !input.name.trim() ||
        input.name.trim().length > 200
      ) {
        return NextResponse.json(
          { error: "Product name must be 1–200 characters." },
          { status: 400 },
        );
      }
      data.name = input.name.trim();
    }

    if ("category" in input) {
      if (
        typeof input.category !== "string" ||
        !input.category.trim() ||
        input.category.trim().length > 100
      ) {
        return NextResponse.json(
          { error: "Please provide a valid category." },
          { status: 400 },
        );
      }
      data.category = input.category.trim();
    }

    if ("description" in input) {
      if (
        typeof input.description !== "string" ||
        input.description.length > 500
      ) {
        return NextResponse.json(
          { error: "Description must be 500 characters or fewer." },
          { status: 400 },
        );
      }
      data.description = input.description.trim();
    }

    if ("price" in input) {
      if (
        typeof input.price !== "number" ||
        !Number.isInteger(input.price) ||
        input.price < 0 ||
        input.price > 100_000_000
      ) {
        return NextResponse.json(
          { error: "Please provide a valid price." },
          { status: 400 },
        );
      }
      data.price = input.price;
    }

    for (const field of ["imageUrl", "productUrl"] as const) {
      if (field in input) {
        const value = input[field];

        if (
          value !== null &&
          (typeof value !== "string" ||
            value.length > 1000 ||
            (value !== "" && !value.startsWith("https://")))
        ) {
          return NextResponse.json(
            { error: `${field} must be an HTTPS URL or empty.` },
            { status: 400 },
          );
        }

        data[field] =
          typeof value === "string" && value.trim()
            ? value.trim()
            : null;
      }
    }

    for (const field of ["isPopular", "isActive"] as const) {
      if (field in input) {
        if (typeof input[field] !== "boolean") {
          return NextResponse.json(
            { error: `${field} must be true or false.` },
            { status: 400 },
          );
        }
        data[field] = input[field];
      }
    }

    if ("sortOrder" in input) {
      if (
        typeof input.sortOrder !== "number" ||
        !Number.isInteger(input.sortOrder) ||
        input.sortOrder < 0 ||
        input.sortOrder > 100_000
      ) {
        return NextResponse.json(
          { error: "Please provide a valid display order." },
          { status: 400 },
        );
      }
      data.sortOrder = input.sortOrder;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No product changes provided." },
        { status: 400 },
      );
    }

    const product = await prisma.shopProduct.update({
      where: { id },
      data,
    });

    return NextResponse.json(product, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 },
    );
  }
}
