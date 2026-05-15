'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  forbiddenRoles?: string[]
  requireAuth?: boolean
}

export default function AuthGuard({
  children,
  allowedRoles,
  forbiddenRoles,
  requireAuth = true
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null

    // Guest check
    if (!user) {
      if (requireAuth) {
        router.push('/login')
      } else {
        setIsAuthorized(true)
      }
      return
    }

    // Role check
    const role = user.role

    // Profile exception logic: customer and owner allowed, admin and guest NOT
    if (pathname === '/profile') {
      if (role === 'customer' || role === 'owner') {
        setIsAuthorized(true)
      } else {
        router.push(role === 'admin' ? '/admin/dashboard' : '/login')
      }
      return
    }

    const isAllowed = allowedRoles ? allowedRoles.includes(role) : true
    const isForbidden = forbiddenRoles ? forbiddenRoles.includes(role) : false

    if (!isAllowed || isForbidden) {
      if (role === 'admin') {
        router.push('/admin/dashboard')
      } else if (role === 'owner') {
        router.push('/dashboard')
      } else if (role === 'customer') {
        router.push('/')
      } else {
        router.push('/login')
      }
      return
    }

    setIsAuthorized(true)
  }, [router, pathname, allowedRoles, forbiddenRoles, requireAuth])

  if (!isAuthorized) {
    return null // or a loading spinner
  }

  return <>{children}</>
}
