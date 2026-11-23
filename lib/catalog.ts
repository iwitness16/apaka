import type { CategorySlug, Product } from "./types"

export interface CategoryMeta {
  slug: CategorySlug
  label: string
  group: "top" | "jewelry" | "more"
}

export const categories: CategoryMeta[] = [
  { slug: "turquoise-jewelry", label: "Turquoise Jewelry",  group: "top"     },
  { slug: "statement-pieces",  label: "Statement Pieces",   group: "top"     },
  { slug: "accessories",       label: "Accessories",        group: "jewelry" },
  { slug: "bags",              label: "Bags",               group: "more"    },
  { slug: "home",              label: "Home & Decor",       group: "more"    },
  { slug: "western-belts",     label: "Western Belts",      group: "more"    },
  { slug: "footwear",          label: "Footwear",           group: "more"    },
]

export function getCategory(slug: string): CategoryMeta | undefined {
  return categories.find((c) => c.slug === slug)
}

export function categoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price)
}

// ── Static fallback (home page rails use these when DB is not needed) ──────────
export function allProducts(): Product[] { return [] }
export function getProductsByCategory(_slug: string): Product[] { return [] }
export function getProduct(_handle: string): Product | undefined { return undefined }
export function relatedProducts(_product: Product, _limit = 4): Product[] { return [] }
