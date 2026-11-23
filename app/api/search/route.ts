import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) return NextResponse.json({ results: [] })

  // Search title, description and materials across new Etsy-sourced schema
  const { data, error } = await supabase
    .from("products")
    .select("handle, title, price, main_image, category, seller_name, is_sale, free_shipping")
    .eq("is_active", true)
    .or(`title.ilike.%${q}%,category.ilike.%${q}%,materials.ilike.%${q}%,gemstone.ilike.%${q}%`)
    .order("review_count", { ascending: false })
    .limit(12)

  if (error) {
    console.error("[search] error:", error.message)
    return NextResponse.json({ results: [] })
  }

  // Boost exact title-start matches
  const lower = q.toLowerCase()
  const sorted = [...(data ?? [])].sort((a, b) => {
    const aS = a.title.toLowerCase().startsWith(lower) ? 0 : 1
    const bS = b.title.toLowerCase().startsWith(lower) ? 0 : 1
    return aS - bS
  })

  return NextResponse.json({ results: sorted })
}
