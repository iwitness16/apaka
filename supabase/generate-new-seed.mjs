/**
 * generate-new-seed.mjs
 *
 * Reads all 3 Etsy CSV files from /public/ and generates new-seed.sql
 *
 * Usage (from project root):
 *   node supabase/generate-new-seed.mjs > supabase/new-seed.sql
 */

import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, "../public")

const CSV_FILES = [
  "etsy-com-2026-11-10-3_partial.csv",
  "etsy-com-2026-11-10-3_partial (1).csv",
  "etsy-com-2026-11-11_partial (1).csv",
]

// ── CSV parser (handles quoted fields with embedded newlines/commas) ───────────
function parseCSV(text) {
  const rows = []
  let headers = null
  let i = 0

  function parseField() {
    if (text[i] === '"') {
      i++ // skip opening quote
      let val = ""
      while (i < text.length) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') { val += '"'; i += 2 }
          else { i++; break }
        } else {
          val += text[i++]
        }
      }
      return val
    } else {
      let val = ""
      while (i < text.length && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
        val += text[i++]
      }
      return val
    }
  }

  function parseRow() {
    const fields = []
    while (i < text.length && text[i] !== "\n" && text[i] !== "\r") {
      fields.push(parseField())
      if (i < text.length && text[i] === ",") i++
    }
    // skip \r\n or \n
    if (i < text.length && text[i] === "\r") i++
    if (i < text.length && text[i] === "\n") i++
    return fields
  }

  // Header row
  const headerFields = parseRow()
  headers = headerFields.map(h => h.trim())

  while (i < text.length) {
    if (text[i] === "\r" || text[i] === "\n") { i++; continue }
    const fields = parseRow()
    if (fields.length < 2) continue
    const row = {}
    headers.forEach((h, idx) => { row[h] = (fields[idx] ?? "").trim() })
    rows.push(row)
  }

  return rows
}

// ── Category classifier ────────────────────────────────────────────────────────
function classifyCategory(title, description, features, searchUrl) {
  const t = (title + " " + description + " " + features).toLowerCase()
  const url = (searchUrl || "").toLowerCase()

  // Statement pieces first (large necklaces)
  if (t.includes("squash blossom") || t.includes("statement necklace") ||
      t.includes("lariat") || (t.includes("necklace") && t.includes("navajo pearl")))
    return "statement-pieces"

  // Turquoise jewelry subcategories
  if (t.includes("ring")) return "turquoise-jewelry"
  if (t.includes("earring") || t.includes("post earring") || t.includes("stud")) return "turquoise-jewelry"
  if (t.includes("necklace") || t.includes("pendant") || t.includes("choker")) return "turquoise-jewelry"
  if (t.includes("bracelet") || t.includes("cuff") || t.includes("bangle")) return "turquoise-jewelry"
  if (t.includes("brooch") || t.includes("pin")) return "accessories"

  // Craft supplies / beads / cabs
  if (t.includes("bead") || t.includes("cab") || t.includes("cabochon") ||
      t.includes("strand") || t.includes("supplies for making"))
    return "accessories"

  // Home / vintage decorative
  if (t.includes("jar") || t.includes("box") || t.includes("vanity") ||
      t.includes("dresser") || t.includes("vintage") && t.includes("decor"))
    return "home"

  // Western / belts
  if (t.includes("belt") || t.includes("buckle")) return "western-belts"
  if (t.includes("boot")) return "footwear"
  if (t.includes("bag") || t.includes("purse") || t.includes("tote")) return "bags"

  // Default
  if (url.includes("turquoise") || t.includes("turquoise")) return "turquoise-jewelry"
  if (url.includes("navajo")) return "turquoise-jewelry"

  return "accessories"
}

// ── Price extractor ────────────────────────────────────────────────────────────
function extractPrice(str) {
  if (!str) return null
  const m = str.replace(/,/g, "").match(/[\d]+(?:\.\d{1,2})?/)
  return m ? parseFloat(m[0]) : null
}

// ── Slug generator ────────────────────────────────────────────────────────────
function slugify(str, suffix = "") {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) + (suffix ? "-" + suffix : "")
}

// ── SQL escaper ────────────────────────────────────────────────────────────────
function esc(str) {
  return (str || "").replace(/'/g, "''")
}

function escArr(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]"
  return "ARRAY[" + arr.map(s => `'${esc(s)}'`).join(",") + "]"
}

// ── Load + parse all CSVs ─────────────────────────────────────────────────────
let allRows = []
for (const file of CSV_FILES) {
  const path = resolve(publicDir, file)
  if (!existsSync(path)) {
    process.stderr.write(`WARNING: CSV not found: ${path}\n`)
    continue
  }
  const text = readFileSync(path, "utf8")
  const rows = parseCSV(text)
  process.stderr.write(`  Loaded ${rows.length} rows from ${file}\n`)
  allRows = allRows.concat(rows)
}

// ── Deduplicate by etsy_id ────────────────────────────────────────────────────
const seen = new Set()
const dedupedRows = []
for (const row of allRows) {
  const id = (row.sku || row.item_page_link || "").trim()
  if (!id || seen.has(id)) continue
  seen.add(id)
  dedupedRows.push(row)
}
process.stderr.write(`  Total unique rows: ${dedupedRows.length}\n`)

// ── Build product records ─────────────────────────────────────────────────────
const slugCount = {}
const products = []

for (const row of dedupedRows) {
  const rawTitle = (row.product_name || row.title || "").replace(/\s+/g, " ").trim()
  if (!rawTitle || rawTitle.length < 3) continue

  // Price
  const price = extractPrice(row.price1)
  if (!price || price <= 0) continue

  const origPrice = extractPrice(row.original_price)

  // Images
  const mainImage = (row.main_image || "").trim()
  const imagesRaw = (row.images || mainImage)
    .split(/\n/)
    .map(s => s.trim())
    .filter(s => s.startsWith("http"))
  const images = [...new Set(imagesRaw)].slice(0, 10)
  if (!mainImage && images.length === 0) continue

  // Handle / slug
  let baseSlug = slugify(rawTitle)
  if (!baseSlug) baseSlug = "product"
  slugCount[baseSlug] = (slugCount[baseSlug] || 0) + 1
  const handle = slugCount[baseSlug] > 1 ? `${baseSlug}-${slugCount[baseSlug]}` : baseSlug

  // Description — clean up HTML/whitespace
  const desc = (row.description || "")
    .replace(/\s+/g, " ")
    .replace(/Learn more about this item/gi, "")
    .trim()
    .slice(0, 2000)

  // Category
  const category = classifyCategory(rawTitle, desc, row.features || "", row.web_scraper_start_url || "")

  // Attributes
  const features = row.features || ""
  const materials = (row.material || extractAttr(features, "Materials") || "").slice(0, 300)
  const gemstone  = (extractAttr(features, "Gemstone") || "").slice(0, 100)
  const gemColor  = (row.color || extractAttr(features, "Gem color") || "").slice(0, 100)
  const sizeInfo  = (row.size  || extractAttr(features, "Size") || "").slice(0, 200)
  const styleInfo = (extractAttr(features, "Style") || row.style || "").slice(0, 200)
  const freeShip  = (row.price || row.title2 || "").toLowerCase().includes("free shipping")

  products.push({
    handle,
    etsy_id:        (row.sku || "").trim(),
    etsy_url:       (row.item_page_link || "").trim().slice(0, 500),
    title:          rawTitle.slice(0, 500),
    description:    desc,
    category,
    price,
    original_price: origPrice && origPrice > price ? origPrice : null,
    main_image:     mainImage.slice(0, 500),
    images,
    materials,
    gemstone,
    gem_color:      gemColor,
    size_info:      sizeInfo,
    style_info:     styleInfo,
    seller_name:    (row.seller_name || "").trim().slice(0, 200),
    seller_url:     (row.seller_url  || "").trim().slice(0, 500),
    rating:         parseFloat(row.rating) || null,
    review_count:   parseInt(row.review_count) || 0,
    free_shipping:  freeShip,
  })
}

function extractAttr(features, key) {
  const m = features.match(new RegExp(key + "[:\\s]+([^\\n]+)", "i"))
  return m ? m[1].trim() : ""
}

process.stderr.write(`  Products to insert: ${products.length}\n`)

// ── Emit SQL ──────────────────────────────────────────────────────────────────
const BATCH = 50

process.stdout.write(`-- ============================================================
-- Native Made Accessories — New Product Seed (Etsy data)
-- ${products.length} products from ${dedupedRows.length} unique Etsy listings
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- Clear existing products first
TRUNCATE products RESTART IDENTITY CASCADE;

`)

for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH)
  process.stdout.write(`INSERT INTO products (\n  id, handle, etsy_id, etsy_url, title, description, category,\n  price, original_price, main_image, images,\n  materials, gemstone, gem_color, size_info, style_info,\n  seller_name, seller_url, rating, review_count, free_shipping, is_active,\n  created_at, updated_at\n) VALUES\n`)

  batch.forEach((p, idx) => {
    const comma = idx < batch.length - 1 ? "," : ""
    process.stdout.write(
      `  (uuid_generate_v4(), '${esc(p.handle)}', '${esc(p.etsy_id)}', '${esc(p.etsy_url)}',\n` +
      `   '${esc(p.title)}', '${esc(p.description)}', '${esc(p.category)}',\n` +
      `   ${p.price}, ${p.original_price ?? "NULL"}, '${esc(p.main_image)}',\n` +
      `   ${escArr(p.images)},\n` +
      `   '${esc(p.materials)}', '${esc(p.gemstone)}', '${esc(p.gem_color)}',\n` +
      `   '${esc(p.size_info)}', '${esc(p.style_info)}',\n` +
      `   '${esc(p.seller_name)}', '${esc(p.seller_url)}',\n` +
      `   ${p.rating ?? "NULL"}, ${p.review_count}, ${p.free_shipping}, true,\n` +
      `   NOW(), NOW())${comma}\n`
    )
  })

  process.stdout.write(`ON CONFLICT (handle) DO UPDATE SET\n  title=EXCLUDED.title, description=EXCLUDED.description,\n  price=EXCLUDED.price, original_price=EXCLUDED.original_price,\n  main_image=EXCLUDED.main_image, images=EXCLUDED.images,\n  materials=EXCLUDED.materials, gemstone=EXCLUDED.gemstone,\n  gem_color=EXCLUDED.gem_color, size_info=EXCLUDED.size_info,\n  seller_name=EXCLUDED.seller_name, updated_at=NOW();\n\n`)
}

process.stdout.write(`-- Done. ${products.length} products seeded.\n`)
