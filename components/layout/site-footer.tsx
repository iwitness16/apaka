"use client"

import Link from "next/link"
import { Mail } from "lucide-react"

const WHATSAPP_NUMBER = "17153500002"
const WHATSAPP_DISPLAY = "+1 (715) 350-0002"
const CONTACT_EMAIL = "orders.nativemadeaccessories@gmail.com"

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-header text-header-foreground">
      {/* Payment plans banner */}
      <div className="bg-accent py-3.5 text-center text-[11.5px] font-semibold uppercase tracking-[0.22em] text-white">
        Flexible payment plans available — Buy now, pay in installments
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.jpg" alt="Native Made Accessories" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-base font-semibold">Native Made</span>
                <span className="text-[9.5px] uppercase tracking-[0.28em] text-header-foreground/60">Accessories</span>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-header-foreground/60 max-w-xs">
              Handcrafted sterling silver, genuine turquoise, and curated artisan accessories rooted in Native tradition.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                {/* Instagram icon */}
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email us"
                className="transition-colors hover:text-accent"
              >
                <Mail className="size-5" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#25d366]"
              >
                {/* WhatsApp icon as SVG */}
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-header-foreground/50">
              Shop
            </h4>
            <ul className="space-y-3 text-[13px] text-header-foreground/75">
              <li><Link href="/new-arrivals" className="hover:text-accent transition-colors">New Arrivals</Link></li>
              <li><Link href="/category/turquoise-jewelry" className="hover:text-accent transition-colors">Turquoise Jewelry</Link></li>
              <li><Link href="/category/statement-pieces" className="hover:text-accent transition-colors">Statement Pieces</Link></li>
              <li><Link href="/category/tops" className="hover:text-accent transition-colors">Tops</Link></li>
              <li><Link href="/category/dresses-rompers" className="hover:text-accent transition-colors">Dresses & Rompers</Link></li>
              <li><Link href="/category/western-belts" className="hover:text-accent transition-colors">Western Belts</Link></li>
              <li><Link href="/category/footwear" className="hover:text-accent transition-colors">Footwear</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-header-foreground/50">
              Help
            </h4>
            <ul className="space-y-3 text-[13px] text-header-foreground/75">
              <li><Link href="/" className="hover:text-accent transition-colors">FAQs</Link></li>
              <li><Link href="/" className="hover:text-accent transition-colors">Shipping Info</Link></li>
              <li><Link href="/" className="hover:text-accent transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/" className="hover:text-accent transition-colors">Payment Plans</Link></li>
              <li><Link href="/" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-header-foreground/50">
              Contact Us
            </h4>
            <ul className="space-y-4 text-[13px] text-header-foreground/75">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 hover:text-[#25d366] transition-colors group"
                >
                  <svg className="size-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>
                    <span className="block text-[11px] uppercase tracking-[0.12em] text-header-foreground/50 mb-0.5">WhatsApp Support</span>
                    {WHATSAPP_DISPLAY}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-2.5 hover:text-accent transition-colors"
                >
                  <Mail className="size-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-[11px] uppercase tracking-[0.12em] text-header-foreground/50 mb-0.5">Orders & Inquiries</span>
                    {CONTACT_EMAIL}
                  </span>
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="mb-3 text-[12px] font-medium text-header-foreground/80">
                Get exclusive drops & offers
              </p>
              <form
                className="flex overflow-hidden rounded-md border border-white/15"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email"
                  aria-label="Email"
                  className="w-full bg-transparent px-3 py-2.5 text-[12px] outline-none placeholder:text-header-foreground/35"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-accent px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-[11.5px] text-header-foreground/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Native Made Accessories. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-header-foreground/70 transition-colors">Refund Policy</Link>
            <Link href="/" className="hover:text-header-foreground/70 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-header-foreground/70 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
