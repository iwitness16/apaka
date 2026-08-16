import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  title: string
  size?: string
  quantity: number
  price: number
}

interface OrderEmailPayload {
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  paymentMethod: string
  planType: "single" | "installment"
  installments: number
  cadence: "weekly" | "monthly"
  installmentDates?: string[]
  waMessage?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(amount: number) {
  return `$${Number(amount).toFixed(2)}`
}

function buildInstallmentDates(n: number, cadence: "weekly" | "monthly"): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now)
    if (cadence === "weekly") d.setDate(now.getDate() + i * 7)
    else d.setMonth(now.getMonth() + i)
    dates.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))
  }
  return dates
}

// ─── HTML email builder ────────────────────────────────────────────────────────
function buildOrderEmailHtml(payload: OrderEmailPayload, isAdmin: boolean): string {
  const {
    customerName,
    customerEmail,
    items,
    subtotal,
    paymentMethod,
    planType,
    installments,
    cadence,
  } = payload

  const perInstall = subtotal / (installments || 1)
  const dates =
    planType === "installment"
      ? buildInstallmentDates(installments, cadence)
      : []

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;color:#2d1f14;font-size:14px;">
          ${item.title}${item.size ? ` <span style="color:#8c6f5a;font-size:12px;">(${item.size})</span>` : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;color:#2d1f14;font-size:14px;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe4;color:#2d1f14;font-size:14px;text-align:right;font-weight:600;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("")

  const paymentSection =
    planType === "single"
      ? `<p style="margin:0 0 6px;font-size:14px;color:#2d1f14;">
           <strong>Plan:</strong> One-time payment of <strong>${formatPrice(subtotal)}</strong>
         </p>`
      : `<p style="margin:0 0 6px;font-size:14px;color:#2d1f14;">
           <strong>Plan:</strong> ${installments} ${cadence} installments of <strong>${formatPrice(perInstall)}</strong> each
         </p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
           ${dates
             .map(
               (d, i) => `
             <tr>
               <td style="padding:5px 0;font-size:13px;color:#8c6f5a;">Installment ${i + 1}</td>
               <td style="padding:5px 0;font-size:13px;color:#8c6f5a;text-align:center;">${d}</td>
               <td style="padding:5px 0;font-size:13px;color:#2d1f14;text-align:right;font-weight:600;">${formatPrice(perInstall)}</td>
             </tr>`
             )
             .join("")}
         </table>`

  const greeting = isAdmin
    ? `<p style="font-size:15px;color:#2d1f14;margin:0 0 16px;">
         📦 New order received from <strong>${customerName || "a customer"}</strong>
         ${customerEmail ? `(${customerEmail})` : ""}.
       </p>`
    : `<p style="font-size:15px;color:#2d1f14;margin:0 0 16px;">
         Hi ${customerName ? `<strong>${customerName}</strong>` : "there"},<br><br>
         Thank you for your order! Here's a summary of what you've requested.
         Our team will reach out via WhatsApp or email shortly with payment instructions.
       </p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order ${isAdmin ? "Notification" : "Confirmation"} — Native Made Accessories</title>
</head>
<body style="margin:0;padding:0;background:#faf7f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#c0392b;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.04em;font-family:Georgia,serif;">
                Native Made Accessories
              </h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.8);letter-spacing:0.12em;text-transform:uppercase;">
                ${isAdmin ? "New Order Received" : "Order Confirmation"}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              ${greeting}

              <!-- Items table -->
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#8c6f5a;letter-spacing:0.12em;text-transform:uppercase;">
                Order Items
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ebe4;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                <thead>
                  <tr style="background:#faf7f4;">
                    <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c6f5a;text-align:left;">Item</th>
                    <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c6f5a;text-align:center;">Qty</th>
                    <th style="padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8c6f5a;text-align:right;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr style="background:#faf7f4;">
                    <td colspan="2" style="padding:10px 12px;font-size:14px;font-weight:700;color:#2d1f14;">Total</td>
                    <td style="padding:10px 12px;font-size:16px;font-weight:700;color:#c0392b;text-align:right;font-family:Georgia,serif;">
                      ${formatPrice(subtotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Payment plan -->
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#8c6f5a;letter-spacing:0.12em;text-transform:uppercase;">
                Payment Details
              </h2>
              <div style="background:#faf7f4;border:1px solid #f0ebe4;border-radius:6px;padding:16px 18px;margin-bottom:24px;">
                ${paymentSection}
                <p style="margin:8px 0 0;font-size:14px;color:#2d1f14;">
                  <strong>Payment Method:</strong> ${paymentMethod}
                </p>
              </div>

              ${
                isAdmin
                  ? `<!-- Customer info (admin only) -->
              <h2 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#8c6f5a;letter-spacing:0.12em;text-transform:uppercase;">
                Customer Info
              </h2>
              <div style="background:#faf7f4;border:1px solid #f0ebe4;border-radius:6px;padding:16px 18px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:14px;color:#2d1f14;"><strong>Name:</strong> ${customerName || "Not provided"}</p>
                <p style="margin:0;font-size:14px;color:#2d1f14;"><strong>Email:</strong> ${customerEmail || "Not provided"}</p>
              </div>`
                  : `<!-- Next steps (customer only) -->
              <div style="background:#fff8f0;border:1px solid #e8cba8;border-radius:6px;padding:16px 18px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#c0392b;">What happens next?</p>
                <p style="margin:0;font-size:13px;color:#5a3e2b;line-height:1.6;">
                  Our team will contact you via WhatsApp or email with your payment instructions.
                  Your order is confirmed once your first payment is received. Questions? Reply to this email
                  or message us on WhatsApp at <strong>+1 (715) 350-0002</strong>.
                </p>
              </div>`
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#2d1f14;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);">
                Native Made Accessories · WhatsApp: +1 (715) 350-0002 · orders.nativemadeaccessories@gmail.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Plain-text fallback ───────────────────────────────────────────────────────
function buildOrderEmailText(payload: OrderEmailPayload, isAdmin: boolean): string {
  const { customerName, customerEmail, items, subtotal, paymentMethod, planType, installments, cadence } = payload
  const perInstall = subtotal / (installments || 1)
  const dates = planType === "installment" ? buildInstallmentDates(installments, cadence) : []

  const itemList = items
    .map((i) => `  • ${i.title}${i.size ? ` (${i.size})` : ""} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`)
    .join("\n")

  const paymentSection =
    planType === "single"
      ? `Payment: One-time ${formatPrice(subtotal)}`
      : [
          `Payment Plan: ${installments} ${cadence} installments of ${formatPrice(perInstall)}`,
          "",
          "Schedule:",
          ...dates.map((d, i) => `  ${i + 1}. ${d} — ${formatPrice(perInstall)}`),
        ].join("\n")

  return [
    isAdmin ? "NEW ORDER — Native Made Accessories" : "Order Confirmation — Native Made Accessories",
    "=".repeat(50),
    "",
    isAdmin
      ? `Customer: ${customerName || "N/A"} | ${customerEmail || "N/A"}`
      : `Hi ${customerName || "there"}, thank you for your order!`,
    "",
    "ITEMS:",
    itemList,
    "",
    `Order Total: ${formatPrice(subtotal)}`,
    "",
    paymentSection,
    "",
    `Payment Method: ${paymentMethod}`,
    "",
    "─".repeat(40),
    "Native Made Accessories",
    "WhatsApp: +1 (715) 350-0002",
    "orders.nativemadeaccessories@gmail.com",
  ].join("\n")
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Validate env vars
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_APP_PASSWORD
  const adminEmail = process.env.ADMIN_EMAIL

  if (!emailUser || !emailPass || !adminEmail) {
    console.error("[send-order-email] Missing email environment variables")
    return NextResponse.json(
      { error: "Email service is not configured. Set EMAIL_USER, EMAIL_APP_PASSWORD, and ADMIN_EMAIL in .env.local" },
      { status: 500 }
    )
  }

  // Parse body
  let payload: OrderEmailPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Basic validation
  if (!payload.items || payload.items.length === 0) {
    return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 })
  }

  // Build Nodemailer transporter (Gmail with App Password)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  })

  const subject = `Order from ${payload.customerName || "a customer"} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  // Fire both emails concurrently
  const sendResults = await Promise.allSettled([
    // 1. Admin notification
    transporter.sendMail({
      from: `"Native Made Accessories" <${emailUser}>`,
      to: adminEmail,
      subject: `[NMA Order] ${subject}`,
      text: buildOrderEmailText(payload, true),
      html: buildOrderEmailHtml(payload, true),
    }),

    // 2. Customer confirmation (only if they provided an email)
    ...(payload.customerEmail
      ? [
          transporter.sendMail({
            from: `"Native Made Accessories" <${emailUser}>`,
            to: payload.customerEmail,
            replyTo: adminEmail,
            subject: `Your order confirmation — Native Made Accessories`,
            text: buildOrderEmailText(payload, false),
            html: buildOrderEmailHtml(payload, false),
          }),
        ]
      : []),
  ])

  // Log any failures but don't block — WhatsApp is the primary channel
  const failed = sendResults.filter((r) => r.status === "rejected")
  if (failed.length > 0) {
    failed.forEach((r) => {
      if (r.status === "rejected") {
        console.error("[send-order-email] Failed to send:", r.reason)
      }
    })
  }

  const adminSent = sendResults[0].status === "fulfilled"
  const customerSent =
    payload.customerEmail ? sendResults[1]?.status === "fulfilled" : null

  return NextResponse.json({
    success: true,
    adminSent,
    customerSent,
    message: adminSent
      ? "Order emails sent successfully."
      : "Admin email failed — check server logs.",
  })
}
