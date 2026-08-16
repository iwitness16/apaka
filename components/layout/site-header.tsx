"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react"
import { categories } from "@/lib/catalog"
import { useCart } from "@/components/cart/cart-provider"
import { SearchOverlay } from "@/components/layout/search-bar"
import { cn } from "@/lib/utils"

const clothing = categories.filter((c) => c.group === "clothing")
const more = categories.filter((c) => c.group === "more")

export function SiteHeader() {
  const { count, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-header text-header-foreground shadow-md">
        {/* Announcement bar */}
        <div className="bg-accent/90 py-2 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-white">
          Free shipping on orders over $120 &nbsp;·&nbsp; Handcrafted with love
        </div>

        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-8">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden transition-opacity hover:opacity-70"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="mr-auto lg:mr-8 flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.jpg"
                alt="Native Made Accessories"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[15px] font-semibold tracking-wide lg:text-[17px]">
                Native Made
              </span>
              <span className="text-[10px] font-light uppercase tracking-[0.28em] text-header-foreground/70 lg:text-[10.5px]">
                Accessories
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-[12.5px] font-medium uppercase tracking-[0.14em] lg:flex">
            <NavLink href="/new-arrivals">New In</NavLink>
            <NavLink href="/category/statement-pieces">Statement</NavLink>
            <NavLink href="/category/turquoise-jewelry">Turquoise</NavLink>
            <Dropdown label="Clothing" items={clothing} />
            <Dropdown label="More" items={more} />
            <NavLink href="/category/western-belts">Belts</NavLink>
            <NavLink href="/category/footwear">Footwear</NavLink>
          </nav>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-4 lg:ml-8">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="transition-opacity hover:opacity-70"
            >
              <Search className="size-[18px]" />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Cart, ${count} items`}
              className="relative transition-opacity hover:opacity-70"
            >
              <ShoppingBag className="size-[18px]" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex size-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </header>

      {/* Search overlay — rendered outside header so it covers full page */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap transition-colors hover:text-accent relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
    >
      {children}
    </Link>
  )
}

function Dropdown({
  label,
  items,
}: {
  label: string
  items: { slug: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 uppercase tracking-[0.14em] transition-colors hover:text-accent"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown className={cn("size-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 min-w-[200px] -translate-x-1/2 pt-3">
          <ul className="rounded-md border border-white/10 bg-header py-2 shadow-2xl ring-1 ring-black/10">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/category/${item.slug}`}
                  className="block px-5 py-2.5 text-[12px] uppercase tracking-[0.12em] transition-colors hover:bg-white/5 hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col overflow-y-auto bg-header px-6 py-5 text-header-foreground shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.jpg" alt="Native Made Accessories" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-sm font-semibold">Native Made</span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-header-foreground/60">Accessories</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu" className="transition-opacity hover:opacity-70">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 text-sm uppercase tracking-[0.12em]">
          <Link href="/new-arrivals" onClick={onClose} className="rounded py-3 px-2 font-medium hover:bg-white/5 hover:text-accent transition-colors">
            New In
          </Link>
          <Link href="/category/turquoise-jewelry" onClick={onClose} className="rounded py-3 px-2 font-medium hover:bg-white/5 hover:text-accent transition-colors">
            Turquoise Jewelry
          </Link>
          <Link href="/category/statement-pieces" onClick={onClose} className="rounded py-3 px-2 font-medium hover:bg-white/5 hover:text-accent transition-colors">
            Statement Pieces
          </Link>

          <p className="mt-4 mb-1 px-2 text-[10px] text-header-foreground/50 tracking-[0.2em]">Clothing</p>
          {clothing.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClose} className="rounded py-2.5 px-4 text-[12px] hover:bg-white/5 hover:text-accent transition-colors">
              {c.label}
            </Link>
          ))}

          <p className="mt-4 mb-1 px-2 text-[10px] text-header-foreground/50 tracking-[0.2em]">More</p>
          {more.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} onClick={onClose} className="rounded py-2.5 px-4 text-[12px] hover:bg-white/5 hover:text-accent transition-colors">
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-6 text-[11px] text-header-foreground/50">
          <p>WhatsApp: +1 (715) 350-0002</p>
          <p className="mt-1">orders.nativemadeaccessories@gmail.com</p>
        </div>
      </div>
    </div>
  )
}
