const test = require('node:test');
const assert = require('node:assert/strict');
const Stripe = require('stripe');
const { STRIPE_WEBHOOK_EVENTS, processStripePaymentEvent } = require('../lib/stripe-webhook');

function fixture(overrides = {}) {
  const intent = { id: 'pi_example123', livemode: false, status: 'succeeded', amount: 3999, amount_received: 3999, currency: 'eur', metadata: { store: 'princess_bloom', items: JSON.stringify([{ id: 'princessbloom-ceinture', quantity: 1 }]) }, ...overrides };
  const event = { id: 'evt_example123', type: 'payment_intent.succeeded', livemode: false, data: { object: { id: intent.id } } };
  const updates = [];
  const stripe = { paymentIntents: { retrieve: async () => intent, update: async (...args) => { updates.push(args); return intent; } } };
  return { event, intent, stripe, updates };
}

test('webhook authenticates raw signatures and rejects modified or stale payloads', () => {
  const stripe = new Stripe('sk_test_example123');
  const secret = 'whsec_example123';
  const payload = JSON.stringify(fixture().event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(stripe.webhooks.constructEvent(payload, signature, secret).id, 'evt_example123');
  assert.throws(() => stripe.webhooks.constructEvent(payload + ' ', signature, secret));
  assert.throws(() => stripe.webhooks.constructEvent(payload, signature, 'whsec_wrongsecret'));
  const expired = stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: Math.floor(Date.now() / 1000) - 600 });
  assert.throws(() => stripe.webhooks.constructEvent(payload, expired, secret));
});

test('verified webhook records a paid marker only after checking the current Stripe payment and catalog total', async () => {
  const f = fixture();
  assert.deepEqual(await processStripePaymentEvent(f.event, f.stripe), { status: 'paid' });
  assert.equal(f.updates.length, 1);
  assert.equal(f.updates[0][1].metadata.princessbloom_payment_status, 'paid');
  assert.equal(f.updates[0][2].idempotencyKey, 'princess-bloom-webhook:evt_example123:paid');
});

test('replayed webhook does not write or fulfill a paid payment again', async () => {
  const f = fixture();
  f.intent.metadata.princessbloom_payment_status = 'paid';
  assert.deepEqual(await processStripePaymentEvent(f.event, f.stripe), { duplicate: true, status: 'paid' });
  assert.equal(f.updates.length, 0);
});

test('late failure notification uses the latest Stripe state instead of marking a successful payment failed', async () => {
  const f = fixture();
  f.event.type = 'payment_intent.payment_failed';
  f.event.data.object.status = 'requires_payment_method';
  assert.equal((await processStripePaymentEvent(f.event, f.stripe)).status, 'paid');
  assert.equal(f.updates[0][1].metadata.princessbloom_payment_status, 'paid');
});

test('failure and cancellation never overwrite a paid marker, even with concurrent deliveries', async () => {
  for (const [status, error] of [['requires_payment_method', { code: 'card_declined' }], ['canceled', null], ['processing', null]]) {
    const f = fixture({ status, last_payment_error: error, amount_received: 0 });
    await processStripePaymentEvent(f.event, f.stripe);
    assert.ok(!Object.hasOwn(f.updates[0][1].metadata, 'princessbloom_payment_status'));
    assert.ok(f.updates[0][1].metadata.princessbloom_last_nonpaid_status);
  }
});

test('webhook rejects mismatched mode, totals and insufficient received amounts', async () => {
  for (const changes of [{ livemode: true }, { amount: 1 }, { currency: 'usd' }, { amount_received: 1 }]) {
    const f = fixture(changes);
    await assert.rejects(processStripePaymentEvent(f.event, f.stripe));
    assert.equal(f.updates.length, 0);
  }
});

test('unrelated events or payments are ignored without creating a store order', async () => {
  const ignored = fixture(); ignored.event.type = 'customer.created';
  assert.deepEqual(await processStripePaymentEvent(ignored.event, {}), { ignored: true });
  for (const metadata of [{ store: 'another_store' }, {}, { items: 'not JSON' }]) {
    const f = fixture({ metadata });
    assert.deepEqual(await processStripePaymentEvent(f.event, f.stripe), { ignored: true });
    assert.equal(f.updates.length, 0);
  }
  assert.equal(STRIPE_WEBHOOK_EVENTS.length, 4);
});

test('temporary persistence failures propagate so Stripe retries instead of losing the event', async () => {
  const f = fixture();
  f.stripe.paymentIntents.update = async () => { throw new Error('temporary network failure'); };
  await assert.rejects(processStripePaymentEvent(f.event, f.stripe), /temporary network failure/);
});

test('Checkout form enriches the D1 order with verified session contact, delivery and separate names', async () => {
  const f = fixture(); f.intent.metadata.checkout_form = 'true';
  const session = { id: 'cs_test_checkout123', livemode: false, amount_total: 3999, currency: 'eur',
    customer_details: { email: 'checkout@example.com', phone: null },
    collected_information: { shipping_details: { name: 'Marie Claire De La Tour', address: { line1: '1 rue des Roses', postal_code: '75002', city: 'Paris', country: 'FR' } } },
    custom_fields: [{ key: 'first_name', text: { value: 'Marie Claire' } }, { key: 'last_name', text: { value: 'De La Tour' } }] };
  f.stripe.checkout = { sessions: { list: async params => { assert.equal(params.payment_intent, f.intent.id); return { data: [session] }; } } };
  let saved;
  await processStripePaymentEvent(f.event, f.stripe, async data => { saved = data; });
  assert.equal(saved.intent.receipt_email, 'checkout@example.com');
  assert.equal(saved.intent.shipping.address.city, 'Paris');
  assert.equal(saved.intent.metadata.customer_first_name, 'Marie Claire');
  assert.equal(saved.intent.metadata.customer_last_name, 'De La Tour');
  assert.equal(saved.intent.checkout_session_id, session.id);
});

test('Checkout success retries until customer data is ready and rejects inconsistent sessions', async () => {
  for (const session of [undefined, { livemode: true, amount_total: 3999, currency: 'eur' }, { livemode: false, amount_total: 1, currency: 'eur' }, { livemode: false, amount_total: 3999, currency: 'eur' }]) {
    const f = fixture(); f.intent.metadata.checkout_form = 'true';
    f.stripe.checkout = { sessions: { list: async () => ({ data: session ? [session] : [] }) } };
    let saved = false;
    await assert.rejects(processStripePaymentEvent(f.event, f.stripe, async () => { saved = true; }));
    assert.equal(saved, false); assert.equal(f.updates.length, 0);
  }
});
