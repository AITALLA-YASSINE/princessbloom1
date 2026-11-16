const { getCheckoutTotals } = require('./checkout');

const STRIPE_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'payment_intent.processing',
];

async function processStripePaymentEvent(event, stripe, persistOrder) {
  if (!STRIPE_WEBHOOK_EVENTS.includes(event.type)) return { ignored: true };
  const id = event.data?.object?.id;
  if (typeof id !== 'string' || !/^pi_[a-zA-Z0-9]+$/.test(id)) throw new Error('invalid_payment_intent');

  // Fetch the current state rather than trusting an old or out-of-order event.
  let intent = await stripe.paymentIntents.retrieve(id);
  if (intent.livemode !== event.livemode) throw new Error('stripe_event_mode_mismatch');
  const metadata = intent.metadata || {};
  if (metadata.store && metadata.store !== 'princess_bloom') return { ignored: true };
  if (!metadata.items) return { ignored: true };

  let totals;
  try { totals = getCheckoutTotals(JSON.parse(metadata.items), metadata.promo_code || ''); }
  catch { return { ignored: true }; }
  if (intent.currency !== 'eur' || intent.amount !== totals.total) throw new Error('stripe_order_amount_mismatch');

  // Checkout collects contact, shipping and separate names inside its iframe.
  // Retrieve them server-side; never trust browser-submitted payment status.
  if (metadata.checkout_form === 'true') {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: id, limit: 1 });
    const session = sessions.data[0];
    if (!session || session.livemode !== intent.livemode || session.amount_total !== totals.total || session.currency !== 'eur') throw new Error('stripe_checkout_session_mismatch');
    const shipping = session.collected_information?.shipping_details || session.shipping_details || intent.shipping;
    const email = session.customer_details?.email || intent.receipt_email;
    const firstName = session.custom_fields?.find(field => field.key === 'first_name')?.text?.value;
    const lastName = session.custom_fields?.find(field => field.key === 'last_name')?.text?.value;
    // PaymentIntent success can precede Checkout finalization. Retry until its
    // contact and delivery data are available instead of recording an empty order.
    if (intent.status === 'succeeded' && (!email || !shipping?.address?.line1 || !lastName)) throw new Error('stripe_checkout_details_pending');
    intent = { ...intent, receipt_email: email, shipping: shipping ? { ...shipping, phone: shipping.phone || session.customer_details?.phone } : undefined,
      checkout_session_id: session.id,
      metadata: { ...metadata, ...(lastName ? { customer_first_name: firstName || '', customer_last_name: lastName } : {}) } };
  }

  const status = intent.status === 'succeeded' ? 'paid'
    : intent.status === 'canceled' ? 'canceled'
    : intent.status === 'processing' ? 'processing'
    : intent.status === 'requires_payment_method' && intent.last_payment_error ? 'failed'
    : 'pending';
  if (status === 'paid' && intent.amount_received !== totals.total) throw new Error('stripe_received_amount_mismatch');
  // Persist even when a previous delivery already set the Stripe marker.
  // A database failure propagates to the route so Stripe retries the delivery.
  if (persistOrder) await persistOrder({ event, intent, totals, status });
  if (metadata.princessbloom_payment_status === 'paid') return { duplicate: true, status: 'paid' };
  if (status !== 'paid' && metadata.princessbloom_last_nonpaid_status === status) return { duplicate: true, status };
  // Non-paid notifications never write the paid marker, even when different
  // deliveries race. Stripe merges metadata keys rather than replacing them.
  const update = status === 'paid'
    ? { princessbloom_payment_status: 'paid', princessbloom_last_event: event.id }
    : { princessbloom_last_nonpaid_status: status, princessbloom_last_nonpaid_event: event.id };
  await stripe.paymentIntents.update(id, {
    metadata: update,
  }, { idempotencyKey: `princess-bloom-webhook:${event.id}:${status}` });
  return { status };
}

module.exports = { STRIPE_WEBHOOK_EVENTS, processStripePaymentEvent };
