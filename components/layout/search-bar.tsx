"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/catalog"

interface SearchResult {
  handle: string
  title: string
  price: number
  images: string[]
  category: string
}

export function SearchBar({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json.results ?? [])
      setOpen(true)
      setHighlighted(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 250)
  }

  const handleSelect = (result: SearchResult) => {
    router.push(`/product/${result.handle}`)
    setOpen(false)
    setQuery("")
    onClose?.()
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") { handleClear(); onClose?.() }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlighted >= 0) handleSelect(results[highlighted])
      else if (results.length > 0) handleSelect(results[0])
    } else if (e.key === "Escape") {
      setOpen(false)
      onClose?.()
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [highlighted])

  // Click outside to close
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const firstImage = (r: SearchResult) =>
    r.images?.find((img) => img && !/\.heic(\?|$)/i.test(img)) ?? ""

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search products…"
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-10 text-sm outline-none ring-0 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {loading && (
          <Loader2 className="absolute right-4 size-4 animate-spin text-muted-foreground" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {results.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No products found for &ldquo;<strong>{query}</strong>&rdquo;
            </div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ul ref={listRef} className="max-h-[420px] overflow-y-auto py-1">
                {results.map((r, i) => (
                  <li key={r.handle}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlighted(i)}
                      onClick={() => handleSelect(r)}
                      className={cn(
                        "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors",
                        highlighted === i ? "bg-secondary" : "hover:bg-secondary"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="size-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                        {firstImage(r) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firstImage(r)}
                            alt=""
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <Search className="size-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-snug">
                          {r.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">
                          {r.category.replace(/-/g, " ")}
                        </p>
                      </div>

                      {/* Price */}
                      <span className="shrink-0 text-sm font-semibold">
                        {formatPrice(r.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border px-4 py-2.5">
                <p className="text-[11px] text-muted-foreground">
                  Press <kbd className="rounded border border-border bg-secondary px-1 py-px font-mono text-[10px]">↑↓</kbd> to navigate,{" "}
                  <kbd className="rounded border border-border bg-secondary px-1 py-px font-mono text-[10px]">Enter</kbd> to select,{" "}
                  <kbd className="rounded border border-border bg-secondary px-1 py-px font-mono text-[10px]">Esc</kbd> to close
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Search Overlay (full-screen modal version for header) ────────────────────
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  // Close on Escape at the overlay level
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Search panel */}
      <div className="relative z-10 bg-background px-4 py-5 shadow-2xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <SearchBar onClose={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}


