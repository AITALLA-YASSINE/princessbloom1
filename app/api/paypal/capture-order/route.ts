import { NextResponse } from "next/server";
import { createPayPalService } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createPayPalService().capture(body.orderId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Nous vérifions votre paiement PayPal. Ne payez pas une seconde fois ; utilisez le bouton de vérification." }, { status: 503 });
  }
}
