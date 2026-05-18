'use client'

import AuthGuard from '@/components/AuthGuard'
import OwnerSidebar from '@/components/OwnerSidebar'

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['owner']}>
      <div style={{ display: 'flex', height: '100vh', background: '#FAFAF5', overflow: 'hidden', position: 'relative' }}>
        <OwnerSidebar />
        <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
