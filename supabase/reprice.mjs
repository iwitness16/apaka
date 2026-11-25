import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const base = __dirname

// ── Price ranges per jewelry type ─────────────────────────────────────────────
const RANGES = {
  ring:     { min: 95,   max: 225  },
  earring:  { min: 45,   max: 115  },
  necklace: { min: 175,  max: 2500 },
  cuff:     { min: 199,  max: 615  },
  other:    { min: 95,   max: 350  },
}

// Deterministic hash so the same handle always gets the same price
function hashSeed(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function newPrice(handle, type) {
  const { min, max } = RANGES[type]
  const t = hashSeed(handle)
  const raw = min + (t % 100000) / 100000 * (max - min)
  // Round to nearest $5 for clean display
  return Math.max(min, Math.min(max, Math.round(raw / 5) * 5))
}

function classifyTitle(title) {
  const tl = title.toLowerCase()
  if (/\bring\b|band ring|wedding band|signet ring/.test(tl)) return 'ring'
  if (/earring|stud|dangle|drop earr|post earr|chandelier|ear wire|ear clip/.test(tl)) return 'earring'
  if (/necklace|pendant|choker|navajo pearl|chain necklace/.test(tl)) return 'necklace'
  if (/\bcuff\b|bracelet|bangle/.test(tl)) return 'cuff'
  return 'other'
}

// ── Parse row blocks from SQL ─────────────────────────────────────────────────
function parseRows(sql) {
  const rows = []
  const parts = sql.split(/(?=\n\s*\(uuid_generate_v4\(\))/)
  for (const part of parts) {
    if (!part.includes('uuid_generate_v4')) continue

    // Extract quoted strings 1-4: handle, etsy_id, etsy_url, title
    let pos = 0, count = 0, handle = '', title = ''
    while (pos < part.length && count < 4) {
      const start = part.indexOf("'", pos)
      if (start === -1) break
      let end = start + 1
      while (end < part.length) {
        if (part[end] === "'" && part[end + 1] === "'") { end += 2; continue }
        if (part[end] === "'") break
        end++
      }
      count++
      if (count === 1) handle = part.substring(start + 1, end)
      if (count === 4) title   = part.substring(start + 1, end)
      pos = end + 1
    }

    rows.push({ handle, title, part })
  }
  return rows
}

// ── Reprice one row block ─────────────────────────────────────────────────────
// Row price pattern in seed:
//   'category',\n   <price>, <original_price|NULL>, 'https://...main_image'
function repriceBlock(block, handle, title) {
  const type   = classifyTitle(title || handle.replace(/-/g, ' '))
  const price  = newPrice(handle, type)

  // Regex: find price + original_price right after the category value
  // Category is always a quoted string; price follows after a comma
  //   'turquoise-jewelry',\n   639, NULL,
  //   'statement-pieces',\n   99.99, 149.00,
  const repriced = block.replace(
    /('(?:turquoise-jewelry|statement-pieces|accessories|bags|home|western-belts|footwear)',\s*\n?\s*)([\d.]+),\s*([\d.]+|NULL)/,
    (m, categoryPart, oldPrice, oldOriginal) => {
      let newOriginal = 'NULL'
      if (oldOriginal !== 'NULL') {
        const orig = parseFloat(oldOriginal)
        const curr = parseFloat(oldPrice)
        if (orig > curr && curr > 0) {
          // Keep the same sale discount ratio, scaled to new price
          const ratio = orig / curr
          const scaledOrig = Math.round(price * ratio / 5) * 5
          newOriginal = scaledOrig.toFixed(2)
        }
      }
      return `${categoryPart}${price.toFixed(2)}, ${newOriginal}`
    }
  )
  return repriced
}

// ── Main ─────────────────────────────────────────────────────────────────────
const seedPath = path.join(base, 'new-seed.sql')
const raw = fs.readFileSync(seedPath, 'utf8')

const rows = parseRows(raw)
console.log(`Parsed ${rows.length} rows`)

// Split SQL into: header + row blocks
// header = everything before first (uuid_generate_v4()
const firstRowIdx = raw.indexOf('\n  (uuid_generate_v4()')
const header = raw.substring(0, firstRowIdx)
const bodyRaw = raw.substring(firstRowIdx)

// Split body on row boundaries while preserving the delimiters
const rowBlocks = bodyRaw.split(/(?=\n\s*\(uuid_generate_v4\(\))/)

// Build a lookup: handle → { title, type }
const lookup = {}
rows.forEach(r => { lookup[r.handle] = r })

let changed = 0
const dist = { ring: 0, earring: 0, necklace: 0, cuff: 0, other: 0 }
const samples = []

const newBlocks = rowBlocks.map(block => {
  const handleM = block.match(/uuid_generate_v4\(\), '([^']+)'/)
  if (!handleM) return block
  const handle = handleM[1]
  const row = lookup[handle]
  if (!row) return block

  const title = row.title || handle.replace(/-/g, ' ')
  const type  = classifyTitle(title)
  dist[type]++

  const repriced = repriceBlock(block, handle, title)
  if (repriced !== block) {
    changed++
    if (samples.length < 5) {
      const priceLine = block.match(/,\s*\n?\s*([\d.]+),\s*([\d.]+|NULL)/)
      const newPriceLine = repriced.match(/,\s*\n?\s*([\d.]+),\s*([\d.]+|NULL)/)
      if (priceLine && newPriceLine) {
        samples.push({ type, title: title.substring(0,55), old: priceLine[1], new: newPriceLine[1] })
      }
    }
  }
  return repriced
})

const newSql = header + newBlocks.join('')
fs.writeFileSync(seedPath, newSql, 'utf8')

// Also regenerate all 16 part files
const allLines = newSql.split('\n')
const total = allLines.length

function writePart(partNum, startLine, endLine) {
  const chunk = allLines.slice(startLine, endLine + 1).join('\n')
  const prefix = partNum === 1 ? '' : `-- new-seed-part${partNum}.sql  (run after part${partNum-1})\n`
  const content = prefix + chunk
  const outPath = path.join(base, `new-seed-part${partNum}.sql`)
  fs.writeFileSync(outPath, content, 'utf8')
}

const starts = [9,474,939,1404,1869,2334,2799,3264,3729,4194,4659,5124,5589,6059,6529,6994]
const ends   = starts.slice(1).map(s => s - 1).concat([total - 1])
starts.forEach((s, idx) => writePart(idx + 1, s, ends[idx]))

// ── Report ────────────────────────────────────────────────────────────────────
console.log(`\nRepriced ${changed}/${rows.length} rows`)
console.log('\nType distribution:')
Object.entries(dist).forEach(([k, v]) => {
  const r = RANGES[k]
  console.log(`  ${k.padEnd(9)} ${String(v).padStart(3)} products  → $${r.min}–$${r.max}`)
})

console.log('\nSample price changes:')
samples.forEach(s => console.log(`  [${s.type.padEnd(8)}] $${s.old.padStart(7)} → $${s.new.padStart(7)}  ${s.title}`))

console.log('\nAll 16 part files regenerated.')
