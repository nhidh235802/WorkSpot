'use client'

import AuthGuard from '@/components/AuthGuard'

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['owner']}>
      <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
        {children}
      </div>
    </AuthGuard>
  )
}
