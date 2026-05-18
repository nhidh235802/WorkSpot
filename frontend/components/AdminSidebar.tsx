'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, Users, FileCheck, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/cafes', label: 'Quản lý quán', icon: Building2 },
  { href: '/admin/account', label: 'Quản lý tài khoản', icon: Users },
  { href: '/admin/approvals', label: 'Duyệt thông tin', icon: FileCheck },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const toggleLogout = () => {
    setShowLogout((prev) => !prev)
  }

  return (
     <aside className="sticky top-0 flex w-[200px] flex-col h-screen bg-[#FAFAF8] border-r border-[#E0DDD6]">
      <div className="px-7 py-7 border-b border-[#E0DDD6]">
        <div className="text-[#1B4332] text-2xl font-bold tracking-tight">WorkSpot</div>
        <div className="text-[#888780] text-sm mt-1">Manager Dashboard</div>
      </div>

      <nav className="flex-1 px-5 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                isActive ? 'bg-[#1B4332] text-white' : 'text-[#5F5E5A] hover:bg-[#EAF0EB]'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-7 py-5 border-t border-[#E0DDD6]">
        {showLogout && (
          <button
            type="button"
            onClick={handleLogout}
            className="mb-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FEF2F2] text-[#A32D2D] px-4 py-3 text-sm font-semibold hover:bg-[#FEE2E2] transition"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        )}

        <button
          type="button"
          onClick={toggleLogout}
          className="w-full text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-[#E0DDD6] flex items-center justify-center text-[#5F5E5A] font-semibold">AD</div>
            <div>
              <p className="text-sm font-semibold text-[#1B4332]">Admin</p>
              <p className="text-xs text-[#888780]">Quản trị viên</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  )
}