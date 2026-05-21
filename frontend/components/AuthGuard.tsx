'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  forbiddenRoles?: string[]
  requireAuth?: boolean
}

function syncCheck(
  pathname: string,
  allowedRoles?: string[],
  forbiddenRoles?: string[],
  requireAuth = true,
): boolean {
  if (typeof window === 'undefined') return false
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })()

  if (!user) return !requireAuth

  const role: string = user.role

  // Profile is accessible to customer and owner
  if (pathname === '/profile') return role === 'customer' || role === 'owner'

  const isAllowed  = allowedRoles  ? allowedRoles.includes(role)  : true
  const isForbidden = forbiddenRoles ? forbiddenRoles.includes(role) : false
  return isAllowed && !isForbidden
}

export default function AuthGuard({
  children,
  allowedRoles,
  forbiddenRoles,
  requireAuth = true,
}: AuthGuardProps) {
  const router   = useRouter()
  const pathname = usePathname()

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const ok = syncCheck(pathname, allowedRoles, forbiddenRoles, requireAuth)
    if (ok) {
      setIsAuthorized(true)
      setChecked(true)
      return
    }
    // Not authorized → redirect
    const user = (() => {
      try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
    })()
    const role = user?.role
    if (!user)              router.push('/login')
    else if (role === 'admin')    router.push('/admin/dashboard')
    else if (role === 'owner')    router.push('/dashboard')
    else if (role === 'customer') router.push('/')
    else                          router.push('/login')
    setChecked(true)
  }, [router, pathname, allowedRoles, forbiddenRoles, requireAuth])

  // Show blank while checking auth (matches SSR blank output)
  if (!checked || !isAuthorized) {
    return <div style={{ minHeight: '100vh', background: '#FAFAF5' }} />
  }

  return <>{children}</>
}

