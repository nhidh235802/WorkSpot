'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, FileSignature, User, LogOut } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function toAbsUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return last ? last.slice(0, 2) : name.slice(0, 2);
}

const navigationItems = [
  // Sửa lại path cho khớp với cấu trúc thư mục thực tế
  { id: 'overview', label: 'Tổng quan', path: '/dashboard', icon: LayoutGrid },
  { id: 'new-venue', label: 'Đăng ký quán mới', path: '/cafes/create', icon: FileSignature },
  { id: 'profile', label: 'Hồ sơ cá nhân', path: '/profile', icon: User },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // State lưu thông tin chủ quán
  const [ownerData, setOwnerData] = useState<{ fullName?: string; avatar?: string | null } | null>(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage (key 'user' giống lúc Login)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setOwnerData(JSON.parse(userStr));
    }
  }, []);

  // HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <aside className="w-[288px] h-screen sticky top-0 left-0 flex flex-col py-8 px-6 border-r border-[#E7E5E4] shrink-0 bg-[#FAFAF5] box-border z-50">
      
      {/* Header / Logo */}
      <div className="mb-10">
        <h1 className="text-[#1A1C19] text-[20px] font-bold font-['Manrope'] leading-tight">
          WorkSpot Owner
        </h1>
        <p className="text-[#A8A29E] text-[10px] tracking-wide mt-1 font-['Be_Vietnam_Pro'] uppercase">
          Cổng thông tin đối tác
        </p>
      </div>

      {/* Menu Navigation */}
      <nav className="flex flex-col gap-2 font-['Be_Vietnam_Pro']">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-[12px] transition-all duration-200 ${
                isActive
                  ? 'bg-[#14422D] text-white shadow-sm'
                  : 'bg-transparent text-[#57534E] hover:bg-[#E8F0EB]/50'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout - Nằm sát đáy */}
      <div className="mt-auto flex flex-col gap-6">
        <div className="w-full h-px bg-[#E7E5E4]" />
        
        <div className="flex items-center justify-between px-2 font-['Be_Vietnam_Pro']">
          <div className="flex items-center gap-3 overflow-hidden">
            {toAbsUrl(ownerData?.avatar) ? (
              <img
                src={toAbsUrl(ownerData?.avatar)!}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E7E5E4]"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(20,66,45,0.10)', color: '#14422D' }}
              >
                {ownerData?.fullName ? getInitials(ownerData.fullName) : 'U'}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-[#1A1C19] text-[14px] font-bold truncate">
                {ownerData?.fullName || 'Đang tải...'}
              </span>
              <span className="text-[#A8A29E] text-[10px]">Chủ quán</span>
            </div>
          </div>

          {/* NÚT ĐĂNG XUẤT */}
          <button 
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 text-[#A8A29E] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-all shrink-0"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

    </aside>
  );
}