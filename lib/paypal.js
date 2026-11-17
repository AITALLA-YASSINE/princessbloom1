const { createHash } = require('node:crypto');
const { getD1Config } = require('./d1-orders');
const { getCheckoutTotals, COUNTRIES } = require('./checkout');

function getPayPalConfig(env = process.env) {
  const clean = value => String(value || '').trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
  const clientId = clean(env.PAYPAL_CLIENT_ID), secret = clean(env.PAYPAL_CLIENT_SECRET);
  const mode = clean(env.PAYPAL_MODE), webhookId = clean(env.PAYPAL_WEBHOOK_ID);
  if (!clientId || !secret || !webhookId || !['sandbox', 'live'].includes(mode)) throw new Error('paypal_not_configured');
  return { clientId, secret, mode, webhookId, base: mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com' };
}

function createPayPalService(options = {}) {
  const env = options.env || process.env, send = options.fetch || fetch;
  const config = getPayPalConfig(env), d1 = getD1Config(env);
  let token;
  async function api(path, body, requestId) {
    if (!token) {
      const response = await send(`${config.base}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', signal: AbortSignal.timeout(15000), cache: 'no-store' });
      if (!response.ok) throw new Error('paypal_auth_failed');
      token = (await response.json()).access_token;
      if (!token) throw new Error('paypal_auth_failed');
    }
    const response = await send(`${config.base}${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(requestId ? { 'PayPal-Request-Id': requestId } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000), cache: 'no-store' });
    if (!response.ok) throw new Error(`paypal_http_${response.status}`);
    return response.json();
  }
  async function query(sql, params = []) {
    const response = await send(`https://api.cloudflare.com/client/v4/accounts/${d1.account}/d1/database/${d1.database}/query`, { method: 'POST', headers: { Authorization: `Bearer ${d1.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql, params }), signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!response.ok) throw new Error('paypal_storage_failed');
    const data = await response.json();
    if (!data.success || !data.result?.length || data.result.some(item => !item.success)) throw new Error('paypal_storage_failed');
    return data.result[0].results || [];
  }
  async function prepare() {
    await query(`CREATE TABLE IF NOT EXISTS commandes_paypal (
      id TEXT PRIMARY KEY NOT NULL, statut TEXT NOT NULL DEFAULT 'created',
      sous_total_centimes INTEGER NOT NULL, reduction_centimes INTEGER NOT NULL,
      total_centimes INTEGER NOT NULL, devise TEXT NOT NULL DEFAULT 'eur',
      total_euros TEXT GENERATED ALWAYS AS (replace(printf('%.2f',total_centimes/100.0),'.',',')) VIRTUAL,
      articles_json TEXT NOT NULL CHECK(json_valid(articles_json)), code_promo TEXT,
      client_id TEXT REFERENCES clients(id), capture_paypal_id TEXT UNIQUE,
      adresse_livraison_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(adresse_livraison_json)),
      mode_reel INTEGER NOT NULL CHECK(mode_reel IN (0,1)),
      cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      modifie_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      CHECK(total_centimes=sous_total_centimes-reduction_centimes))`);
    await query(`CREATE TABLE IF NOT EXISTS evenements_paypal (id TEXT PRIMARY KEY NOT NULL, commande_id TEXT NOT NULL REFERENCES commandes_paypal(id), type_evenement TEXT NOT NULL, traite_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`);
  }
  function validId(id) { if (typeof id !== 'string' || !/^[A-Z0-9]{10,40}$/.test(id)) throw new Error('paypal_invalid_order'); return id; }
  async function read(id) {
    validId(id);
    const rows = await query('SELECT * FROM commandes_paypal WHERE id=?', [id]);
    if (!rows[0] || rows[0].mode_reel !== (config.mode === 'live' ? 1 : 0)) throw new Error('paypal_unknown_order');
    return rows[0];
  }
  function check(order, stored) {
    if (order.id !== stored.id || order.purchase_units?.length !== 1) throw new Error('paypal_order_mismatch');
    const unit = order.purchase_units[0];
    if (unit.amount?.currency_code !== 'EUR' || unit.amount?.value !== (stored.total_centimes / 100).toFixed(2)) throw new Error('paypal_amount_mismatch');
    if (!unit.shipping?.address?.address_line_1 || !COUNTRIES.includes(unit.shipping?.address?.country_code)) throw new Error('paypal_shipping_invalid');
    return unit;
  }
  async function save(order, stored) {
    const unit = check(order, stored);
    const captures = unit.payments?.captures || [];
    if (captures.length !== 1) throw new Error('paypal_capture_missing');
    const capture = captures[0];
    validId(capture.id);
    if (capture.amount?.currency_code !== 'EUR' || capture.amount?.value !== (stored.total_centimes / 100).toFixed(2)) throw new Error('paypal_capture_mismatch');
    const status = capture.status === 'COMPLETED' && order.status === 'COMPLETED' ? 'paid' : capture.status === 'PENDING' ? 'processing' : 'failed';
    const email = order.payer?.email_address?.trim().toLowerCase();
    if (!email) throw new Error('paypal_customer_missing');
    const clientId = `client_paypal_${order.id}`;
    await query(`INSERT INTO clients (id,email,prenom,nom) VALUES (?,?,?,?) ON CONFLICT(email) DO UPDATE SET prenom=COALESCE(excluded.prenom,clients.prenom),nom=COALESCE(excluded.nom,clients.nom),modifie_le=strftime('%Y-%m-%dT%H:%M:%fZ','now')`, [clientId,email,order.payer?.name?.given_name || null,order.payer?.name?.surname || null]);
    await query(`UPDATE commandes_paypal SET statut=CASE WHEN statut='paid' THEN statut ELSE ? END,client_id=(SELECT id FROM clients WHERE email=?),capture_paypal_id=?,adresse_livraison_json=?,modifie_le=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`, [status,email,capture.id,JSON.stringify(unit.shipping),order.id]);
    return { status: stored.statut === 'paid' ? 'paid' : status, amount: stored.total_centimes };
  }
  return {
    async create(cart, promoCode, requestId) {
      const totals = getCheckoutTotals(cart, promoCode);
      if (typeof requestId !== 'string' || !/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('paypal_invalid_request');
      await prepare();
      const key = createHash('sha256').update(JSON.stringify({ requestId, cart: totals.items, promoCode })).digest('hex').slice(0,38);
      const order = await api('/v2/checkout/orders', { intent: 'CAPTURE', purchase_units: [{ reference_id: 'princess_bloom', description: 'Votre commande Princess Bloom', amount: { currency_code: 'EUR', value: (totals.total / 100).toFixed(2) } }], payment_source: { paypal: { experience_context: { brand_name: 'Princess Bloom', shipping_preference: 'GET_FROM_FILE', user_action: 'PAY_NOW' } } } }, key);
      validId(order.id);
      await query(`INSERT INTO commandes_paypal (id,sous_total_centimes,reduction_centimes,total_centimes,articles_json,code_promo,mode_reel) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`, [order.id,totals.subtotal,totals.discount,totals.total,JSON.stringify(totals.items),String(promoCode || '').trim().toUpperCase(),config.mode === 'live' ? 1 : 0]);
      return { id: order.id };
    },
    async capture(id) {
      const stored = await read(id);
      let order = await api(`/v2/checkout/orders/${id}`);
      check(order, stored);
      if (order.status === 'APPROVED') {
        // A retry uses the same capture request identifier, never a second charge.
        await api(`/v2/checkout/orders/${id}/capture`, {}, `capture_${id}`);
        order = await api(`/v2/checkout/orders/${id}`);
      }
      return save(order, stored);
    },
    async webhook(headers, event) {
      const fields = ['paypal-auth-algo','paypal-cert-url','paypal-transmission-id','paypal-transmission-sig','paypal-transmission-time'];
      if (fields.some(field => !headers.get(field))) throw new Error('paypal_signature_missing');
      const verified = await api('/v1/notifications/verify-webhook-signature', { auth_algo: headers.get(fields[0]), cert_url: headers.get(fields[1]), transmission_id: headers.get(fields[2]), transmission_sig: headers.get(fields[3]), transmission_time: headers.get(fields[4]), webhook_id: config.webhookId, webhook_event: event });
      if (verified.verification_status !== 'SUCCESS') throw new Error('paypal_signature_invalid');
      if (!['PAYMENT.CAPTURE.COMPLETED','PAYMENT.CAPTURE.PENDING','PAYMENT.CAPTURE.DENIED'].includes(event.event_type)) return { ignored: true };
      const id = event.resource?.supplementary_data?.related_ids?.order_id;
      validId(id);
      const stored = await read(id);
      const result = await save(await api(`/v2/checkout/orders/${id}`), stored);
      await query('INSERT INTO evenements_paypal (id,commande_id,type_evenement) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING', [event.id,id,event.event_type]);
      return result;
    },
    read,
  };
}

module.exports = { getPayPalConfig, createPayPalService };
