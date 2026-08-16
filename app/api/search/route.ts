import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // ilike search across title + tags array cast to text
  // Returns up to 12 results ordered by relevance (title match first)
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, price, images, category")
    .eq("is_active", true)
    .or(`title.ilike.%${q}%,category.ilike.%${q}%`)
    .order("title", { ascending: true })
    .limit(12)

  if (error) {
    console.error("[search] Supabase error:", error.message)
    return NextResponse.json({ results: [] })
  }

  // Boost: put exact-title-start matches first
  const lower = q.toLowerCase()
  const sorted = [...(data ?? [])].sort((a, b) => {
    const aStarts = a.title.toLowerCase().startsWith(lower) ? 0 : 1
    const bStarts = b.title.toLowerCase().startsWith(lower) ? 0 : 1
    return aStarts - bStarts
  })

  return NextResponse.json({ results: sorted })
}
