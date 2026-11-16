import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCheckoutTotals, COUNTRIES } from "@/lib/checkout";
import { getStripeSecretKey, stripeFailure } from "@/lib/stripe-config";

// Checkout Studio form, using server-authoritative catalog prices.
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
    getCheckoutTotals(body.cart, body.promoCode);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Commande invalide." }, { status: 400 });
  }
  try {
    const totals = getCheckoutTotals(body.cart, body.promoCode);
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-09-30.endive" });
    const origin = new URL(request.url).origin;
    const metadata = { store: "princess_bloom", checkout_form: "true", promo_code: String(body.promoCode || "").trim().toUpperCase(), items: JSON.stringify(totals.items.map((item: { id: string; quantity: number }) => ({ id: item.id, quantity: item.quantity }))) };
    const idempotencyKey = typeof body.requestId === "string" && /^[a-zA-Z0-9-]{16,100}$/.test(body.requestId)
      ? createHash("sha256").update(JSON.stringify({ requestId: body.requestId, items: totals.items, promoCode: metadata.promo_code })).digest("hex") : undefined;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "form",
      billing_address_collection: "auto",
      phone_number_collection: { enabled: false },
      automatic_tax: { enabled: false },
      submit_type: "auto",
      integration_identifier: "custom_embedded_web_0001",
      return_url: `${origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      shipping_address_collection: { allowed_countries: COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] },
      shipping_options: [{ shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: 0, currency: "eur" }, display_name: "Livraison standard offerte", delivery_estimate: { minimum: { unit: "business_day", value: 5 }, maximum: { unit: "business_day", value: 10 } } } }],
      custom_fields: [
        { key: "first_name", label: { type: "custom", custom: "Prénom" }, type: "text", optional: true, text: { maximum_length: 100 } },
        { key: "last_name", label: { type: "custom", custom: "Nom" }, type: "text", text: { maximum_length: 100 } },
      ],
      line_items: [{ price_data: { currency: "eur", product_data: { name: "Votre commande Princess Bloom", description: totals.items.map((item: { name: string; quantity: number })=>`${item.quantity} × ${item.name}`).join(", ") }, unit_amount: totals.total }, quantity: 1 }],
      payment_intent_data: { metadata },
      metadata,
    }, idempotencyKey ? { idempotencyKey } : undefined);
    return NextResponse.json({ client_secret: session.client_secret, sessionId: session.id, amount: session.amount_total });
  } catch (error) {
    const failure = stripeFailure(error);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
