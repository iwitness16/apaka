"use client"

import { useMemo, useState } from "react"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

type SortKey = "featured" | "price-asc" | "price-desc" | "az"

const PAGE_SIZE = 24

export function CollectionView({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortKey>("featured")
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<"all" | "u100" | "u250" | "u500" | "o500">("all")

  /* ── Derived price buckets ── */
  const filtered = useMemo(() => {
    let list = products

    // Price filter
    switch (priceRange) {
      case "u100": list = list.filter((p) => p.price < 100);      break
      case "u250": list = list.filter((p) => p.price < 250);      break
      case "u500": list = list.filter((p) => p.price < 500);      break
      case "o500": list = list.filter((p) => p.price >= 500);     break
    }

    // Sort
    list = [...list]
    switch (sort) {
      case "price-asc":  list.sort((a, b) => a.price - b.price);           break
      case "price-desc": list.sort((a, b) => b.price - a.price);           break
      case "az":         list.sort((a, b) => a.title.localeCompare(b.title)); break
    }
    return list
  }, [products, priceRange, sort])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged       = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasFilter = priceRange !== "all"

  const clearFilters = () => {
    setPriceRange("all")
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 lg:px-8">

      {/* ── Toolbar ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        {/* Filter toggle (mobile) / label (desktop) */}
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {hasFilter && (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              1
            </span>
          )}
        </button>

        {/* Product count */}
        <span className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </span>

        {/* Sort */}
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:block">Sort</span>
          <span className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1) }}
              className="appearance-none rounded border border-border bg-background py-2 pl-3 pr-9 text-sm outline-none focus:border-primary"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="az">A → Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>
      </div>

      <div className="flex gap-8">

        {/* ── Sidebar (desktop always visible, mobile toggled) ── */}
        <aside className={cn(
          "w-52 shrink-0",
          "hidden lg:block",              // always show on lg+
          filterOpen && "!block w-full",  // show on mobile when open
        )}>
          <div className="sticky top-24 space-y-6">

            {/* Price filter */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Price
              </p>
              <ul className="space-y-2">
                {[
                  { key: "all",  label: "All prices"    },
                  { key: "u100", label: "Under $100"    },
                  { key: "u250", label: "Under $250"    },
                  { key: "u500", label: "Under $500"    },
                  { key: "o500", label: "$500 and above"},
                ].map(({ key, label }) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => { setPriceRange(key as typeof priceRange); setPage(1) }}
                      className={cn(
                        "w-full rounded px-3 py-2 text-left text-sm transition-colors",
                        priceRange === key
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-secondary"
                      )}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clear */}
            {hasFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-accent hover:underline"
              >
                <X className="size-3.5" />
                Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div className="min-w-0 flex-1">
          {paged.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              <p className="text-lg">No products match your filters.</p>
              {hasFilter && (
                <button onClick={clearFilters} className="mt-4 text-sm text-accent hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {paged.map((product) => (
                <ProductCard key={product.handle} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex flex-wrap items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-secondary"
              >
                Prev
              </button>

              {/* Show at most 7 page buttons around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n =>
                  n === 1 ||
                  n === totalPages ||
                  Math.abs(n - currentPage) <= 2
                )
                .reduce<(number | "…")[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…")
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n as number)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded text-sm transition-colors",
                        n === currentPage
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "border border-border hover:bg-secondary"
                      )}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-secondary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
