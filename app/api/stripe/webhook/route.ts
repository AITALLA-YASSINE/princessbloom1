import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripeSecretKey, stripeFailure } from "@/lib/stripe-config";
import { processStripePaymentEvent } from "@/lib/stripe-webhook";
import { persistStripeOrder } from "@/lib/d1-orders";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim().replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
  if (!webhookSecret || !/^whsec_[A-Za-z0-9]+$/.test(webhookSecret)) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  let stripe: Stripe;
  try { stripe = new Stripe(getStripeSecretKey(), { apiVersion: "2026-09-30.endive" }); }
  catch (error) {
    const failure = stripeFailure(error);
    return NextResponse.json({ error: "Webhook configuration unavailable.", code: failure.body.code }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    // Signature verification must use the untouched body, not parsed JSON.
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }
  const testMode = /^(?:sk|rk)_test_/.test(getStripeSecretKey());
  if (event.livemode === testMode) return NextResponse.json({ error: "Stripe mode mismatch." }, { status: 400 });

  try {
    const result = await processStripePaymentEvent(event, stripe, persistStripeOrder);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // A failure is not acknowledged as successful; Stripe can retry delivery.
    stripeFailure(error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
