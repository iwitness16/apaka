"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/adminapaka",        label: "Dashboard",  icon: LayoutDashboard },
  { href: "/adminapaka/orders", label: "All Orders", icon: ShoppingBag     },
]

export function AdminSidebar() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/adminapaka/login")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#c0392b]/20">
          <ShieldCheck className="size-5 text-[#c0392b]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white">NMA Admin</p>
          <p className="text-[10px] text-white/40">Native Made Accessories</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/adminapaka"
              ? pathname === "/adminapaka"
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-[#c0392b]/20 text-[#e74c3c]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0" />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
        <p className="mt-3 px-4 text-[10px] text-white/25">
          Logged in as <span className="text-white/40">adminuser</span>
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-xl bg-[#1a1008]/80 text-white shadow-lg backdrop-blur-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#150d05] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white"
            >
              <X className="size-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col bg-[#150d05] shadow-2xl lg:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
