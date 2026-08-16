/**
 * catalog.ts
 *
 * Static metadata (categories, labels, formatPrice) and legacy static-data
 * functions used by the home page product rails.
 *
 * Dynamic pages (category/[slug], product/[handle], new-arrivals) import
 * directly from lib/products-service.ts instead.
 */

import { products } from "./products-data"
import type { CategorySlug, Product } from "./types"

// ─── Category metadata ────────────────────────────────────────────────────────
export interface CategoryMeta {
  slug: CategorySlug
  label: string
  group: "clothing" | "more" | "top"
}

export const categories: CategoryMeta[] = [
  { slug: "turquoise-jewelry", label: "Turquoise Jewelry",   group: "top"      },
  { slug: "statement-pieces",  label: "Statement Pieces",    group: "top"      },
  { slug: "tops",              label: "Tops",                group: "clothing" },
  { slug: "bottoms",           label: "Bottoms / Jeans",     group: "clothing" },
  { slug: "dresses-rompers",   label: "Dresses / Rompers",   group: "clothing" },
  { slug: "graphic-tees",      label: "Graphic Tees",        group: "clothing" },
  { slug: "western-belts",     label: "Western Belts",       group: "clothing" },
  { slug: "outerwear",         label: "Outerwear",           group: "clothing" },
  { slug: "footwear",          label: "Footwear",            group: "clothing" },
  { slug: "bags",              label: "Bags",                group: "more"     },
  { slug: "accessories",       label: "Accessories",         group: "more"     },
  { slug: "home",              label: "Home",                group: "more"     },
]

export function getCategory(slug: string): CategoryMeta | undefined {
  return categories.find((c) => c.slug === slug)
}

export function categoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

// ─── Static functions (home page product rails — data from products-data.ts) ──

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.category === slug)
}

export function getProduct(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle)
}

export function allProducts(): Product[] {
  return products
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.handle !== product.handle)
    .slice(0, limit)
}
