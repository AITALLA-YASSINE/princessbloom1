import { NextResponse } from "next/server";
import { createPayPalService } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const result = await createPayPalService().webhook(request.headers, event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    return NextResponse.json({ error: "PayPal notification unavailable." }, { status: code === "paypal_signature_invalid" || code === "paypal_signature_missing" ? 400 : 500 });
  }
}
