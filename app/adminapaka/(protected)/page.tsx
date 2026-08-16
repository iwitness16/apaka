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
      valueColor: "text-blue-600",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Pending",
      value: pending ?? 0,
      icon: Clock,
      valueColor: "text-amber-600",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Completed",
      value: completed ?? 0,
      icon: CheckCircle2,
      valueColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "On Installment",
      value: installment ?? 0,
      icon: CreditCard,
      valueColor: "text-purple-600",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      border: "border-purple-100",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
          <LayoutDashboard className="size-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order Dashboard</h1>
          <p className="text-sm text-gray-500">
            Track payments, installments &amp; order status
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, valueColor, iconBg, iconColor, border }) => (
          <div
            key={label}
            className={`rounded-2xl border bg-white p-5 shadow-sm ${border}`}
          >
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${iconBg}`}>
              <Icon className={`size-4 ${iconColor}`} />
            </div>
            <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">All Orders</h2>
          <p className="text-xs text-gray-400">{orders?.length ?? 0} orders loaded</p>
        </div>
        <AdminOrdersTable orders={orders ?? []} />
      </div>
    </div>
  )
}
