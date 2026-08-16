import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin — Native Made Accessories",
  robots: { index: false, follow: false },
}

// The actual auth guard lives in each non-login page.
// This layout simply provides the shared HTML wrapper
// so that the login page can render inside it without
// the sidebar (which is injected by the guarded layout below).
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
