/**
 * Splits supabase/seed.sql into two halves for the Supabase SQL Editor.
 *
 * Usage (run once from project root):
 *   node supabase/split-seed.mjs
 *
 * Output:
 *   supabase/seed-part1.sql  — first half of product INSERT batches
 *   supabase/seed-part2.sql  — second half of product INSERT batches
 *
 * Run part1 in the SQL Editor first, then part2.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = resolve(__dirname, "seed.sql");

const text = readFileSync(seedPath, "utf8");

// Split on every INSERT INTO products statement boundary
// Each batch starts with "INSERT INTO products ("
const batches = text.split(/(?=^INSERT INTO products \()/m);

// First element is the header (TRUNCATE + comments), rest are INSERT batches
const header = batches[0];
const insertBatches = batches.slice(1);

const half = Math.ceil(insertBatches.length / 2);

const part1Batches = insertBatches.slice(0, half);
const part2Batches = insertBatches.slice(half);

const header1 = `-- ============================================================
-- Native Made Accessories — Product Seed Data — PART 1 of 2
-- Run schema.sql first, then this file, then seed-part2.sql
-- ============================================================

-- Clear existing products (only need this once — comment out before running part2)
TRUNCATE products RESTART IDENTITY CASCADE;

`;

const header2 = `-- ============================================================
-- Native Made Accessories — Product Seed Data — PART 2 of 2
-- Run seed-part1.sql first, then this file.
-- DO NOT truncate again before running part 2.
-- ============================================================

`;

const part1 = header1 + part1Batches.join("");
const part2 = header2 + part2Batches.join("");

const part1Path = resolve(__dirname, "seed-part1.sql");
const part2Path = resolve(__dirname, "seed-part2.sql");

writeFileSync(part1Path, part1, "utf8");
writeFileSync(part2Path, part2, "utf8");

const totalKb = (text.length / 1024).toFixed(0);
const p1Kb = (part1.length / 1024).toFixed(0);
const p2Kb = (part2.length / 1024).toFixed(0);

console.log(`Split complete.`);
console.log(`  Original seed.sql: ${totalKb} KB, ${insertBatches.length} INSERT batches`);
console.log(`  seed-part1.sql:    ${p1Kb} KB, ${part1Batches.length} batches`);
console.log(`  seed-part2.sql:    ${p2Kb} KB, ${part2Batches.length} batches`);
console.log(``);
console.log(`Steps:`);
console.log(`  1. Run schema.sql in Supabase SQL Editor`);
console.log(`  2. Run seed-part1.sql`);
console.log(`  3. Run seed-part2.sql  (no TRUNCATE this time)`);
