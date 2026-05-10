'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut } from 'lucide-react';

interface NavUser {
  fullName: string;
  avatar: string | null;
}

interface NavbarProps {
  /** Nội dung hiển thị ở giữa (ví dụ: nút back hoặc thanh search nhỏ) */
  center?: React.ReactNode;
}

export default function Navbar({ center }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load user từ localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        console.error("Invalid user data");
      }
    }
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1500, // Cao hơn Sidebar (thường 1000) và Map (400)
      width: '100%',
      background: 'rgba(250,250,245,0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 30px 0 rgba(0,0,0,0.04)',
      borderBottom: '1px solid rgba(20,66,45,0.05)',
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: 1536,
        margin: '0 auto',
        padding: '0 32px',
        height: 80, // Chiều cao cố định
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* --- LEFT: LOGO --- */}
        <div style={{ display: 'flex', alignItems: 'center', width: 150 }}>
          <Link
            href="/"
            style={{
              display: 'inline-block', // Chặn Link dãn nở hết chiều cao div cha
              color: '#14422D',
              fontSize: 24,
              fontFamily: 'Acme',
              fontWeight: '400',
              textDecoration: 'none',
              lineHeight: '32px'
            }}
          >
            WorkSpot
          </Link>
        </div>

        {/* --- CENTER SLOT --- */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {center && center}
        </div>

        {/* --- RIGHT: AUTH AREA --- */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
          {user ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', border: '2px solid #14422D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', color: '#14422D'
                }}>
                  <User size={24} color="#14422D" strokeWidth={2} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  background: '#EEEEE9',
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  minWidth: 160,
                  zIndex: 1600,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '14px 16px',
                  gap: 20
                }}>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14,
                      color: '#14422D',
                      textDecoration: 'none',
                      fontFamily: 'Manrope, sans-serif'
                    }}
                  >
                    <Settings size={20} color="#14422D" strokeWidth={2} />
                    <span style={{ lineHeight: '20px' }}>設定</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14,
                      color: '#14422D',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'Manrope, sans-serif'
                    }}
                  >
                    <LogOut size={20} color="#14422D" strokeWidth={2} />
                    <span style={{ lineHeight: '20px' }}>ログアウト</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest Buttons */
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
              <Link href="/register" style={{
                padding: '12px 20px', borderRadius: 9999, fontSize: 14, color: '#14422D', textDecoration: 'none', fontWeight: 600
              }}>
                サインアップ
              </Link>
              <Link href="/login" style={{
                padding: '12px 24px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #14422D 0%, #2D5A43 100%)',
                fontSize: 14, color: '#fff', textDecoration: 'none', fontWeight: 600
              }}>
                サインイン
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}