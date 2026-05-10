'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavUser {
  fullName: string;
  avatar: string | null;
}

interface NavbarProps {
  /** Extra content rendered in the center slot (e.g. a back button) */
  center?: React.ReactNode;
}

export default function Navbar({ center }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try { setUser(JSON.parse(userStr)); } catch { /* invalid JSON */ }
    }
  }, []);

  // Close dropdown on outside click
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
      zIndex: 1500,
      background: 'rgba(250,250,245,0.85)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 30px 0 rgba(0,0,0,0.04)',
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 32px',
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: 24, fontWeight: 400, color: '#14422D',
          fontFamily: 'Acme, sans-serif', lineHeight: '32px',
          letterSpacing: '-1.20px', textDecoration: 'none', flexShrink: 0,
        }}>
          WorkSpot
        </Link>

        {/* Optional center slot */}
        {center && <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{center}</div>}

        {/* Auth area */}
        {user ? (
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  style={{ width: 36, height: 36, borderRadius: 9999, objectFit: 'cover', boxShadow: '0 0 0 2px rgba(20,66,45,0.15)' }}
                />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: 9999, background: '#14422D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700,
                }}>
                  {user.fullName?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
              <span style={{ fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, color: '#14422D' }}>
                {user.fullName?.split(' ')[0]}
              </span>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                background: 'white', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                overflow: 'hidden', minWidth: 160, zIndex: 1600,
              }}>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'block', padding: '12px 16px', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, color: '#14422D', textDecoration: 'none' }}
                >
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ display: 'block', width: '100%', padding: '12px 16px', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, color: '#BA1A1A', background: 'none', border: 'none', borderTop: '1px solid #f0f0eb', cursor: 'pointer', textAlign: 'left' }}
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Link href="/register" style={{
              padding: '14px 24px', borderRadius: 9999, background: 'transparent',
              fontSize: 14, color: '#14422D', textDecoration: 'none', fontWeight: 500,
            }}>
              サインアップ
            </Link>
            <Link href="/login" style={{
              padding: '14px 24px', borderRadius: 9999,
              background: 'linear-gradient(135deg, #14422D 0%, #2D5A43 100%)',
              fontSize: 14, color: '#fff', textDecoration: 'none',
              letterSpacing: '0.35px', fontWeight: 500,
            }}>
              サインイン
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
