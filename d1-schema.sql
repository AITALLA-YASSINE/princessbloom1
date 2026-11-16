-- Princess Bloom - Cloudflare D1 / SQLite
-- Creates empty tables only. Existing data is not deleted.
-- Money is stored as integer cents: 3999 = EUR 39.99.
-- Never store card numbers, CVCs, Stripe API keys or client secrets here.

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS commandes (
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT REFERENCES clients(id),
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded', 'partially_refunded')),
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled'
    CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'shipped', 'delivered', 'canceled', 'returned')),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0 AND discount_cents <= subtotal_cents),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur' CHECK (length(currency) = 3),
  promo_code TEXT,
  shipping_address_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(shipping_address_json)),
  livemode INTEGER NOT NULL CHECK (livemode IN (0, 1)),
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (total_cents = subtotal_cents + shipping_cents - discount_cents)
);

CREATE TABLE IF NOT EXISTS articles_commandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES commandes(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  UNIQUE (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS paiements (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL REFERENCES commandes(id),
  provider TEXT NOT NULL DEFAULT 'stripe' CHECK (provider = 'stripe'),
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'canceled', 'refunded', 'partially_refunded')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur' CHECK (length(currency) = 3),
  livemode INTEGER NOT NULL CHECK (livemode IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS evenements_stripe (
  event_id TEXT PRIMARY KEY NOT NULL,
  event_type TEXT NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_created_at INTEGER NOT NULL,
  livemode INTEGER NOT NULL CHECK (livemode IN (0, 1)),
  processed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON commandes(customer_id);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON commandes(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON commandes(created_at);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON articles_commandes(order_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON paiements(order_id);
CREATE INDEX IF NOT EXISTS webhook_events_payment_id_idx ON evenements_stripe(stripe_payment_intent_id);
