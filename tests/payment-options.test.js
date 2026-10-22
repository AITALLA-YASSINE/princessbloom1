const test = require('node:test');
const assert = require('node:assert/strict');

const { STRIPE_PAYMENT_METHODS } = require('../lib/payment-methods.js');

test('Stripe checkout includes Klarna when available', () => {
  assert.ok(STRIPE_PAYMENT_METHODS.includes('card'));
  assert.ok(STRIPE_PAYMENT_METHODS.includes('klarna'));
});
