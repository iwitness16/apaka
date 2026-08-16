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
    <div className="flex min-h-screen bg-[#0f0a06]">
      <AdminSidebar />
      {/* Content area — offset by sidebar width on large screens */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
