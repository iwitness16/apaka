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

  // Can mark complete if:
  // - single plan: not yet completed
  // - installment: all installments paid AND not yet completed
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
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to update order.")
      return
    }
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm("Permanently delete this order? This cannot be undone.")) return
    setError("")
    setDeleting(true)
    const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" })
    setDeleting(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to delete order.")
      return
    }
    router.push("/adminapaka")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Mark complete */}
        {canComplete && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {completing
              ? <Loader2 className="size-4 animate-spin" />
              : <CheckCircle2 className="size-4" />}
            Mark as Completed
          </button>
        )}

        {/* Delete (only when completed) */}
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
              "bg-red-500/15 text-red-400 hover:bg-red-500/25",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {deleting
              ? <Loader2 className="size-4 animate-spin" />
              : <Trash2 className="size-4" />}
            Delete Order
          </button>
        )}
      </div>

      {/* Hints */}
      {!isCompleted && planType === "installment" && !allInstallmentsPaid && (
        <p className="text-[11px] text-amber-400/70">
          Mark all installments as paid before completing this order.
        </p>
      )}
      {!canDelete && isCompleted === false && (
        <p className="text-[11px] text-white/30">
          Order must be completed before it can be deleted.
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-400">{error}</p>
      )}
    </div>
  )
}
