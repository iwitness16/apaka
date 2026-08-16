import { NextRequest, NextResponse } from "next/server"
import { verifyCredentials, setAdminSession } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}))

  if (!verifyCredentials(username ?? "", password ?? "")) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  await setAdminSession()
  return NextResponse.json({ success: true })
}
