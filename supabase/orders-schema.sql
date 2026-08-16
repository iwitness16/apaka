-- ============================================================
-- Native Made Accessories — Orders & Installments Schema
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ─── orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer info (entered at checkout)
  customer_name     text NOT NULL DEFAULT '',
  customer_email    text NOT NULL DEFAULT '',
  customer_whatsapp text NOT NULL DEFAULT '',   -- captured from cart-drawer

  -- Order items (JSON array)
  items             jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Financials
  subtotal          numeric(10,2) NOT NULL DEFAULT 0,
  payment_method    text NOT NULL DEFAULT '',   -- CashApp | Apple Pay | Chime | Bitcoin | Zelle

  -- Payment plan
  plan_type         text NOT NULL DEFAULT 'single' CHECK (plan_type IN ('single','installment')),
  installments      int  NOT NULL DEFAULT 1,
  cadence           text NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('weekly','monthly')),

  -- Status
  is_completed      boolean NOT NULL DEFAULT false,

  -- WhatsApp message snapshot (for reference)
  wa_message        text NOT NULL DEFAULT '',

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── installment_payments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS installment_payments (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  installment_number  int  NOT NULL,           -- 1-based index
  amount              numeric(10,2) NOT NULL,
  due_date            text NOT NULL,           -- "Aug 15, 2026"
  is_paid             boolean NOT NULL DEFAULT false,
  paid_at             timestamptz,

  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS orders_created_at_idx    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_is_completed_idx  ON orders(is_completed);
CREATE INDEX IF NOT EXISTS orders_plan_type_idx     ON orders(plan_type);
CREATE INDEX IF NOT EXISTS installments_order_id_idx ON installment_payments(order_id);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at_trigger ON orders;
CREATE TRIGGER orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- Public can INSERT orders (customers placing orders via the storefront)
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

-- Only service-role key can SELECT / UPDATE / DELETE (admin dashboard)
-- (Service role bypasses RLS automatically — these policies protect anon reads)
CREATE POLICY "service_select_orders"
  ON orders FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "service_update_orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "service_delete_orders"
  ON orders FOR DELETE
  USING (auth.role() = 'service_role');

-- Installment payments — same pattern
CREATE POLICY "service_all_installments"
  ON installment_payments FOR ALL
  USING (auth.role() = 'service_role');

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- After running this file, update your .env.local with:
--   NEXT_PUBLIC_SUPABASE_URL=...
--   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
--   SUPABASE_SERVICE_ROLE_KEY=...
--   ADMIN_USERNAME=adminuser
--   ADMIN_PASSWORD=Apaka123#
--   NEXTAUTH_SECRET=any-random-32-char-string
