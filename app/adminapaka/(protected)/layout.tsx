import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ok = await isAdminAuthenticated()
  if (!ok) redirect("/adminapaka/login")

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* Main content — pushed right of sidebar on desktop */}
      <div className="lg:pl-64">
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
