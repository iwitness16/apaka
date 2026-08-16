/**
 * Native Made Accessories — CSV → SQL seed generator
 *
 * Usage (run once from project root):
 *   node supabase/generate-seed.mjs > supabase/seed.sql
 *
 * Then paste seed.sql into Supabase SQL Editor and run it AFTER schema.sql.
 *
 * The script reads the raw CSV text embedded below (the all-products CSV)
 * and outputs properly escaped INSERT statements.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Category mapping logic ────────────────────────────────────────────────
function classifyProduct(handle, title, type, tags) {
  const h = handle.toLowerCase();
  const ti = title.toLowerCase();
  const ty = (type || "").toLowerCase();
  const tg = (tags || "").toLowerCase();

  // FOOTWEAR
  if (
    ty === "boots" ||
    h.includes("boot") ||
    h.includes("sandal") ||
    h.includes("mule") ||
    h.includes("slipper") ||
    h.includes("shoe") ||
    h.includes("sneaker") ||
    h.includes("mocassin") ||
    ti.includes("boot") ||
    ti.includes("sandal") ||
    ti.includes("mule") ||
    ti.includes("slipper") ||
    ti.includes("shoe")
  ) return "footwear";

  // GRAPHIC TEES
  if (
    h.includes("-tee") ||
    h.includes("-shirt") ||
    (h.includes("tee") && !h.includes("coffee")) ||
    ti.includes(" tee") ||
    tg.includes("tee") ||
    h.includes("merch-tee") ||
    h.includes("graphic-tee") ||
    h.includes("howdy") && h.includes("tee") ||
    h.includes("poncho-tee") ||
    h.includes("glitter-tee")
  ) return "graphic-tees";

  // TOPS — mesh, blouse, bodysuit, sweater, tank, crop, button-up, vest, cardigan, shrug, hoodie
  if (
    h.includes("mesh-top") ||
    h.includes("blouse") ||
    h.includes("bodysuit") ||
    h.includes("sweater") ||
    h.includes("-tank") ||
    h.includes("crop-set") ||
    h.includes("crop-top") ||
    h.includes("button-up") ||
    h.includes("ruffle") ||
    h.includes("hoodie") ||
    h.includes("shrug") ||
    h.includes("poncho") && !h.includes("poncho-tee") ||
    h.includes("blazer") ||
    h.includes("vest") ||
    h.includes("top") && !h.includes("laptop") ||
    ti.includes("mesh top") ||
    ti.includes("bodysuit") ||
    ti.includes("blouse") ||
    ti.includes("sweater") ||
    ti.includes("hoodie") ||
    ti.includes("cardigan") ||
    ti.includes("tank") ||
    ti.includes("shrug") ||
    ti.includes("blazer") ||
    ti.includes("button up") ||
    ti.includes("crop")
  ) return "tops";

  // BOTTOMS — pants, jeans, skirt, shorts
  if (
    h.includes("-pants") ||
    h.includes("-jeans") ||
    h.includes("-shorts") ||
    h.includes("-skirt") ||
    ti.includes(" pants") ||
    ti.includes(" jeans") ||
    ti.includes(" shorts") ||
    ti.includes(" skirt") ||
    ti.includes("bloomers")
  ) return "bottoms";

  // DRESSES & ROMPERS
  if (
    h.includes("-dress") ||
    h.includes("-romper") ||
    h.includes("lace-dress") ||
    ti.includes(" dress") ||
    ti.includes(" romper") ||
    ty === "romper"
  ) return "dresses-rompers";

  // OUTERWEAR — coats, jackets, dusters, ponchos (non-tee)
  if (
    h.includes("-jacket") ||
    h.includes("-duster") ||
    h.includes("-coat") ||
    h.includes("cape") ||
    ti.includes("jacket") ||
    ti.includes("duster") ||
    ti.includes("coat")
  ) return "outerwear";

  // WESTERN BELTS & BUCKLES
  if (
    h.includes("-belt") ||
    h.includes("-buckle") ||
    ti.includes(" belt") ||
    (ti.includes("buckle") && !ti.includes("bag") && !ti.includes("sling") && !ti.includes("wallet") && !ti.includes("cuff")) ||
    ty === "belts"
  ) return "western-belts";

  // BAGS — all bag/purse/crossbody/wallet/tote/sling/speedy/clutch/wrislet/satchel/bucket
  if (
    ty === "hand bag" ||
    h.includes("crossbody") ||
    h.includes("-bag") ||
    h.includes("-tote") ||
    h.includes("-wallet") ||
    h.includes("-purse") ||
    h.includes("-sling") ||
    h.includes("-clutch") ||
    h.includes("-speedy") ||
    h.includes("-wrislet") ||
    h.includes("-wristlet") ||
    h.includes("-bucket") ||
    h.includes("-duffle") ||
    h.includes("-satchel") ||
    h.includes("-weekender") ||
    h.includes("-pouch") ||
    h.includes("-canteen") ||
    h.includes("-fob") ||
    h.includes("handbag") ||
    h.includes("gun-case") ||
    h.includes("pistol-case") ||
    h.includes("riffle-case") ||
    h.includes("boot-bag") ||
    ti.includes("crossbody") ||
    ti.includes(" bag") ||
    ti.includes(" tote") ||
    ti.includes(" wallet") ||
    ti.includes(" purse") ||
    ti.includes(" sling") ||
    ti.includes(" clutch") ||
    ti.includes("speedy") ||
    ti.includes("weekender") ||
    ti.includes("wrislet") ||
    ti.includes("wristlet") ||
    ti.includes("bucket bag") ||
    ti.includes("duffle") ||
    ti.includes("canteen bag")
  ) return "bags";

  // HOME
  if (
    h.includes("rug") ||
    h.includes("-mug") ||
    h.includes("tumbler") ||
    h.includes("blanket") ||
    h.includes("home-decor") ||
    h.includes("journal") ||
    h.includes("notebook") ||
    h.includes("koozie") ||
    h.includes("coffee-sleeve") ||
    h.includes("air-freshener") ||
    h.includes("sticker") ||
    h.includes("snack-tray") ||
    h.includes("airpod") ||
    h.includes("pouch") && !h.includes("passport") ||
    h.includes("neck-stand") ||
    h.includes("picture-frame") ||
    ti.includes("rug") ||
    ti.includes("tumbler") ||
    ti.includes("mug") ||
    ti.includes("blanket") ||
    ti.includes("koozie") ||
    ti.includes("journal") ||
    ti.includes("notebook")
  ) return "home";

  // STATEMENT PIECES — squash blossom, cluster statement, high-value collector sets
  if (
    h.includes("squash-blossom") ||
    h.includes("statement-set") ||
    h.includes("statement-necklace") ||
    h.includes("lariat-statement") ||
    h.includes("statement-lariat") ||
    h.includes("heirloom") ||
    tg.includes("squash") ||
    tg.includes("statement") ||
    ti.includes("squash blossom") ||
    (ti.includes("statement") && (ti.includes("necklace") || ti.includes("set"))) ||
    ti.includes("heirloom")
  ) return "statement-pieces";

  // TURQUOISE JEWELRY — everything else jewelry-related
  if (
    ty === "ring" ||
    ty === "earrings" ||
    ty === "bracelet" ||
    ty === "necklace" ||
    ty === "pendant" ||
    ty === "cuff" ||
    ty === "hat clip" ||
    ty === "Leander Tahe" ||
    ty === "hat" ||
    ty === "rings" ||
    h.includes("-ring") ||
    h.includes("-earrings") ||
    h.includes("-necklace") ||
    h.includes("-pendant") ||
    h.includes("-cuff") ||
    h.includes("-bracelet") ||
    h.includes("-bangle") ||
    h.includes("-bolo") ||
    h.includes("-choker") ||
    h.includes("-studs") ||
    h.includes("-hoops") ||
    h.includes("-hoop") ||
    h.includes("-dangles") ||
    h.includes("-stacker") ||
    h.includes("-lariat") && !h.includes("belt") ||
    h.includes("hat-band") ||
    h.includes("hair-tie") ||
    h.includes("hair-clip") ||
    h.includes("barrette") ||
    h.includes("barrett") ||
    h.includes("hair-pin") ||
    h.includes("turquoise") && !h.includes("boot") && !h.includes("clutch") ||
    ti.includes("ring") ||
    ti.includes("earring") ||
    ti.includes("necklace") ||
    ti.includes("pendant") ||
    ti.includes("cuff") ||
    ti.includes("bracelet") ||
    ti.includes("bangle") ||
    ti.includes("bolo") ||
    ti.includes("choker") ||
    ti.includes("stud") ||
    ti.includes("hoops") ||
    ti.includes("dangle") ||
    ti.includes("lariat") ||
    ti.includes("hair tie") ||
    ti.includes("hair clip") ||
    ti.includes("barrette") ||
    ti.includes("sterling") ||
    ti.includes("turquoise") ||
    ti.includes("coral") ||
    ti.includes("pearl") ||
    ti.includes("navajo") ||
    ti.includes("native") ||
    ti.includes("kingman") ||
    ti.includes("sonoran") ||
    ti.includes("royston") ||
    ti.includes("concho")
  ) return "turquoise-jewelry";

  // ACCESSORIES — hats, caps, sunglasses, scarves, keychains, pins, patches, charms, twillies, hair items
  if (
    ty === "hat" ||
    h.includes("-cap") ||
    h.includes("-hat") ||
    h.includes("twilly") ||
    h.includes("sunnie") ||
    h.includes("sunnies") ||
    h.includes("keychain") ||
    h.includes("keyring") ||
    h.includes("pin") && !h.includes("hair-pin") ||
    h.includes("-charm") ||
    h.includes("scarf") ||
    h.includes("wild-rag") ||
    h.includes("bandana") ||
    h.includes("hat-feather") ||
    h.includes("hat-chain") ||
    h.includes("bag-charm") ||
    h.includes("-strap") ||
    h.includes("hat-pin") ||
    h.includes("watch-band") ||
    h.includes("glasses") ||
    ti.includes(" hat") ||
    ti.includes(" cap") ||
    ti.includes("twilly") ||
    ti.includes("sunnies") ||
    ti.includes("sunglasses") ||
    ti.includes("keychain") ||
    ti.includes("wild rag") ||
    ti.includes("bandana") ||
    ti.includes("scarf") ||
    ti.includes("hat pin") ||
    ti.includes("hat chain") ||
    ti.includes("bag charm") ||
    ti.includes("watch band") ||
    ti.includes("shoulder strap") ||
    ti.includes("bag strap")
  ) return "accessories";

  // Default fallback
  return "accessories";
}

// ─── SQL escape helper ────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return "NULL";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escArr(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::TEXT[]";
  const items = arr.map((s) => "'" + String(s).replace(/'/g, "''") + "'");
  return "ARRAY[" + items.join(",") + "]";
}

// ─── CSV parsing (minimal, handles quoted fields with commas/newlines) ─────
function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCSV(text) {
  // Split on actual newlines, respecting quoted fields
  const lines = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
      cur += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQ) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      if (cur.trim()) lines.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) lines.push(cur);
  return lines;
}

// ─── Read CSV ─────────────────────────────────────────────────────────────
const csvPath = resolve(__dirname, "../all-products-shopthepinkcattle-com.csv");
let csvText;
try {
  csvText = readFileSync(csvPath, "utf8");
} catch (e) {
  console.error("ERROR: CSV file not found at", csvPath);
  console.error("Place the CSV file at the project root as: all-products-shopthepinkcattle-com.csv");
  process.exit(1);
}

const lines = parseCSV(csvText);
const header = parseCSVLine(lines[0]);

// Map header names to indices
const col = {};
header.forEach((h, i) => { col[h.trim()] = i; });

// Key indices
const I = {
  handle:       col["Handle"],
  title:        col["Title"],
  body:         col["Body (HTML)"],
  vendor:       col["Vendor"],
  type:         col["Type"],
  tags:         col["Tags"],
  published:    col["Published"],
  opt1Name:     col["Option1 Name"],
  opt1Val:      col["Option1 Value"],
  price:        col["Variant Price"],
  imgSrc:       col["Image Src"],
  imgPos:       col["Image Position"],
  status:       col["Status"],
};

// ─── Build product map ────────────────────────────────────────────────────
const productMap = new Map(); // handle → product object

for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const handle = (row[I.handle] || "").trim();
  if (!handle) continue;

  const status = (row[I.status] || "").trim().toLowerCase();
  // Skip archived/draft products
  if (status && status !== "active") continue;

  const imgSrc = (row[I.imgSrc] || "").trim();
  const imgPos = parseInt(row[I.imgPos] || "0", 10) || 0;
  const opt1Val = (row[I.opt1Val] || "").trim();
  const price = parseFloat(row[I.price] || "0") || 0;

  if (!productMap.has(handle)) {
    const title = (row[I.title] || "").trim();
    const body  = (row[I.body]  || "").trim();
    const vendor = (row[col["Vendor"]] || "").trim();
    const type  = (row[I.type]  || "").trim();
    const tags  = (row[I.tags]  || "").trim();
    const opt1Name = (row[I.opt1Name] || "").trim();

    // Strip HTML tags from description
    const desc = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    const category = classifyProduct(handle, title, type, tags);
    const tagArr = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

    productMap.set(handle, {
      handle,
      title,
      description: desc,
      price,
      category,
      images: [],
      sizes: [],
      optionName: opt1Name,
      vendor,
      tags: tagArr,
    });
  }

  const product = productMap.get(handle);

  // Collect images (by position to keep order)
  if (imgSrc && imgSrc.startsWith("http")) {
    // Only add unique images
    if (!product.images.includes(imgSrc)) {
      product.images.push(imgSrc);
    }
  }

  // Collect sizes/option values
  if (opt1Val && opt1Val !== "Default Title") {
    if (!product.sizes.includes(opt1Val)) {
      product.sizes.push(opt1Val);
    }
  }

  // Use highest price variant (or first non-zero)
  if (price > product.price) {
    product.price = price;
  }
}

// ─── Generate SQL ─────────────────────────────────────────────────────────
const products = [...productMap.values()];

console.log("-- ============================================================");
console.log("-- Native Made Accessories — Product Seed Data");
console.log(`-- ${products.length} products`);
console.log("-- Generated: " + new Date().toISOString());
console.log("-- ============================================================");
console.log("");
console.log("-- Clear existing products first (optional — comment out if you want to keep)");
console.log("TRUNCATE products RESTART IDENTITY CASCADE;");
console.log("");

const BATCH = 50;
for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH);
  const rows = batch.map((p) => {
    const title = esc(p.title);
    const handle = esc(p.handle);
    const desc = esc(p.description.substring(0, 2000));
    const price = p.price.toFixed(2);
    const category = esc(p.category);
    const images = escArr(p.images.slice(0, 8)); // cap at 8 images
    const sizes = escArr(p.sizes.slice(0, 20));  // cap at 20 variants
    const optName = esc(p.optionName);
    const vendor = esc(p.vendor);
    const tags = escArr(p.tags.slice(0, 10));

    return `  (uuid_generate_v4(), ${handle}, ${title}, ${desc}, ${price}, ${category}, ${images}, ${sizes}, ${optName}, ${vendor}, ${tags}, TRUE, NOW(), NOW())`;
  });

  console.log(
    `INSERT INTO products (id, handle, title, description, price, category, images, sizes, option_name, vendor, tags, is_active, created_at, updated_at) VALUES`
  );
  console.log(rows.join(",\n"));
  console.log("ON CONFLICT (handle) DO UPDATE SET");
  console.log("  title       = EXCLUDED.title,");
  console.log("  description = EXCLUDED.description,");
  console.log("  price       = EXCLUDED.price,");
  console.log("  category    = EXCLUDED.category,");
  console.log("  images      = EXCLUDED.images,");
  console.log("  sizes       = EXCLUDED.sizes,");
  console.log("  option_name = EXCLUDED.option_name,");
  console.log("  vendor      = EXCLUDED.vendor,");
  console.log("  tags        = EXCLUDED.tags,");
  console.log("  updated_at  = NOW();");
  console.log("");
}

console.log(`-- Done. ${products.length} products inserted/updated.`);
console.log("-- Category distribution:");
const catCount = {};
products.forEach((p) => { catCount[p.category] = (catCount[p.category] || 0) + 1; });
Object.entries(catCount).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => {
  console.log(`--   ${c}: ${n}`);
});
