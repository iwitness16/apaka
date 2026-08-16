import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

interface SaveOrderBody {
  customerName: string
  customerEmail: string
  customerWhatsapp: string
  items: {
    title: string
    size?: string
    quantity: number
    price: number
  }[]
  subtotal: number
  paymentMethod: string
  planType: "single" | "installment"
  installments: number
  cadence: "weekly" | "monthly"
  installmentDates: string[]
  waMessage: string
}

export async function POST(req: NextRequest) {
  let body: SaveOrderBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    customerName,
    customerEmail,
    customerWhatsapp,
    items,
    subtotal,
    paymentMethod,
    planType,
    installments,
    cadence,
    installmentDates,
    waMessage,
  } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items in order" }, { status: 400 })
  }

  const db = createServiceClient()

  // ── Insert the order ──────────────────────────────────────────────────────
  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      customer_name:     customerName     ?? "",
      customer_email:    customerEmail    ?? "",
      customer_whatsapp: customerWhatsapp ?? "",
      items:             items,
      subtotal:          subtotal,
      payment_method:    paymentMethod    ?? "",
      plan_type:         planType,
      installments:      installments,
      cadence:           cadence,
      // Single-payment orders are immediately completed
      is_completed:      planType === "single",
      wa_message:        waMessage        ?? "",
    })
    .select("id")
    .single()

  if (orderErr || !order) {
    console.error("[save-order] insert error:", orderErr?.message)
    return NextResponse.json(
      { error: "Failed to save order" },
      { status: 500 }
    )
  }

  // ── Insert installment rows ──────────────────────────────────────────────
  if (planType === "installment" && installmentDates.length > 0) {
    const perInstall = subtotal / (installments || 1)
    const rows = installmentDates.map((date, idx) => ({
      order_id:           order.id,
      installment_number: idx + 1,
      amount:             Number(perInstall.toFixed(2)),
      due_date:           date,
      is_paid:            false,
    }))

    const { error: installErr } = await db
      .from("installment_payments")
      .insert(rows)

    if (installErr) {
      console.error("[save-order] installments error:", installErr.message)
      // Non-fatal — order was saved, installments might be recoverable
    }
  }

  return NextResponse.json({ success: true, orderId: order.id })
}
