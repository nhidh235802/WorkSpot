'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileSignature, User } from 'lucide-react';

const navigationItems = [
  { id: 'overview', label: 'Tổng quan', path: '/dashboard', icon: LayoutGrid },
  { id: 'new-venue', label: 'Đăng ký quán mới', path: '/cafes/create', icon: FileSignature },
  { id: 'profile', label: 'Hồ sơ cá nhân', path: '/owner/profile', icon: User },
];

export default function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[288px] h-screen sticky top-0 left-0 flex flex-col py-8 px-6 border-r border-[#E7E5E4] shrink-0 bg-[#FAFAF5] box-border z-50">
      
      {/* Header / Logo */}
      <div className="mb-10">
        <h1 className="text-[#1A1C19] text-[20px] font-bold font-['Manrope'] leading-tight">
          WorkSpot Owner
        </h1>
        <p className="text-[#A8A29E] text-[10px] tracking-wide mt-1 font-['Be_Vietnam_Pro']">
          Cổng thông tin Hà Nội
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

      {/* User Profile - Nằm sát đáy */}
      <div className="mt-auto flex flex-col gap-6">
        <div className="w-full h-px bg-[#E7E5E4]" />
        
        <div className="flex items-center gap-3 font-['Be_Vietnam_Pro'] px-2">
          <img
            src="https://ui-avatars.com/api/?name=Minh+Anh&background=1A1C19&color=fff&size=40"
            alt="Avatar Minh Anh"
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-[#1A1C19] text-[14px] font-bold">Minh Anh</span>
            <span className="text-[#A8A29E] text-[10px]">Chủ quán</span>
          </div>
        </div>
      </div>

    </aside>
  );
}