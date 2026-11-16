CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT REFERENCES customers(id),
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

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  UNIQUE (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL REFERENCES orders(id),
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

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY NOT NULL,
  event_type TEXT NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  stripe_created_at INTEGER NOT NULL,
  livemode INTEGER NOT NULL CHECK (livemode IN (0, 1)),
  processed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS webhook_events_payment_id_idx ON stripe_webhook_events(stripe_payment_intent_id);

SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('customers', 'orders', 'order_items', 'payments', 'stripe_webhook_events') ORDER BY name;
