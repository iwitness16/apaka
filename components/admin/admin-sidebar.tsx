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

function SidebarContent({
  onNavClick,
  onLogout,
  loggingOut,
  pathname,
}: {
  onNavClick: () => void
  onLogout: () => void
  loggingOut: boolean
  pathname: string
}) {
  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
          <ShieldCheck className="size-5 text-red-600" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-gray-900">NMA Admin</p>
          <p className="truncate text-[10px] text-gray-400">Native Made Accessories</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/adminapaka"
              ? pathname === "/adminapaka"
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-red-50 text-red-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
        >
          <LogOut className="size-4 shrink-0" />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
        <p className="mt-2 px-4 text-[10px] text-gray-400">
          Signed in as <span className="font-medium text-gray-600">adminuser</span>
        </p>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const [open, setOpen]           = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/adminapaka/login")
    router.refresh()
  }

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-red-50">
            <ShieldCheck className="size-4 text-red-600" />
          </div>
          <span className="text-sm font-bold text-gray-900">NMA Admin</span>
        </div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X className="size-4" />
            </button>
            <SidebarContent
              onNavClick={() => setOpen(false)}
              onLogout={handleLogout}
              loggingOut={loggingOut}
              pathname={pathname}
            />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 shadow-sm lg:block">
        <SidebarContent
          onNavClick={() => {}}
          onLogout={handleLogout}
          loggingOut={loggingOut}
          pathname={pathname}
        />
      </aside>
    </>
  )
}
