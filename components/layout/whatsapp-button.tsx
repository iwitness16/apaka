"use client"

import { useState } from "react"
import { X } from "lucide-react"

const WHATSAPP_NUMBER = "17153500002"
const WHATSAPP_DISPLAY = "+1 (715) 350-0002"

export function WhatsAppButton() {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I'm browsing Native Made Accessories and have a question. Can you help me?"
  )}`

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3"
      style={{ fontFamily: "var(--font-dm-sans, sans-serif)" }}
    >
      {/* Tooltip / preview card */}
      {expanded && !dismissed && (
        <div className="relative w-[260px] sm:w-[300px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/8 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Card header */}
          <div className="bg-[#075e54] px-4 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.jpg" alt="NMA Support" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">NMA Support</p>
                <p className="text-white/70 text-[11px]">Typically replies instantly</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Close"
              className="text-white/60 hover:text-white transition-colors mt-0.5"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Chat bubble */}
          <div className="px-4 py-4 bg-[#e5ddd5]">
            <div className="bg-white rounded-lg rounded-tl-sm px-3.5 py-2.5 max-w-[90%] shadow-sm">
              <p className="text-[13px] text-gray-800 leading-relaxed">
                👋 Hi there! Welcome to <strong>Native Made Accessories</strong>. How can we help you today?
              </p>
              <p className="text-[10px] text-gray-400 mt-1.5 text-right">Support team</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 pb-4 bg-[#e5ddd5]">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25d366] hover:bg-[#20bd5a] text-white font-semibold text-[13px] py-3 rounded-full transition-colors shadow-md"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => {
          setDismissed(false)
          setExpanded((v) => !v)
        }}
        aria-label="Contact Support on WhatsApp"
        className={`
          wa-pulse flex items-center gap-2.5 bg-[#25d366] hover:bg-[#20bd5a]
          text-white shadow-xl transition-all duration-300
          ${expanded ? "rounded-full px-4 py-3" : "rounded-full px-4 py-3 sm:rounded-2xl"}
        `}
      >
        <svg className="size-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-[12px] font-semibold tracking-wide hidden sm:inline whitespace-nowrap">
          {expanded ? "Close" : "Contact Support"}
        </span>
      </button>
    </div>
  )
}
