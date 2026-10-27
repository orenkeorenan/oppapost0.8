
import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getApiUser();

    if (auth.response) return auth.response;

    if (auth.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can access payment instructions." },
        { status: 403 }
      );
    }

    const bankName = process.env.OPPAPOST_BANK_NAME?.trim();
    const accountHolder = process.env.OPPAPOST_BANK_ACCOUNT_HOLDER?.trim();
    const accountNumber = process.env.OPPAPOST_BANK_ACCOUNT_NUMBER?.trim();
    const instructions = process.env.OPPAPOST_PAYMENT_INSTRUCTIONS?.trim();

    if (!bankName || !accountHolder || !accountNumber) {
      return NextResponse.json(
        { error: "Payment instructions are not configured yet." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      bankName,
      accountHolder,
      accountNumber,
      instructions:
        instructions ||
        "Please transfer the exact quoted amount. Your order will be processed after payment is confirmed.",
    });
  } catch (error) {
    console.error("Shopper payment info error:", error);

    return NextResponse.json(
      { error: "Unable to load payment instructions." },
      { status: 500 }
    );
  }
}
