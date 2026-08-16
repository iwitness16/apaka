import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  )
}

/** Browser / server-component client — uses the anon key with RLS */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Service-role client — bypasses RLS.
 * Use ONLY in server-side API routes (never import on the client).
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "Required for server-side operations that bypass RLS."
    )
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
