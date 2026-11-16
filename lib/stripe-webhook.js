const { getCheckoutTotals } = require('./checkout');

const STRIPE_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'payment_intent.processing',
];

// Stripe is the durable store for this first webhook integration. This does
// not pretend to create a local order, send an email or trigger fulfillment.
async function processStripePaymentEvent(event, stripe) {
  if (!STRIPE_WEBHOOK_EVENTS.includes(event.type)) return { ignored: true };
  const id = event.data?.object?.id;
  if (typeof id !== 'string' || !/^pi_[a-zA-Z0-9]+$/.test(id)) throw new Error('invalid_payment_intent');

  // Fetch the current state rather than trusting an old or out-of-order event.
  const intent = await stripe.paymentIntents.retrieve(id);
  if (intent.livemode !== event.livemode) throw new Error('stripe_event_mode_mismatch');
  const metadata = intent.metadata || {};
  if (metadata.store && metadata.store !== 'princess_bloom') return { ignored: true };
  if (!metadata.items) return { ignored: true };

  let totals;
  try { totals = getCheckoutTotals(JSON.parse(metadata.items), metadata.promo_code || ''); }
  catch { return { ignored: true }; }
  if (intent.currency !== 'eur' || intent.amount !== totals.total) throw new Error('stripe_order_amount_mismatch');

  const status = intent.status === 'succeeded' ? 'paid'
    : intent.status === 'canceled' ? 'canceled'
    : intent.status === 'processing' ? 'processing'
    : intent.status === 'requires_payment_method' && intent.last_payment_error ? 'failed'
    : 'pending';
  if (status === 'paid' && intent.amount_received !== totals.total) throw new Error('stripe_received_amount_mismatch');
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
