import Stripe from "stripe";
import { NextResponse } from "next/server";
import { STRIPE_PAYMENT_METHODS } from "@/lib/payment-methods";

export async function POST(request: Request) {
  const { cart, customer, total } = await request.json();
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "La clé secrète Stripe manque. Ajoutez STRIPE_SECRET_KEY pour activer le paiement réel." },
      { status: 400 },
    );
  }

  const stripe = new Stripe(apiKey, { apiVersion: "2026-09-30.endive" });
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/confirmation?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/paiement?status=cancelled`,
    customer_email: customer?.email || undefined,
    allowed_payment_method_types: STRIPE_PAYMENT_METHODS,
    line_items: cart.map((item: { name: string; price: number; quantity: number }) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: {
      customer_name: `${customer?.firstName ?? ""} ${customer?.lastName ?? ""}`.trim(),
      order_total: String(total ?? 0),
    },
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
