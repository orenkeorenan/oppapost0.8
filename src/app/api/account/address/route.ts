
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const recipientName = String(body.recipientName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();

    if (!recipientName || !phone || !address || !postalCode) {
      return NextResponse.json(
        { message: "Please complete all address fields." },
        { status: 400 },
      );
    }

    if (
      recipientName.length > 100 ||
      phone.length > 30 ||
      address.length > 255 ||
      postalCode.length > 20
    ) {
      return NextResponse.json(
        { message: "One or more fields exceed the allowed length." },
        { status: 400 },
      );
    }

    
    const city = String(body.city ?? "").trim();
    const stateProvince = String(body.stateProvince ?? "").trim();
    const country = String(body.country ?? "").trim();

    if (!city || !country) {
    return NextResponse.json(
        { message: "City and country are required." },
        { status: 400 },
    );
    }

    const savedAddress = await prisma.address.upsert({
    where: { userId: user.id },
    create: {
        userId: user.id,
        recipientName,
        phone,
        address,
        city,
        stateProvince: stateProvince || null,
        postalCode,
        country,
    },
    update: {
        recipientName,
        phone,
        address,
        city,
        stateProvince: stateProvince || null,
        postalCode,
        country,
    },
    });


    return NextResponse.json({
      success: true,
      message: "Address saved successfully.",
      address: savedAddress,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("Save address error:", error);

    return NextResponse.json(
      { message: "Unable to save your address right now." },
      { status: 500 },
    );
  }
}
