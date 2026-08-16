import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { createServiceClient } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

// ── PATCH — update order (mark complete) ────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const db   = createServiceClient()

  const updates: Record<string, unknown> = {}
  if (typeof body.is_completed === "boolean") updates.is_completed = body.is_completed

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  const { error } = await db.from("orders").update(updates).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// ── DELETE — remove order ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const db     = createServiceClient()

  // Guard: only allow deletion if order is completed
  const { data: order } = await db
    .from("orders")
    .select("is_completed")
    .eq("id", id)
    .single()

  if (!order?.is_completed) {
    return NextResponse.json(
      { error: "Order must be marked complete before deleting." },
      { status: 400 }
    )
  }

  const { error } = await db.from("orders").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
