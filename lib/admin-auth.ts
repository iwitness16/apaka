import { cookies } from "next/headers"

const SESSION_COOKIE = "nma_admin_session"
const SESSION_VALUE  = process.env.ADMIN_SESSION_SECRET ?? "nma-admin-secret-key-2026"
const MAX_AGE        = 60 * 60 * 8 // 8 hours

/** Call from a Server Action / API route after verifying credentials */
export async function setAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  })
}

/** Call from a Server Action / API route to log out */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/** Use in Server Components / API routes to guard admin pages */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const val = cookieStore.get(SESSION_COOKIE)?.value
  return val === SESSION_VALUE
}

/** Verify username + password against env vars */
export function verifyCredentials(username: string, password: string): boolean {
  return (
    username === (process.env.ADMIN_USERNAME ?? "adminuser") &&
    password === (process.env.ADMIN_PASSWORD ?? "Apaka123#")
  )
}
