'use client'

import AuthGuard from '@/components/AuthGuard'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={false} forbiddenRoles={['admin', 'owner']}>
      {children}
    </AuthGuard>
  )
}
