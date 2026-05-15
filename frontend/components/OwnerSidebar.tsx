'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, User } from 'lucide-react';

export default function OwnerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Đăng ký quán mới', path: '/cafes/create', icon: Store },
    { name: 'Hồ sơ cá nhân', path: '/profile', icon: User },
  ];

  return (
    <aside
      style={{
        width: 288,
        height: '100vh',
        padding: 24,
        background: '#FAFAF5',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        borderRight: '1px solid #E7E5E4',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Logo & Tiêu đề */}
      <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <h1
          style={{
            color: '#1A1C19',
            fontSize: 24,
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 700,
            margin: 0,
            lineHeight: '28px',
            letterSpacing: '-0.5px',
          }}
        >
          WorkSpot Owner
        </h1>
        <p
          style={{
            color: '#A8A29E',
            fontSize: 10,
            fontFamily: 'Be Vietnam Pro, sans-serif',
            fontWeight: 400,
            margin: 0,
            lineHeight: '15px',
            letterSpacing: 0.5,
          }}
        >
          Cổng thông tin Hà Nội
        </p>
      </div>

      {/* Menu Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isActive ? '#14422D' : 'transparent',
                boxShadow: isActive ? '0px 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} color={isActive ? 'white' : '#57534E'} strokeWidth={2} />
              <span
                style={{
                  color: isActive ? 'white' : '#57534E',
                  fontSize: 14,
                  fontFamily: 'Be Vietnam Pro, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: '20px',
                }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 24,
          borderTop: '1px solid #E7E5E4',
        }}
      >
        <div
          style={{
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src="/avatar-placeholder.png"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://ui-avatars.com/api/?name=Minh+Anh&background=14422D&color=fff&size=40';
            }}
            alt="Avatar"
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span
              style={{
                color: '#1A1C19',
                fontSize: 14,
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                lineHeight: '20px',
              }}
            >
              Minh Anh
            </span>
            <span
              style={{
                color: '#78716C',
                fontSize: 10,
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fontWeight: 400,
                lineHeight: '15px',
                letterSpacing: 0.25,
              }}
            >
              Chủ quán
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}