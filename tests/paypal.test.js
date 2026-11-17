const test = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const { createPayPalService, getPayPalConfig } = require('../lib/paypal');

const env = { PAYPAL_CLIENT_ID: 'test-client', PAYPAL_CLIENT_SECRET: 'secret-not-logged', PAYPAL_WEBHOOK_ID: 'WH-example', PAYPAL_MODE: 'sandbox', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_D1_DATABASE_ID: '2af41e87-39c2-4241-8c08-9ec479e386ef', CLOUDFLARE_D1_API_TOKEN: 'test-d1-token' };
const cart = [{ id: 'princessbloom-ceinture', quantity: 1 }];
const orderId = 'PAYPALORDER1234567';
function fixture() {
  const db = new DatabaseSync(':memory:'); db.exec(readFileSync(require.resolve('../d1-schema.sql'),'utf8'));
  let captureCalls = 0, signatureValid = true, failWrite = false;
  const order = { id: orderId, status: 'APPROVED', payer: { email_address: 'buyer@example.com', name: { given_name: 'Marie Claire', surname: 'De La Tour' } }, purchase_units: [{ amount: { currency_code: 'EUR', value: '37.99' }, shipping: { name: { full_name: 'Marie Claire De La Tour' }, address: { address_line_1: '1 rue des Roses', postal_code: '75002', admin_area_2: 'Paris', country_code: 'FR' } } }] };
  const response = body => ({ ok: true, json: async () => body });
  const send = async (url, options) => {
    if (url.includes('api.cloudflare.com')) {
      const { sql, params } = JSON.parse(options.body);
      if (failWrite && sql.startsWith('UPDATE commandes_paypal')) throw Error('temporary');
      const statement = db.prepare(sql);
      const results = sql.startsWith('SELECT') ? statement.all(...params) : (statement.run(...params), []);
      return response({ success: true, result: [{ success: true, results }] });
    }
    assert.ok(url.startsWith('https://api-m.sandbox.paypal.com/'));
    if (url.endsWith('/v1/oauth2/token')) return response({ access_token: 'test-token' });
    if (url.endsWith('/verify-webhook-signature')) return response({ verification_status: signatureValid ? 'SUCCESS' : 'FAILURE' });
    if (url.endsWith('/v2/checkout/orders')) {
      const body = JSON.parse(options.body);
      assert.equal(body.purchase_units[0].amount.value, '37.99');
      assert.equal(body.intent, 'CAPTURE'); assert.ok(options.headers['PayPal-Request-Id']);
      return response({ id: orderId });
    }
    if (url.endsWith('/capture')) {
      captureCalls++; assert.equal(options.headers['PayPal-Request-Id'],`capture_${orderId}`);
      order.status = 'COMPLETED';
      order.purchase_units[0].payments = { captures: [{ id: 'CAPTURE1234567890', status: 'COMPLETED', amount: { currency_code: 'EUR', value: '37.99' } }] };
      return response(order);
    }
    if (url.endsWith(`/v2/checkout/orders/${orderId}`)) return response(order);
    throw Error('unexpected request');
  };
  return { db, order, service: createPayPalService({ env, fetch: send }), captureCalls: () => captureCalls, failWrite: value => { failWrite = value; }, signatureValid: value => { signatureValid = value; } };
}
test('PayPal defaults to no configuration and requires an explicit mode and webhook', () => {
  assert.throws(() => getPayPalConfig({}),/not_configured/);
  assert.throws(() => getPayPalConfig({...env,PAYPAL_MODE:'production'}),/not_configured/);
  assert.throws(() => getPayPalConfig({...env,PAYPAL_WEBHOOK_ID:''}),/not_configured/);
  assert.equal(getPayPalConfig(env).mode,'sandbox');
});
test('PayPal creates server-priced orders and captures once, with separate names and euro display in D1', async () => {
  const f=fixture();
  assert.equal((await f.service.create(cart,'PRINCESSBLOOM5','test-request-123456')).id,orderId);
  await f.service.create(cart,'PRINCESSBLOOM5','test-request-123456');
  assert.equal((await f.service.capture(orderId)).status,'paid');
  await f.service.capture(orderId); assert.equal(f.captureCalls(),1);
  const row=f.db.prepare('SELECT * FROM commandes_paypal').get();
  assert.equal(row.total_centimes,3799); assert.equal(row.total_euros,'37,99'); assert.equal(row.statut,'paid');
  assert.equal(JSON.parse(row.articles_json)[0].price,3999);
  const client=f.db.prepare('SELECT * FROM clients').get();
  assert.equal(client.prenom,'Marie Claire'); assert.equal(client.nom,'De La Tour');
  assert.equal(f.db.prepare('PRAGMA foreign_key_check').all().length,0); f.db.close();
});
test('PayPal rejects wrong amounts, currencies, unknown orders and unsupported shipping before a debit', async () => {
  for (const mutate of [f=>{f.order.purchase_units[0].amount.value='0.01';},f=>{f.order.purchase_units[0].amount.currency_code='USD';},f=>{f.order.purchase_units[0].shipping.address.country_code='US';}]) {
    const f=fixture(); await f.service.create(cart,'PRINCESSBLOOM5','test-request-123456'); mutate(f);
    await assert.rejects(f.service.capture(orderId)); assert.equal(f.captureCalls(),0); f.db.close();
  }
  const f=fixture(); await f.service.create(cart,'PRINCESSBLOOM5','test-request-123456');
  await assert.rejects(f.service.capture('UNKNOWNORDER123456'),/unknown_order/); f.db.close();
});
test('PayPal recovers a captured payment after storage failure without capturing twice', async () => {
  const f=fixture(); await f.service.create(cart,'PRINCESSBLOOM5','test-request-123456');
  f.failWrite(true); await assert.rejects(f.service.capture(orderId));
  assert.equal(f.captureCalls(),1);
  f.failWrite(false); assert.equal((await f.service.capture(orderId)).status,'paid');
  assert.equal(f.captureCalls(),1); f.db.close();
});
test('PayPal webhook verifies signatures and re-fetches the order, then deduplicates events', async () => {
  const f=fixture(); await f.service.create(cart,'PRINCESSBLOOM5','test-request-123456'); await f.service.capture(orderId);
  const headers=new Headers(Object.fromEntries(['paypal-auth-algo','paypal-cert-url','paypal-transmission-id','paypal-transmission-sig','paypal-transmission-time'].map(key=>[key,'test'])));
  const event={id:'WH-EVENT123',event_type:'PAYMENT.CAPTURE.COMPLETED',resource:{supplementary_data:{related_ids:{order_id:orderId}}}};
  f.signatureValid(false); await assert.rejects(f.service.webhook(headers,event),/signature_invalid/);
  await assert.rejects(f.service.webhook(new Headers(),event),/signature_missing/);
  f.signatureValid(true); await f.service.webhook(headers,event); await f.service.webhook(headers,event);
  assert.equal(f.db.prepare('SELECT count(*) AS n FROM evenements_paypal').get().n,1); f.db.close();
});
