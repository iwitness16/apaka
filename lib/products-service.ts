/**
 * products-service.ts
 *
 * All async data-fetching functions that hit Supabase.
 * Used by dynamic pages: /category/[slug], /product/[handle], /new-arrivals
 *
 * The home page continues to use the static functions in catalog.ts.
 */

import { supabase } from "./supabase"
import type { Product, CategorySlug } from "./types"

// ─── Row shape returned by Supabase ──────────────────────────────────────────
interface ProductRow {
  handle: string
  title: string
  description: string
  price: number
  category: string
  images: string[]
  sizes: string[]
  option_name: string
  vendor?: string
  tags?: string[]
  is_active?: boolean
}

// ─── Map DB row → Product interface ──────────────────────────────────────────
function toProduct(row: ProductRow): Product {
  return {
    handle: row.handle,
    title: row.title,
    description: row.description ?? "",
    price: Number(row.price),
    category: row.category as CategorySlug,
    images: row.images ?? [],
    sizes: row.sizes ?? [],
    optionName: row.option_name ?? "",
  }
}

// ─── Fetch all products in a category ────────────────────────────────────────
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, description, price, category, images, sizes, option_name")
    .eq("category", slug)
    .eq("is_active", true)
    .order("title", { ascending: true })

  if (error) {
    console.error("[products-service] getProductsByCategory error:", error.message)
    return []
  }

  return (data as ProductRow[]).map(toProduct)
}

// ─── Fetch a single product by handle ────────────────────────────────────────
export async function getProduct(handle: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, description, price, category, images, sizes, option_name")
    .eq("handle", handle)
    .eq("is_active", true)
    .single()

  if (error) {
    // "PGRST116" = no rows found — not a real error
    if (error.code !== "PGRST116") {
      console.error("[products-service] getProduct error:", error.message)
    }
    return null
  }

  return toProduct(data as ProductRow)
}

// ─── Fetch all active products (new-arrivals) ─────────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, description, price, category, images, sizes, option_name")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[products-service] getAllProducts error:", error.message)
    return []
  }

  return (data as ProductRow[]).map(toProduct)
}

// ─── Fetch related products (same category, excluding current) ───────────────
export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, description, price, category, images, sizes, option_name")
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("handle", product.handle)
    .order("title", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[products-service] getRelatedProducts error:", error.message)
    return []
  }

  return (data as ProductRow[]).map(toProduct)
}
