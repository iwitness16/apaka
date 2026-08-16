import { createServiceClient } from "@/lib/supabase"
import { AdminOrdersTable } from "@/components/admin/admin-orders-table"
import { LayoutDashboard, ShoppingBag, Clock, CheckCircle2, CreditCard } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const db = createServiceClient()

  const [
    { count: total },
    { count: pending },
    { count: completed },
    { count: installment },
    { data: orders },
  ] = await Promise.all([
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }).eq("is_completed", false),
    db.from("orders").select("*", { count: "exact", head: true }).eq("is_completed", true),
    db.from("orders").select("*", { count: "exact", head: true }).eq("plan_type", "installment"),
    db
      .from("orders")
      .select(`
        id, customer_name, customer_email, customer_whatsapp,
        subtotal, payment_method, plan_type, installments, cadence,
        is_completed, created_at,
        installment_payments(id, is_paid)
      `)
      .order("created_at", { ascending: false })
      .limit(500),
  ])

  const stats = [
    {
      label: "Total Orders",
      value: total ?? 0,
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      ring: "ring-blue-500/20",
    },
    {
      label: "Pending",
      value: pending ?? 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/20",
    },
    {
      label: "Completed",
      value: completed ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/20",
    },
    {
      label: "On Installment",
      value: installment ?? 0,
      icon: CreditCard,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      ring: "ring-purple-500/20",
    },
  ]

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#c0392b]/20 ring-1 ring-[#c0392b]/30">
          <LayoutDashboard className="size-5 text-[#c0392b]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Order Dashboard</h1>
          <p className="text-[13px] text-white/40">
            Track payments, installments &amp; order status
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg, ring }) => (
          <div
            key={label}
            className={`rounded-2xl border border-white/8 p-5 backdrop-blur-sm ring-1 ${ring} bg-white/4`}
          >
            <div className={`mb-3 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`size-4 ${color}`} />
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/40">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Orders table card */}
      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">All Orders</h2>
            <p className="text-[12px] text-white/35">
              {orders?.length ?? 0} orders loaded
            </p>
          </div>
        </div>
        <AdminOrdersTable orders={orders ?? []} />
      </div>
    </div>
  )
}
