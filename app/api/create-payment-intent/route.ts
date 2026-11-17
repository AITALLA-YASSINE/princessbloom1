import Stripe from "stripe";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCheckoutTotals, validateCheckoutCustomer } from "@/lib/checkout";
import { getStripeSecretKey, stripeFailure } from "@/lib/stripe-config";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
    validateCheckoutCustomer(body.customer);
    getCheckoutTotals(body.cart, body.promoCode);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Commande invalide." }, { status: 400 });
  }
  try {
    const { cart, customer, promoCode } = body;
    const totals = getCheckoutTotals(cart, promoCode);
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-09-30.endive" });
    const idempotencyKey = createHash("sha256").update(JSON.stringify({ requestId: body.requestId, items: totals.items, customer, promoCode })).digest("hex");
    const intent = await stripe.paymentIntents.create({
      amount: totals.total,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      receipt_email: customer.email,
      shipping: { name: `${customer.firstName || ""} ${customer.lastName}`.trim(), phone: customer.phone || undefined, address: { line1: customer.address, line2: customer.address2 || undefined, postal_code: customer.postalCode, city: customer.city, country: customer.country } },
      description: totals.items.map((item: { name: string; quantity: number }) => `${item.quantity} × ${item.name}`).join(", "),
      metadata: { store: "princess_bloom", customer_first_name: String(customer.firstName || "").trim().slice(0, 250), customer_last_name: String(customer.lastName || "").trim().slice(0, 250), newsletter_opt_in: customer.newsletter === "true" ? "true" : "false", promo_code: promoCode || "", items: JSON.stringify(totals.items.map((item: { id: string; quantity: number }) => ({ id: item.id, quantity: item.quantity }))) },
    }, { idempotencyKey });
    return NextResponse.json({ clientSecret: intent.client_secret, amount: intent.amount });
  } catch (error) {
    const failure = stripeFailure(error);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
