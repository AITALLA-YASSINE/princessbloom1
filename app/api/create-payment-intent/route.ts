import Stripe from "stripe";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCheckoutTotals, validateCheckoutCustomer } from "@/lib/checkout";
import { STRIPE_PAYMENT_METHODS } from "@/lib/payment-methods";

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
    const { cart, customer, promoCode } = body;
    const totals = getCheckoutTotals(cart, promoCode);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-09-30.endive" });
    const idempotencyKey = createHash("sha256").update(JSON.stringify({ requestId: body.requestId, items: totals.items, customer, promoCode })).digest("hex");
    const intent = await stripe.paymentIntents.create({
      amount: totals.total,
      currency: "eur",
      allowed_payment_method_types: STRIPE_PAYMENT_METHODS as Stripe.PaymentIntentCreateParams.AllowedPaymentMethodType[],
      receipt_email: customer.email,
      shipping: { name: `${customer.firstName || ""} ${customer.lastName}`.trim(), phone: customer.phone || undefined, address: { line1: customer.address, line2: customer.address2 || undefined, postal_code: customer.postalCode, city: customer.city, country: customer.country } },
      description: totals.items.map((item: { name: string; quantity: number }) => `${item.quantity} × ${item.name}`).join(", "),
      metadata: { newsletter_opt_in: customer.newsletter === "true" ? "true" : "false", promo_code: promoCode || "", items: JSON.stringify(totals.items.map((item: { id: string; quantity: number }) => ({ id: item.id, quantity: item.quantity }))) },
    }, { idempotencyKey });
    return NextResponse.json({ clientSecret: intent.client_secret, amount: intent.amount });
  } catch {
    return NextResponse.json({ error: "Impossible de préparer le paiement. Veuillez réessayer dans quelques instants." }, { status: 502 });
  }
}
