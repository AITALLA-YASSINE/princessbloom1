-- SQL de base pour Supabase (commande / données e-commerce)

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null unique,
  phone text,
  address text,
  address_2 text,
  postal_code text,
  city text,
  country text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  status text not null default 'pending',
  subtotal numeric(10,2) default 0,
  shipping_cost numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) default 0,
  currency text default 'EUR',
  shipping_method text,
  payment_status text default 'pending',
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  provider text not null default 'stripe',
  payment_status text not null,
  amount numeric(10,2) not null,
  currency text default 'EUR',
  transaction_id text,
  created_at timestamptz default now()
);

create index if not exists orders_customer_id_idx on orders(customer_id);
create index if not exists order_items_order_id_idx on order_items(order_id);
