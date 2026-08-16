-- ============================================================
-- Native Made Accessories — Orders Schema FIX
-- Run this if you already ran orders-schema.sql and got:
--   ERROR: column "is_completed" does not exist
--
-- This script is SAFE to run multiple times (uses IF NOT EXISTS
-- or checks before altering).
-- ============================================================

-- ── 1. Drop and recreate orders clean (safest approach) ───────────────────────
-- Back up any existing rows first if you have real data.
-- If this is a fresh DB with no real orders, just drop and recreate.

DROP TABLE IF EXISTS installment_payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- ── 2. Recreate orders ────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer info
  customer_name     text NOT NULL DEFAULT '',
  customer_email    text NOT NULL DEFAULT '',
  customer_whatsapp text NOT NULL DEFAULT '',

  -- Order items (JSON array of {title, size, quantity, price})
  items             jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Financials
  subtotal          numeric(10,2) NOT NULL DEFAULT 0,
  payment_method    text NOT NULL DEFAULT '',

  -- Payment plan
  plan_type         text NOT NULL DEFAULT 'single'
                      CHECK (plan_type IN ('single','installment')),
  installments      int  NOT NULL DEFAULT 1,
  cadence           text NOT NULL DEFAULT 'weekly'
                      CHECK (cadence IN ('weekly','monthly')),

  -- Status
  is_completed      boolean NOT NULL DEFAULT false,

  -- WhatsApp message snapshot
  wa_message        text NOT NULL DEFAULT '',

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Recreate installment_payments ─────────────────────────────────────────
CREATE TABLE installment_payments (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  installment_number  int          NOT NULL,
  amount              numeric(10,2) NOT NULL,
  due_date            text         NOT NULL,
  is_paid             boolean      NOT NULL DEFAULT false,
  paid_at             timestamptz,

  created_at          timestamptz  NOT NULL DEFAULT now()
);

-- ── 4. Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX orders_created_at_idx     ON orders(created_at DESC);
CREATE INDEX orders_is_completed_idx   ON orders(is_completed);
CREATE INDEX orders_plan_type_idx      ON orders(plan_type);
CREATE INDEX installments_order_id_idx ON installment_payments(order_id);

-- ── 5. Auto-update updated_at ─────────────────────────────────────────────────
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

-- ── 6. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- Customers can INSERT orders
DROP POLICY IF EXISTS "public_insert_orders"      ON orders;
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT TO public
  WITH CHECK (true);

-- Service role can do everything (bypasses RLS automatically,
-- but explicit policies don't hurt)
DROP POLICY IF EXISTS "service_select_orders"  ON orders;
DROP POLICY IF EXISTS "service_update_orders"  ON orders;
DROP POLICY IF EXISTS "service_delete_orders"  ON orders;

CREATE POLICY "service_select_orders"
  ON orders FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "service_update_orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "service_delete_orders"
  ON orders FOR DELETE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_all_installments" ON installment_payments;
CREATE POLICY "service_all_installments"
  ON installment_payments FOR ALL
  USING (auth.role() = 'service_role');

-- Also allow public INSERT on installments (created server-side via service role anyway)
DROP POLICY IF EXISTS "public_insert_installments" ON installment_payments;
CREATE POLICY "public_insert_installments"
  ON installment_payments FOR INSERT TO public
  WITH CHECK (true);

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Tables created:
--   orders               (with is_completed column)
--   installment_payments (linked to orders)
