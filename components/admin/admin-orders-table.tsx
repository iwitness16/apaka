"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, ChevronDown, ChevronUp, Clock,
  Eye, Search, Trash2, XCircle,
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
      const search = q.toLowerCase()
      if (search && !(
        o.customer_name.toLowerCase().includes(search) ||
        o.customer_email.toLowerCase().includes(search) ||
        o.customer_whatsapp.toLowerCase().includes(search) ||
        o.id.toLowerCase().includes(search)
      )) return false
      if (filter === "pending"     && o.is_completed)              return false
      if (filter === "completed"   && !o.is_completed)             return false
      if (filter === "installment" && o.plan_type !== "installment") return false
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
      ? sortAsc
        ? <ChevronUp className="size-3.5" />
        : <ChevronDown className="size-3.5" />
      : null

  const handleComplete = async (id: string) => {
    setCompleting(id)
    await fetch(`/api/admin/orders/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_completed: true }),
    })
    setCompleting(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order? This action cannot be undone.")) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error ?? "Could not delete order.")
    }
    setDeletingId(null)
    router.refresh()
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",        label: "All"         },
    { key: "pending",    label: "Pending"      },
    { key: "completed",  label: "Completed"    },
    { key: "installment",label: "Installments" },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-white/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-[#c0392b]/50 focus:ring-1 focus:ring-[#c0392b]/20 sm:w-72"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all",
                filter === key
                  ? "bg-[#c0392b] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-5 py-2.5">
        <p className="text-[11px] text-white/30">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <XCircle className="mx-auto size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/30">No orders match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {[
                  { key: "date",   label: "Date"    },
                  { key: "name",   label: "Customer"},
                  { key: "total",  label: "Total"   },
                  { key: null,     label: "Plan"    },
                  { key: "status", label: "Status"  },
                  { key: null,     label: "Actions" },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key as SortKey)}
                    className={cn(
                      "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40",
                      key && "cursor-pointer hover:text-white/70"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon k={key as SortKey} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((order) => {
                const paidCount   = order.installment_payments?.filter((i) => i.is_paid).length ?? 0
                const totalInstall = order.installment_payments?.length ?? 0
                const canComplete = order.plan_type === "single"
                  ? !order.is_completed
                  : !order.is_completed && (totalInstall === 0 || paidCount === totalInstall)

                return (
                  <tr
                    key={order.id}
                    className="group transition-colors hover:bg-white/3"
                  >
                    {/* Date */}
                    <td className="px-5 py-3.5 text-[12px] text-white/50">
                      {fmtDate(order.created_at)}
                    </td>

                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">
                        {order.customer_name || <span className="text-white/30">—</span>}
                      </p>
                      <p className="text-[11px] text-white/40">{order.customer_email}</p>
                      {order.customer_whatsapp && (
                        <p className="text-[11px] text-white/30">{order.customer_whatsapp}</p>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5 font-semibold text-white">
                      {fmt(order.subtotal)}
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3.5">
                      {order.plan_type === "single" ? (
                        <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
                          One-Time
                        </span>
                      ) : (
                        <div>
                          <span className="rounded-full bg-purple-500/15 px-2.5 py-1 text-[10px] font-semibold text-purple-400">
                            {order.installments}× {order.cadence}
                          </span>
                          {totalInstall > 0 && (
                            <p className="mt-1 text-[10px] text-white/35">
                              {paidCount}/{totalInstall} paid
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {order.is_completed ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="size-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                          <Clock className="size-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* View detail */}
                        <Link
                          href={`/adminapaka/orders/${order.id}`}
                          title="View Details"
                          className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
                        >
                          <Eye className="size-3.5" />
                        </Link>

                        {/* Mark complete */}
                        {canComplete && (
                          <button
                            type="button"
                            title="Mark as Completed"
                            disabled={completing === order.id}
                            onClick={() => handleComplete(order.id)}
                            className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="size-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        {order.is_completed && (
                          <button
                            type="button"
                            title="Delete Order"
                            disabled={deletingId === order.id}
                            onClick={() => handleDelete(order.id)}
                            className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                          >
                            <Trash2 className="size-3.5" />
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
      )}
    </div>
  )
}
