
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    console.error("Logout request failed.");

    return NextResponse.json(
      { message: "Unable to log out right now." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
