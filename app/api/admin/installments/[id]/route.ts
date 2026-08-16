import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

// PATCH — mark an installment as paid / unpaid
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { is_paid } = await req.json().catch(() => ({}))
  const db = createServiceClient()

  const { error } = await db
    .from("installment_payments")
    .update({
      is_paid: Boolean(is_paid),
      paid_at: is_paid ? new Date().toISOString() : null,
    })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // After marking paid, check if ALL installments for this order are now paid
  // If so, auto-mark the parent order as completed
  const { data: installment } = await db
    .from("installment_payments")
    .select("order_id")
    .eq("id", id)
    .single()

  if (installment?.order_id && is_paid) {
    const { data: remaining } = await db
      .from("installment_payments")
      .select("id")
      .eq("order_id", installment.order_id)
      .eq("is_paid", false)

    if (remaining?.length === 0) {
      await db
        .from("orders")
        .update({ is_completed: true })
        .eq("id", installment.order_id)
    }
  }

  return NextResponse.json({ success: true })
}
