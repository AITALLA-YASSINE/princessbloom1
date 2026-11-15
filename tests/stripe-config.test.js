const test = require('node:test');
const assert = require('node:assert/strict');
const { getStripeSecretKey, stripeFailure } = require('../lib/stripe-config');

test('Stripe accepts matching test or live keys and removes pasted outer whitespace and quotes', () => {
  assert.equal(getStripeSecretKey({ STRIPE_SECRET_KEY: '  "sk_test_example123"\n', NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_example456' }), 'sk_test_example123');
  assert.equal(getStripeSecretKey({ STRIPE_SECRET_KEY: 'sk_live_example123', NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_live_example456' }), 'sk_live_example123');
});

test('Stripe rejects missing secrets, public keys pasted as secrets and mismatched modes', () => {
  for (const [env, code] of [
    [{}, 'stripe_secret_missing'],
    [{ STRIPE_SECRET_KEY: 'pk_live_example123' }, 'stripe_secret_invalid'],
    [{ STRIPE_SECRET_KEY: 'sk_live_example123', NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'sk_live_example456' }, 'stripe_public_invalid'],
    [{ STRIPE_SECRET_KEY: 'sk_test_example123', NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_live_example456' }, 'stripe_mode_mismatch'],
  ]) assert.throws(() => getStripeSecretKey(env), error => error.code === code);
});

test('Stripe diagnostics identify authentication failures without logging or returning key-bearing messages', t => {
  const logs = [];
  t.mock.method(console, 'error', (...args) => logs.push(args));
  const secret = 'sk_live_doNotExposeThisKey';
  const response = stripeFailure({ type: 'StripeAuthenticationError', message: `Invalid API key: ${secret}`, code: secret, param: secret });
  assert.equal(response.status, 503);
  assert.equal(response.body.code, 'stripe_authentication_failed');
  assert.ok(!JSON.stringify([response, logs]).includes(secret));
});

test('Stripe request diagnostics preserve only non-sensitive request metadata', t => {
  const logs = [];
  t.mock.method(console, 'error', (...args) => logs.push(args));
  const response = stripeFailure({ type: 'StripeInvalidRequestError', code: 'parameter_unknown', param: 'currency', requestId: 'req_example123' });
  assert.equal(response.status, 502);
  assert.equal(response.body.code, 'stripe_invalid_request');
  assert.deepEqual(logs[0][1], { code: 'stripe_invalid_request', type: 'StripeInvalidRequestError', stripeCode: 'parameter_unknown', param: 'currency', requestId: 'req_example123' });
});
