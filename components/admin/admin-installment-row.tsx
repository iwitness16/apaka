"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type Installment = {
  id: string
  installment_number: number
  amount: number
  due_date: string
  is_paid: boolean
  paid_at: string | null
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
}

export function AdminInstallmentRow({ installment }: { installment: Installment }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    setBusy(true)
    await fetch(`/api/admin/installments/${installment.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ is_paid: !installment.is_paid }),
    })
    setBusy(false)
    router.refresh()
  }

  return (
    <li className={cn(
      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
      installment.is_paid
        ? "border-emerald-100 bg-emerald-50/50"
        : "border-gray-200 bg-white"
    )}>
      <div className="flex items-center gap-3">
        {/* Number */}
        <span className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          installment.is_paid
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-500"
        )}>
          {installment.installment_number}
        </span>

        <div>
          <p className={cn("text-sm font-semibold", installment.is_paid ? "text-emerald-800" : "text-gray-900")}>
            {fmt(installment.amount)}
          </p>
          <p className="text-[11px] text-gray-400">Due {installment.due_date}</p>
          {installment.is_paid && installment.paid_at && (
            <p className="text-[10px] text-emerald-600">
              Paid {new Date(installment.paid_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
          installment.is_paid
            ? "border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          busy && "cursor-not-allowed opacity-50"
        )}
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : installment.is_paid ? (
          <><RotateCcw className="size-3.5" /> Undo</>
        ) : (
          <><Check className="size-3.5" /> Mark Paid</>
        )}
      </button>
    </li>
  )
}
