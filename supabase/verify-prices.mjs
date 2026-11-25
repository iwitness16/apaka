import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sql = fs.readFileSync(path.join(__dirname, 'new-seed.sql'), 'utf8')

function classifyTitle(title) {
  const tl = title.toLowerCase()
  if (/\bring\b|band ring|wedding band|signet ring/.test(tl)) return 'ring'
  if (/earring|stud|dangle|drop earr|post earr|chandelier|ear wire|ear clip/.test(tl)) return 'earring'
  if (/necklace|pendant|choker|navajo pearl|chain necklace/.test(tl)) return 'necklace'
  if (/\bcuff\b|bracelet|bangle/.test(tl)) return 'cuff'
  return 'other'
}

const RANGES = {
  ring:     [95,   225],
  earring:  [45,   115],
  necklace: [175,  2500],
  cuff:     [199,  615],
  other:    [95,   350],
}

const parts = sql.split(/(?=\n\s*\(uuid_generate_v4\(\))/)
const violations = []
const summary = { ring:[], earring:[], necklace:[], cuff:[], other:[] }

for (const part of parts) {
  if (!part.includes('uuid_generate_v4')) continue

  // Extract title (4th quoted string)
  let pos = 0, count = 0, title = ''
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
    if (count === 4) title = part.substring(start + 1, end)
    pos = end + 1
  }

  const hm = part.match(/uuid_generate_v4\(\), '([^']+)'/)
  const handle = hm ? hm[1] : ''
  const type = classifyTitle(title || handle.replace(/-/g, ' '))
  const [mn, mx] = RANGES[type]

  const pm = part.match(/'(?:turquoise-jewelry|statement-pieces|accessories|bags|home|western-belts|footwear)',\s*\n?\s*([\d.]+)/)
  if (!pm) continue
  const price = parseFloat(pm[1])

  summary[type].push(price)

  if (price < mn || price > mx) {
    violations.push({ type, price, mn, mx, handle, title: title.substring(0, 60) })
  }
}

console.log('=== Price range summary ===')
Object.entries(summary).forEach(([t, prices]) => {
  if (!prices.length) return
  const mn = Math.min(...prices), mx = Math.max(...prices)
  const [rmin, rmax] = RANGES[t]
  const ok = violations.filter(v => v.type === t).length === 0 ? '✓' : '⚠'
  console.log(`  ${ok} ${t.padEnd(9)} ${String(prices.length).padStart(3)} products  actual $${mn}–$${mx}  (target $${rmin}–$${rmax})`)
})

console.log(`\nTotal violations: ${violations.length}`)
if (violations.length > 0) {
  violations.forEach(v =>
    console.log(`  [${v.type}] $${v.price} out of $${v.mn}-$${v.mx}  → ${v.title || v.handle.substring(0, 60)}`)
  )
}
