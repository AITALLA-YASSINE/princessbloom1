import { NextResponse } from "next/server";
import { createPayPalService } from "@/lib/paypal";
import { getCheckoutTotals } from "@/lib/checkout";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); getCheckoutTotals(body.cart, body.promoCode); }
  catch { return NextResponse.json({ error: "Votre panier est invalide." }, { status: 400 }); }
  try {
    return NextResponse.json(await createPayPalService().create(body.cart, body.promoCode, body.requestId));
  } catch { return NextResponse.json({ error: "PayPal est momentanément indisponible. Aucun paiement n’a été confirmé." }, { status: 503 }); }
}
