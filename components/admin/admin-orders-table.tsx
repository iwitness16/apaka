"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, ChevronDown, ChevronUp, Clock,
  Eye, Loader2, Search, Trash2, XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Installment = { id: string; is_paid: boolean }
type Order = {
  id: string
  customer_name: string
  customer_email: string
  customer_whatsapp: string
  subtotal: number
  payment_method: string
  plan_type: "single" | "installment"
  installments: number
  cadence: string
  is_completed: boolean
  created_at: string
  installment_payments: Installment[]
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

type SortKey = "date" | "name" | "total" | "status"
type Filter  = "all" | "pending" | "completed" | "installment"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",         label: "All"          },
  { key: "pending",     label: "Pending"      },
  { key: "completed",   label: "Completed"    },
  { key: "installment", label: "Installments" },
]

export function AdminOrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [q,          setQ]          = useState("")
  const [filter,     setFilter]     = useState<Filter>("all")
  const [sortKey,    setSortKey]    = useState<SortKey>("date")
  const [sortAsc,    setSortAsc]    = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = orders.filter((o) => {
      const s = q.toLowerCase()
      if (s && !(
        o.customer_name.toLowerCase().includes(s) ||
        o.customer_email.toLowerCase().includes(s) ||
        o.customer_whatsapp.toLowerCase().includes(s) ||
        o.id.toLowerCase().includes(s)
      )) return false
      if (filter === "pending"      && o.is_completed)               return false
      if (filter === "completed"    && !o.is_completed)              return false
      if (filter === "installment"  && o.plan_type !== "installment") return false
      return true
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === "date")   cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortKey === "name")   cmp = a.customer_name.localeCompare(b.customer_name)
      if (sortKey === "total")  cmp = a.subtotal - b.subtotal
      if (sortKey === "status") cmp = (a.is_completed ? 1 : 0) - (b.is_completed ? 1 : 0)
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [orders, q, filter, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortAsc ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
      : <ChevronDown className="size-3 opacity-0 group-hover:opacity-40" />

  const handleComplete = async (id: string) => {
    setCompleting(id)
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: true }),
    })
    setCompleting(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this order? This cannot be undone.")) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error ?? "Could not delete order.")
    }
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 sm:w-72"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-all",
                filter === key
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-5 py-2">
        <p className="text-xs text-gray-400">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-gray-100">
            <XCircle className="size-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No orders match your filters</p>
          <p className="mt-1 text-xs text-gray-400">Try adjusting the search or filter.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {(
                    [
                      { key: "date",   label: "Date"     },
                      { key: "name",   label: "Customer" },
                      { key: "total",  label: "Total"    },
                      { key: null,     label: "Plan"     },
                      { key: "status", label: "Status"   },
                      { key: null,     label: "Actions"  },
                    ] as { key: SortKey | null; label: string }[]
                  ).map(({ key, label }) => (
                    <th
                      key={label}
                      onClick={() => key && toggleSort(key)}
                      className={cn(
                        "group px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400",
                        key && "cursor-pointer select-none hover:text-gray-600"
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const paidCount    = order.installment_payments?.filter((i) => i.is_paid).length ?? 0
                  const totalInstall = order.installment_payments?.length ?? 0
                  const canComplete  =
                    !order.is_completed &&
                    (order.plan_type === "single" || totalInstall === 0 || paidCount === totalInstall)

                  return (
                    <tr key={order.id} className="group transition-colors hover:bg-gray-50/70">
                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                        {fmtDate(order.created_at)}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {order.customer_name || <span className="text-gray-300">—</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{order.customer_email}</p>
                        {order.customer_whatsapp && (
                          <p className="text-xs text-gray-400">{order.customer_whatsapp}</p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                        {fmt(order.subtotal)}
                      </td>

                      {/* Plan */}
                      <td className="px-5 py-4">
                        {order.plan_type === "single" ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                            One-Time
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700">
                              {order.installments}× {order.cadence}
                            </span>
                            {totalInstall > 0 && (
                              <p className="text-[10px] text-gray-400">{paidCount}/{totalInstall} paid</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-4">
                        {order.is_completed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 className="size-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            <Clock className="size-3" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/adminapaka/orders/${order.id}`}
                            title="View Details"
                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
                          >
                            <Eye className="size-3.5" />
                          </Link>

                          {canComplete && (
                            <button
                              type="button"
                              title="Mark Completed"
                              disabled={completing === order.id}
                              onClick={() => handleComplete(order.id)}
                              className="flex size-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {completing === order.id
                                ? <Loader2 className="size-3.5 animate-spin" />
                                : <CheckCircle2 className="size-3.5" />}
                            </button>
                          )}

                          {order.is_completed && (
                            <button
                              type="button"
                              title="Delete Order"
                              disabled={deletingId === order.id}
                              onClick={() => handleDelete(order.id)}
                              className="flex size-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId === order.id
                                ? <Loader2 className="size-3.5 animate-spin" />
                                : <Trash2 className="size-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="divide-y divide-gray-100 sm:hidden">
            {filtered.map((order) => {
              const paidCount    = order.installment_payments?.filter((i) => i.is_paid).length ?? 0
              const totalInstall = order.installment_payments?.length ?? 0
              const canComplete  =
                !order.is_completed &&
                (order.plan_type === "single" || totalInstall === 0 || paidCount === totalInstall)

              return (
                <div key={order.id} className="px-5 py-4 space-y-3">
                  {/* Top row: customer + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {order.customer_name || "—"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{order.customer_email}</p>
                      {order.customer_whatsapp && (
                        <p className="text-xs text-gray-400">{order.customer_whatsapp}</p>
                      )}
                    </div>
                    {order.is_completed ? (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="size-3" /> Done
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                        <Clock className="size-3" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Middle row: total + plan + date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{fmt(order.subtotal)}</span>
                    {order.plan_type === "single" ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        One-Time
                      </span>
                    ) : (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                        {order.installments}× {order.cadence}
                        {totalInstall > 0 && ` · ${paidCount}/${totalInstall} paid`}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{fmtDate(order.created_at)}</span>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/adminapaka/orders/${order.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
                    >
                      <Eye className="size-3.5" /> View
                    </Link>

                    {canComplete && (
                      <button
                        type="button"
                        disabled={completing === order.id}
                        onClick={() => handleComplete(order.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {completing === order.id
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <CheckCircle2 className="size-3.5" />}
                        Complete
                      </button>
                    )}

                    {order.is_completed && (
                      <button
                        type="button"
                        disabled={deletingId === order.id}
                        onClick={() => handleDelete(order.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === order.id
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <Trash2 className="size-3.5" />}
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
