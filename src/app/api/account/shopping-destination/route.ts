
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getApiUser();

    if (auth.response) {
      return auth.response;
    }

    return NextResponse.json({
      success: true,
      destination: {
        country: auth.user.shoppingCountry,
        city: auth.user.shoppingCity,
        region: auth.user.shoppingRegion,
      },
    });
  } catch (error) {
    console.error("Get shopping destination error:", error);

    return NextResponse.json(
      { message: "Unable to load your shopping destination." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getApiUser();

    if (auth.response) {
      return auth.response;
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const getField = (value: unknown): string | null => {
      if (value === undefined || value === null) return "";
      if (typeof value !== "string") return null;
      return value.trim();
    };

    const country = getField(data.country);
    const city = getField(data.city);
    const region = getField(data.region);

    if (country === null || city === null || region === null) {
      return NextResponse.json(
        { message: "Country, city, and region must be text." },
        { status: 400 },
      );
    }

    if (
      country.length > 100 ||
      city.length > 100 ||
      region.length > 100
    ) {
      return NextResponse.json(
        { message: "Each destination field must be 100 characters or fewer." },
        { status: 400 },
      );
    }

    if (Boolean(country) !== Boolean(city)) {
      return NextResponse.json(
        { message: "Please provide both country and city, or clear both." },
        { status: 400 },
      );
    }

    const savedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        shoppingCountry: country || null,
        shoppingCity: city || null,
        shoppingRegion: country && city ? region || null : null,
      },
      select: {
        shoppingCountry: true,
        shoppingCity: true,
        shoppingRegion: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: country
        ? "Shopping destination saved successfully."
        : "Shopping destination cleared.",
      destination: {
        country: savedUser.shoppingCountry,
        city: savedUser.shoppingCity,
        region: savedUser.shoppingRegion,
      },
    });
  } catch (error) {
    console.error("Save shopping destination error:", error);

    return NextResponse.json(
      { message: "Unable to save your shopping destination right now." },
      { status: 500 },
    );
  }
}
