"use client"

import Link from "next/link"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"

export function ProductRail({
  title,
  href,
  products,
}: {
  title: string
  href: string
  products: Product[]
}) {
  const railRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" })
  }

  if (products.length === 0) return null

  return (
    <section className="py-12">
      <div className="mx-auto flex max-w-[1400px] items-end justify-between px-4 lg:px-8">
        <h2 className="font-serif text-3xl tracking-[0.05em] lg:text-4xl">{title}</h2>
        <div className="flex items-center gap-3">
          <Link
            href={href}
            className="hidden text-xs uppercase tracking-[0.15em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:block"
          >
            View all
          </Link>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
            className="flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
            className="flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar mt-6 flex snap-x gap-5 overflow-x-auto px-4 lg:px-8"
      >
        {products.map((product) => (
          <ProductCard
            key={product.handle}
            product={product}
            className="w-[70%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]"
          />
        ))}
      </div>
    </section>
  )
}
