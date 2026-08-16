import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Calendar, CheckCircle2,
  Clock, Package, User,
} from "lucide-react"
import { createServiceClient } from "@/lib/supabase"
import { AdminInstallmentRow } from "@/components/admin/admin-installment-row"
import { AdminOrderActions } from "@/components/admin/admin-order-actions"

export const dynamic = "force-dynamic"

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
  }).format(n)
}
function fmtDate(s: string) {
  return new Date(s).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

type InstallmentRow = {
  id: string
  installment_number: number
  amount: number
  due_date: string
  is_paid: boolean
  paid_at: string | null
}
type OrderItem = {
  title: string
  size?: string
  quantity: number
  price: number
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = createServiceClient()

  const { data: order } = await db
    .from("orders")
    .select(`
      id, customer_name, customer_email, customer_whatsapp,
      items, subtotal, payment_method,
      plan_type, installments, cadence,
      is_completed, created_at, updated_at,
      installment_payments(
        id, installment_number, amount, due_date, is_paid, paid_at
      )
    `)
    .eq("id", id)
    .single()

  if (!order) notFound()

  const installments: InstallmentRow[] = (
    (order.installment_payments ?? []) as InstallmentRow[]
  ).sort((a, b) => a.installment_number - b.installment_number)

  const paidCount    = installments.filter((i) => i.is_paid).length
  const totalInstall = installments.length
  const allPaid      = totalInstall > 0 && paidCount === totalInstall

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : []

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <Link
        href="/adminapaka"
        className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-white">Order Detail</h1>
            {order.is_completed ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="size-3.5" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/20">
                <Clock className="size-3.5" /> Pending
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[12px] text-white/25">#{order.id}</p>
          <p className="text-[12px] text-white/35">{fmtDate(order.created_at)}</p>
        </div>

        <AdminOrderActions
          orderId={order.id}
          isCompleted={order.is_completed}
          canDelete={order.is_completed}
          allInstallmentsPaid={allPaid}
          planType={order.plan_type}
        />
      </div>

      {/* Body grid */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">

          {/* Customer info */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <User className="size-4 text-white/40" />
              <h3 className="text-sm font-semibold text-white/70">Customer Information</h3>
            </div>
            <dl className="space-y-3">
              {[
                { label: "Name",      value: order.customer_name     || "—" },
                { label: "Email",     value: order.customer_email    || "—" },
                { label: "WhatsApp",  value: order.customer_whatsapp || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <dt className="w-24 shrink-0 text-[12px] text-white/35">{label}</dt>
                  <dd className="break-all text-sm text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Order items */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Package className="size-4 text-white/40" />
              <h3 className="text-sm font-semibold text-white/70">
                Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
            </div>
            <ul className="divide-y divide-white/6">
              {items.length === 0 ? (
                <li className="py-4 text-sm text-white/30">No items recorded.</li>
              ) : (
                items.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      {item.size && (
                        <p className="text-[12px] text-white/35">Size: {item.size}</p>
                      )}
                      <p className="text-[12px] text-white/35">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-white">
                      {fmt(item.price * item.quantity)}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-4">
              <span className="text-sm font-medium text-white/50">Order Total</span>
              <span className="text-lg font-bold text-white">{fmt(order.subtotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Payment summary */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="size-4 text-white/40" />
              <h3 className="text-sm font-semibold text-white/70">Payment</h3>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                {
                  label: "Type",
                  value: order.plan_type === "single"
                    ? "One-Time Payment"
                    : `${order.installments}× Installment Plan`,
                },
                ...(order.plan_type === "installment"
                  ? [{ label: "Frequency", value: order.cadence }]
                  : []),
                { label: "Method",  value: order.payment_method },
                { label: "Total",   value: fmt(order.subtotal)  },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-white/35">{label}</dt>
                  <dd className="font-medium capitalize text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Installments */}
          {order.plan_type === "installment" && totalInstall > 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/70">Installments</h3>
                <span
                  className={`text-[11px] font-bold ${
                    allPaid ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {paidCount}/{totalInstall} paid
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${totalInstall > 0 ? (paidCount / totalInstall) * 100 : 0}%`,
                  }}
                />
              </div>

              <ul className="space-y-2">
                {installments.map((inst) => (
                  <AdminInstallmentRow key={inst.id} installment={inst} />
                ))}
              </ul>

              {allPaid && (
                <div className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-[12px] text-emerald-400 ring-1 ring-emerald-500/20">
                  ✓ All installments paid — you may now mark this order as completed.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
