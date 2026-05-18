'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, Users, FileCheck, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/admin/cafes',     label: '店舗管理',       icon: Building2 },
  { href: '/admin/account',   label: 'アカウント管理', icon: Users },
  { href: '/admin/approvals', label: '情報の承認',     icon: FileCheck },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <aside style={{
      position: 'sticky', top: 0,
      width: 256, flexShrink: 0,
      height: '100vh',
      background: '#FAFAF5',
      borderRight: '1px rgba(192,201,193,0.30) solid',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ロゴ */}
      <div style={{
        padding: '28px 28px 24px',
        borderBottom: '1px rgba(192,201,193,0.20) solid',
      }}>
        <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 800, lineHeight: '28px' }}>
          WorkSpot
        </div>
        <div style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, marginTop: 4 }}>
          管理パネル
        </div>
      </div>

      {/* ナビゲーション */}
      <nav style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                borderRadius: 9999, textDecoration: 'none',
                background: isActive ? '#14422D' : 'transparent',
                color: isActive ? 'white' : '#414943',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(20,66,45,0.08)' }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ユーザー + ログアウト */}
      <div style={{ padding: '16px 20px 24px', borderTop: '1px rgba(192,201,193,0.20) solid' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 9999,
            background: 'rgba(20,66,45,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#14422D', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700,
            flexShrink: 0,
          }}>
            AD
          </div>
          <div>
            <div style={{ color: '#14422D', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '20px' }}>
              Admin
            </div>
            <div style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
              管理者
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            paddingTop: 10, paddingBottom: 10,
            borderRadius: 9999, border: 'none', cursor: 'pointer',
            background: 'rgba(186,26,26,0.08)',
            color: '#BA1A1A', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(186,26,26,0.14)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(186,26,26,0.08)' }}
        >
          <LogOut size={15} />
          ログアウト
        </button>
      </div>
    </aside>
  )
}
