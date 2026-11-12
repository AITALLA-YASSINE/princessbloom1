import Stripe from "stripe";
import { NextResponse } from "next/server";
import { STRIPE_PAYMENT_METHODS } from "@/lib/payment-methods";
import { getCheckoutTotals, validateCheckoutCustomer } from "@/lib/checkout";

// Preserve the hosted checkout endpoint for existing links with the same catalog totals.
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
    validateCheckoutCustomer(body.customer);
    getCheckoutTotals(body.cart, body.promoCode);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Commande invalide." }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Le paiement est momentanément indisponible. Veuillez réessayer plus tard." }, { status: 503 });
  try {
    const { customer } = body;
    const totals = getCheckoutTotals(body.cart, body.promoCode);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-09-30.endive" });
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement?status=cancelled`,
      customer_email: customer.email,
      allowed_payment_method_types: STRIPE_PAYMENT_METHODS,
      line_items: [{ price_data: { currency: "eur", product_data: { name: "Votre commande Princess Bloom", description: totals.items.map((item: { name: string; quantity: number })=>`${item.quantity} × ${item.name}`).join(", ") }, unit_amount: totals.total }, quantity: 1 }],
      payment_intent_data: { shipping: { name: `${customer.firstName || ""} ${customer.lastName}`.trim(), address: { line1: customer.address, line2: customer.address2 || undefined, postal_code: customer.postalCode, city: customer.city, country: customer.country } } },
      metadata: { customer_name: `${customer.firstName || ""} ${customer.lastName}`.trim(), order_total: String(totals.total/100) },
    });
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch {
    return NextResponse.json({ error: "Impossible de préparer le paiement. Veuillez réessayer dans quelques instants." }, { status: 502 });
  }
}
