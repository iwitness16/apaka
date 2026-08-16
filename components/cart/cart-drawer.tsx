"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, X, ChevronLeft, ChevronRight, Check, Calendar, Repeat } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { formatPrice } from "@/lib/catalog"
import { cn } from "@/lib/utils"

// ─── Constants ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "17153500002"
const CONTACT_EMAIL = "orders.nativemadeaccessories@gmail.com"
const PAYMENT_METHODS = ["CashApp", "Apple Pay", "Chime", "Bitcoin", "Zelle"] as const
type PaymentMethod = (typeof PAYMENT_METHODS)[number]
type Cadence = "weekly" | "monthly"

// ─── Payment plan logic ───────────────────────────────────────────────────────
function getPlanInfo(subtotal: number): {
  type: "single" | "installment"
  installments: number
  perInstallment: number
  canChooseInstallment: boolean
} {
  if (subtotal < 400) {
    return { type: "single", installments: 1, perInstallment: subtotal, canChooseInstallment: false }
  }
  const defaultInstallments = subtotal < 800 ? 4 : 6
  const perInstallment = subtotal / defaultInstallments
  return {
    type: "installment",
    installments: defaultInstallments,
    perInstallment,
    canChooseInstallment: true,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildInstallmentDates(n: number, cadence: Cadence): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now)
    if (cadence === "weekly") d.setDate(now.getDate() + i * 7)
    else d.setMonth(now.getMonth() + i)
    dates.push(
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    )
  }
  return dates
}

interface CartLine {
  handle: string
  title: string
  price: number
  image: string
  size: string
  quantity: number
}

function buildWhatsAppMessage(
  lines: CartLine[],
  subtotal: number,
  paymentMethod: PaymentMethod,
  planChoice: "single" | "installment",
  installments: number,
  cadence: Cadence,
  customerName: string,
  customerEmail: string
): string {
  const itemList = lines
    .map((l) => `  • ${l.title}${l.size ? ` (${l.size})` : ""} × ${l.quantity} — ${formatPrice(l.price * l.quantity)}`)
    .join("\n")

  const isInstallment = planChoice === "installment"
  const dates = isInstallment ? buildInstallmentDates(installments, cadence) : []
  const perInstall = subtotal / installments

  let paymentSection = ""
  if (isInstallment) {
    const schedule = dates
      .map((d, i) => `    Installment ${i + 1}: ${formatPrice(perInstall)} — due ${d}`)
      .join("\n")
    paymentSection = `
💳 Payment Plan: ${installments} installments (${cadence})
   Per installment: ${formatPrice(perInstall)}

📅 Payment Schedule:
${schedule}`
  } else {
    paymentSection = `
💳 Payment: One-time payment of ${formatPrice(subtotal)}`
  }

  return `Hello Native Made Accessories! 👋

I'd like to place an order:

━━━━━━━━━━━━━━━━━━━
🛍️ ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━
${itemList}

💰 Order Total: ${formatPrice(subtotal)}
${paymentSection}

💸 Payment Method: ${paymentMethod}

👤 Customer Info:
   Name: ${customerName || "Not provided"}
   Email: ${customerEmail || "Not provided"}
━━━━━━━━━━━━━━━━━━━

Please confirm availability and payment instructions. Thank you!`
}

// ─── Checkout Steps ───────────────────────────────────────────────────────────
type Step = "bag" | "payment-choice" | "payment-details" | "confirm"

// ─── Main Component ───────────────────────────────────────────────────────────
export function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, updateQuantity, removeLine } = useCart()

  const [step, setStep] = useState<Step>("bag")
  const [planChoice, setPlanChoice] = useState<"single" | "installment">("single")
  const [cadence, setCadence] = useState<Cadence>("weekly")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerWhatsapp, setCustomerWhatsapp] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [emailSending, setEmailSending] = useState(false)

  const plan = getPlanInfo(subtotal)

  const resetCheckout = () => {
    setStep("bag")
    setPlanChoice("single")
    setCadence("weekly")
    setPaymentMethod(null)
    setCustomerName("")
    setCustomerEmail("")
    setCustomerWhatsapp("")
    setSubmitted(false)
    setEmailSending(false)
  }

  const handleClose = () => {
    closeCart()
    setTimeout(resetCheckout, 400)
  }

  if (!isOpen) return null

  const waMessage = paymentMethod
    ? buildWhatsAppMessage(
        lines,
        subtotal,
        paymentMethod,
        planChoice,
        plan.installments,
        cadence,
        customerName,
        customerEmail
      )
    : ""

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  const installmentDates =
    planChoice === "installment" ? buildInstallmentDates(plan.installments, cadence) : []
  const perInstall = plan.installments > 0 ? subtotal / plan.installments : subtotal

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-background shadow-2xl"
        role="dialog"
        aria-label="Shopping bag"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          {step !== "bag" ? (
            <button
              type="button"
              onClick={() => {
                if (step === "confirm") setStep("payment-details")
                else if (step === "payment-details") setStep("payment-choice")
                else if (step === "payment-choice") setStep("bag")
              }}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" /> Back
            </button>
          ) : (
            <h2 className="font-serif text-2xl font-medium">Your Bag</h2>
          )}
          <button type="button" onClick={handleClose} aria-label="Close bag" className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* ── Step indicator ── */}
        {step !== "bag" && (
          <div className="px-6 pt-3 pb-1">
            <div className="flex items-center gap-2">
              {(["payment-choice", "payment-details", "confirm"] as Step[]).map((s, i) => {
                const steps: Step[] = ["payment-choice", "payment-details", "confirm"]
                const idx = steps.indexOf(step)
                const isActive = s === step
                const isDone = steps.indexOf(s) < idx
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                        isDone
                          ? "bg-accent text-white"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? <Check className="size-3" /> : i + 1}
                    </span>
                    <span className={cn("text-[11px] uppercase tracking-[0.12em]", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {s === "payment-choice" ? "Plan" : s === "payment-details" ? "Details" : "Review"}
                    </span>
                    {i < 2 && <ChevronRight className="size-3 text-muted-foreground/40" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STEP: BAG                                                          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === "bag" && lines.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="rounded-full bg-muted p-5">
              <svg className="size-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="font-serif text-xl font-medium">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Add something beautiful to get started.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="bg-primary px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-85"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {step === "bag" && lines.length > 0 && (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={`${line.handle}-${line.size}`} className="flex gap-4 py-5">
                  <Link href={`/product/${line.handle}`} onClick={handleClose} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={line.image || "/placeholder.svg"}
                      alt={line.title}
                      className="h-28 w-22 object-cover bg-muted rounded-sm"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${line.handle}`}
                        onClick={handleClose}
                        className="font-serif text-[15px] leading-snug hover:text-accent transition-colors"
                      >
                        {line.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeLine(line.handle, line.size)}
                        aria-label="Remove item"
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    {line.size && (
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                        {line.size}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded border border-border">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 hover:bg-secondary transition-colors"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(line.handle, line.size, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          className="px-2.5 py-1.5 hover:bg-secondary transition-colors"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(line.handle, line.size, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold text-sm">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-5 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Subtotal</span>
                <span className="font-serif text-2xl font-medium">{formatPrice(subtotal)}</span>
              </div>

              {/* Installment hint */}
              {plan.type === "installment" && (
                <div className="rounded-md bg-accent/8 border border-accent/20 px-4 py-3">
                  <p className="text-[12px] text-accent font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0" />
                    {plan.installments === 4
                      ? `Pay in 4 installments of ${formatPrice(plan.perInstallment)} — weekly or monthly`
                      : `Pay in 6 installments of ${formatPrice(plan.perInstallment)} — weekly or monthly`}
                  </p>
                </div>
              )}

              {subtotal > 0 && subtotal < 400 && (
                <p className="text-[11px] text-muted-foreground">
                  Spend {formatPrice(400 - subtotal)} more to unlock an installment plan.
                </p>
              )}

              <p className="text-[11px] text-muted-foreground">
                Shipping &amp; taxes calculated at checkout.
              </p>

              <button
                type="button"
                onClick={() => setStep("payment-choice")}
                className="w-full bg-primary py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85 shadow-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STEP: PAYMENT CHOICE (plan type + cadence)                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === "payment-choice" && (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="px-6 py-5">
              <h3 className="font-serif text-xl font-medium">Choose a Payment Plan</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Order total: <strong>{formatPrice(subtotal)}</strong></p>
            </div>

            <div className="flex-1 px-6 space-y-3">
              {/* Always show single option */}
              <button
                type="button"
                onClick={() => setPlanChoice("single")}
                className={cn(
                  "w-full rounded-lg border-2 px-5 py-4 text-left transition-all",
                  planChoice === "single"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">One-Time Payment</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">Pay the full amount at once</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg font-semibold">{formatPrice(subtotal)}</p>
                  </div>
                </div>
                {planChoice === "single" && (
                  <p className="mt-2 text-[11px] text-primary font-medium flex items-center gap-1.5">
                    <Check className="size-3.5" /> Selected
                  </p>
                )}
              </button>

              {/* Installment option — only if $400+ */}
              {plan.canChooseInstallment ? (
                <button
                  type="button"
                  onClick={() => setPlanChoice("installment")}
                  className={cn(
                    "w-full rounded-lg border-2 px-5 py-4 text-left transition-all",
                    planChoice === "installment"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        {plan.installments === 4 ? "4-Installment Plan" : "6-Installment Plan"}
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent font-semibold uppercase tracking-wide">Popular</span>
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {plan.installments} equal payments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg font-semibold text-accent">{formatPrice(perInstall)}</p>
                      <p className="text-[10px] text-muted-foreground">per installment</p>
                    </div>
                  </div>
                  {planChoice === "installment" && (
                    <p className="mt-2 text-[11px] text-accent font-medium flex items-center gap-1.5">
                      <Check className="size-3.5" /> Selected
                    </p>
                  )}
                </button>
              ) : (
                <div className="rounded-lg border border-dashed border-border px-5 py-4 opacity-60">
                  <p className="font-semibold text-sm text-muted-foreground">Installment Plans</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Available on orders $400 and above. You need{" "}
                    <strong>{formatPrice(400 - subtotal)}</strong> more to unlock.
                  </p>
                </div>
              )}

              {/* Cadence — only if installment is selected */}
              {planChoice === "installment" && (
                <div className="rounded-lg border border-border px-5 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3 flex items-center gap-2">
                    <Repeat className="size-3.5" /> Payment Frequency
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["weekly", "monthly"] as Cadence[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCadence(c)}
                        className={cn(
                          "rounded-md border py-3 text-sm font-medium capitalize transition-all",
                          cadence === c
                            ? "border-accent bg-accent text-white"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        {c === "weekly" ? "Weekly" : "Monthly"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {cadence === "weekly"
                      ? `Pay ${formatPrice(perInstall)} every week for ${plan.installments} weeks.`
                      : `Pay ${formatPrice(perInstall)} every month for ${plan.installments} months.`}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t border-border">
              <button
                type="button"
                onClick={() => setStep("payment-details")}
                className="w-full bg-primary py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STEP: PAYMENT DETAILS (method + customer info)                     */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === "payment-details" && (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="px-6 py-5">
              <h3 className="font-serif text-xl font-medium">Payment Details</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                How would you like to pay?
              </p>
            </div>

            <div className="flex-1 px-6 space-y-5">
              {/* Payment method */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                  Select Payment Method
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={cn(
                        "rounded-lg border-2 px-3 py-3 text-[12px] font-semibold transition-all",
                        paymentMethod === m
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer info */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your Info
                </p>
                <div>
                  <label className="text-[12px] text-muted-foreground block mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground block mb-1.5">WhatsApp Number <span className="text-muted-foreground/60">(optional)</span></label>
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  An order summary will be emailed to the address above and also sent to our team at{" "}
                  <span className="text-accent">{CONTACT_EMAIL}</span>.
                </p>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-border">
              <button
                type="button"
                disabled={!paymentMethod}
                onClick={() => setStep("confirm")}
                className="w-full bg-primary py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Review Order
              </button>
              {!paymentMethod && (
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Please select a payment method to continue.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/*  STEP: CONFIRM / ORDER SUMMARY                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="px-6 py-5">
              <h3 className="font-serif text-xl font-medium">Order Review</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Confirm your details and submit your order.
              </p>
            </div>

            <div className="flex-1 px-6 space-y-5">
              {/* Items summary */}
              <div className="rounded-lg bg-secondary px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                  Items ({lines.reduce((s, l) => s + l.quantity, 0)})
                </p>
                <ul className="space-y-2">
                  {lines.map((l) => (
                    <li key={`${l.handle}-${l.size}`} className="flex items-start justify-between gap-3 text-[13px]">
                      <span className="text-foreground/80">
                        {l.title}
                        {l.size ? ` · ${l.size}` : ""} × {l.quantity}
                      </span>
                      <span className="font-semibold shrink-0">{formatPrice(l.price * l.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-border pt-3 flex justify-between text-sm">
                  <span className="font-medium">Total</span>
                  <span className="font-serif text-base font-semibold">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Payment plan summary */}
              <div className="rounded-lg border border-border px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                  Payment Plan
                </p>
                {planChoice === "single" ? (
                  <div className="flex justify-between text-sm">
                    <span>One-time payment</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-medium capitalize">
                        {plan.installments} × {cadence} installments
                      </span>
                      <span className="font-semibold text-accent">{formatPrice(perInstall)} / payment</span>
                    </div>
                    <ul className="space-y-1.5">
                      {installmentDates.map((d, i) => (
                        <li key={i} className="flex justify-between text-[12px] text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <span className="flex size-4 items-center justify-center rounded-full bg-accent/15 text-[9px] font-bold text-accent">
                              {i + 1}
                            </span>
                            {d}
                          </span>
                          <span className="font-medium text-foreground">{formatPrice(perInstall)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Payment method + customer */}
              <div className="rounded-lg border border-border px-4 py-4 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment via</span>
                  <span className="font-semibold">{paymentMethod}</span>
                </div>
                {customerName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{customerName}</span>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-[12px] break-all">{customerEmail}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-accent/8 border border-accent/20 px-4 py-3 text-[12px] text-accent">
                <p className="font-medium mb-0.5">How it works:</p>
                <p className="text-accent/80">
                  After submitting, our team will contact you via WhatsApp or email with payment
                  instructions. Your order is confirmed once your first payment is received.
                </p>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-border space-y-3">
              {/* WhatsApp submit — opens WhatsApp AND fires the email API */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setSubmitted(true)
                  if (!emailSending) {
                    setEmailSending(true)
                    const orderPayload = {
                      customerName,
                      customerEmail,
                      customerWhatsapp,
                      items: lines.map((l) => ({
                        title: l.title,
                        size: l.size,
                        quantity: l.quantity,
                        price: l.price,
                      })),
                      subtotal,
                      paymentMethod,
                      planType: planChoice,
                      installments: plan.installments,
                      cadence,
                      installmentDates:
                        planChoice === "installment" ? installmentDates : [],
                      waMessage,
                    }
                    // Fire both APIs concurrently — neither blocks the WA redirect
                    Promise.allSettled([
                      fetch("/api/save-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderPayload),
                      }),
                      fetch("/api/send-order-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderPayload),
                      }),
                    ])
                      .then((results) => {
                        results.forEach((r, i) => {
                          if (r.status === "rejected") {
                            console.error(`[cart] API ${i === 0 ? "save-order" : "email"} failed:`, r.reason)
                          }
                        })
                      })
                      .finally(() => setEmailSending(false))
                  }
                }}
                className="flex w-full items-center justify-center gap-2.5 bg-[#25d366] hover:bg-[#20bd5a] py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-colors shadow-md rounded-sm"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Submit Order via WhatsApp
              </a>

              {submitted && (
                <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-[12px] text-green-700 flex items-start gap-2">
                  <Check className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Order sent!</p>
                    <p>We received your details. Our team will reach out shortly to confirm your order and payment.</p>
                  </div>
                </div>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                Questions? Email us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
