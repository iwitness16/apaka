-- ============================================================
-- Native Made Accessories — NEW Products Schema (Etsy Data)
-- Run this in a FRESH Supabase project (or DROP old tables first)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── DROP old table if starting fresh ─────────────────────────────────────────
DROP TABLE IF EXISTS installment_payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ── products ─────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id               uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  handle           text    NOT NULL UNIQUE,   -- slugified from product_name
  etsy_id          text    NOT NULL DEFAULT '', -- original Etsy listing ID (sku)
  etsy_url         text    NOT NULL DEFAULT '', -- original Etsy listing URL

  -- Display
  title            text    NOT NULL DEFAULT '',
  description      text    NOT NULL DEFAULT '',
  category         text    NOT NULL DEFAULT 'turquoise-jewelry',

  -- Pricing
  price            numeric(10,2) NOT NULL DEFAULT 0,
  original_price   numeric(10,2),               -- null = not on sale

  -- Media
  main_image       text    NOT NULL DEFAULT '',
  images           text[]  NOT NULL DEFAULT '{}',

  -- Attributes
  materials        text    NOT NULL DEFAULT '',
  gemstone         text    NOT NULL DEFAULT '',
  gem_color        text    NOT NULL DEFAULT '',
  size_info        text    NOT NULL DEFAULT '',
  style_info       text    NOT NULL DEFAULT '',

  -- Seller
  seller_name      text    NOT NULL DEFAULT '',
  seller_url       text    NOT NULL DEFAULT '',

  -- Social proof
  rating           numeric(3,2),
  review_count     int     DEFAULT 0,

  -- Flags
  is_active        boolean NOT NULL DEFAULT true,
  is_sale          boolean GENERATED ALWAYS AS (original_price IS NOT NULL AND original_price > price) STORED,
  free_shipping    boolean NOT NULL DEFAULT false,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── orders ────────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name     text    NOT NULL DEFAULT '',
  customer_email    text    NOT NULL DEFAULT '',
  customer_whatsapp text    NOT NULL DEFAULT '',
  items             jsonb   NOT NULL DEFAULT '[]'::jsonb,
  subtotal          numeric(10,2) NOT NULL DEFAULT 0,
  payment_method    text    NOT NULL DEFAULT '',
  plan_type         text    NOT NULL DEFAULT 'single' CHECK (plan_type IN ('single','installment')),
  installments      int     NOT NULL DEFAULT 1,
  cadence           text    NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('weekly','monthly')),
  is_completed      boolean NOT NULL DEFAULT false,
  wa_message        text    NOT NULL DEFAULT '',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── installment_payments ──────────────────────────────────────────────────────
CREATE TABLE installment_payments (
  id                  uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            uuid    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  installment_number  int     NOT NULL,
  amount              numeric(10,2) NOT NULL,
  due_date            text    NOT NULL,
  is_paid             boolean NOT NULL DEFAULT false,
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX products_category_idx    ON products(category);
CREATE INDEX products_is_active_idx   ON products(is_active);
CREATE INDEX products_created_at_idx  ON products(created_at DESC);
CREATE INDEX products_price_idx       ON products(price);
CREATE INDEX products_title_trgm_idx  ON products USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX orders_created_at_idx    ON orders(created_at DESC);
CREATE INDEX installments_order_idx   ON installment_payments(order_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "public_read_products"
  ON products FOR SELECT TO public USING (is_active = true);

-- Public can insert orders
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT TO public WITH CHECK (true);

-- Service role manages everything
CREATE POLICY "service_all_products"
  ON products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_orders"
  ON orders FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_all_installments"
  ON installment_payments FOR ALL USING (auth.role() = 'service_role');

-- ── Done ──────────────────────────────────────────────────────────────────────
-- After running this, run new-seed.sql to load product data.
