/**
 * products-service.ts
 *
 * All async data-fetching functions that hit Supabase.
 * Column names match the new Etsy-sourced schema (new-schema.sql).
 */

import { supabase } from "./supabase"
import type { CategorySlug, Product } from "./types"

// ── Fields to SELECT ──────────────────────────────────────────────────────────
const PRODUCT_FIELDS = `
  handle, etsy_id, etsy_url,
  title, description, category,
  price, original_price,
  main_image, images,
  materials, gemstone, gem_color, size_info, style_info,
  seller_name, seller_url,
  rating, review_count,
  is_active, is_sale, free_shipping
`.trim()

// ── Row → Product ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(row: any): Product {
  return {
    handle:         row.handle         ?? "",
    etsy_id:        row.etsy_id        ?? "",
    etsy_url:       row.etsy_url       ?? "",
    title:          row.title          ?? "",
    description:    row.description    ?? "",
    category:       (row.category as CategorySlug) ?? "turquoise-jewelry",
    price:          Number(row.price)  ?? 0,
    original_price: row.original_price ? Number(row.original_price) : null,
    main_image:     row.main_image     ?? "",
    images:         Array.isArray(row.images) ? row.images : [],
    materials:      row.materials      ?? "",
    gemstone:       row.gemstone       ?? "",
    gem_color:      row.gem_color      ?? "",
    size_info:      row.size_info      ?? "",
    style_info:     row.style_info     ?? "",
    seller_name:    row.seller_name    ?? "",
    seller_url:     row.seller_url     ?? "",
    rating:         row.rating         ?? null,
    review_count:   row.review_count   ?? 0,
    is_active:      row.is_active      ?? true,
    is_sale:        row.is_sale        ?? false,
    free_shipping:  row.free_shipping  ?? false,
  }
}

// ── Products by category ──────────────────────────────────────────────────────
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("category", slug)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(300)

  if (error) {
    console.error("[products-service] getProductsByCategory:", error.message)
    return []
  }
  return (data ?? []).map(toProduct)
}

// ── Single product by handle ──────────────────────────────────────────────────
export async function getProduct(handle: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("handle", handle)
    .eq("is_active", true)
    .single()

  if (error) {
    if (error.code !== "PGRST116")
      console.error("[products-service] getProduct:", error.message)
    return null
  }
  return toProduct(data)
}

// ── All active products (new arrivals / search) ───────────────────────────────
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) {
    console.error("[products-service] getAllProducts:", error.message)
    return []
  }
  return (data ?? []).map(toProduct)
}

// ── Related products (same category, excluding current) ───────────────────────
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("handle", product.handle)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[products-service] getRelatedProducts:", error.message)
    return []
  }
  return (data ?? []).map(toProduct)
}

// ── Featured products (mix of categories for home page) ───────────────────────
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_active", true)
    .order("review_count", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[products-service] getFeaturedProducts:", error.message)
    return []
  }
  return (data ?? []).map(toProduct)
}
