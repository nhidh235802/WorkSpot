'use client'

import AuthGuard from '@/components/AuthGuard'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#F5F3EE]">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 min-h-screen overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
