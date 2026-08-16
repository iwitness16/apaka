"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  orderId: string
  isCompleted: boolean
  canDelete: boolean
  allInstallmentsPaid: boolean
  planType: "single" | "installment"
}

export function AdminOrderActions({
  orderId,
  isCompleted,
  canDelete,
  allInstallmentsPaid,
  planType,
}: Props) {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [error,      setError]      = useState("")

  const canComplete = !isCompleted && (planType === "single" || allInstallmentsPaid)

  const handleComplete = async () => {
    setError("")
    setCompleting(true)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_completed: true }),
    })
    setCompleting(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed."); return }
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm("Permanently delete this order? This cannot be undone.")) return
    setError("")
    setDeleting(true)
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed."); return }
    router.push("/adminapaka")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {canComplete && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {completing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Mark as Completed
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete Order
          </button>
        )}
      </div>

      {!isCompleted && planType === "installment" && !allInstallmentsPaid && (
        <p className="text-xs text-amber-600">Mark all installments paid before completing.</p>
      )}
      {!canDelete && !isCompleted && (
        <p className="text-xs text-gray-400">Order must be completed before it can be deleted.</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
