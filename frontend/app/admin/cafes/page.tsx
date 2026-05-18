'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { Eye, EyeOff, Loader2, Search } from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; badgeClass: string; action: string }> = {
  approved: { label: 'Đang hiển thị', badgeClass: 'bg-[#DCFCE7] text-[#166534]', action: 'Ẩn quán' },
  pending: { label: 'Chờ duyệt', badgeClass: 'bg-[#FEF3C7] text-[#B45309]', action: 'Ẩn quán' },
  rejected: { label: 'Đã từ chối', badgeClass: 'bg-[#FEE2E2] text-[#B91C1C]', action: 'Ẩn quán' },
  hidden: { label: 'Đã ẩn', badgeClass: 'bg-[#EDE9FE] text-[#4338CA]', action: 'Hiện quán' },
}

function AmenityIcon({ type }: { type: string }) {
  switch (type) {
    case 'wifi':
      return <span className="text-[#888780] text-sm">Wi-Fi</span>
    case 'plug':
      return <span className="text-[#888780] text-sm">Ổ cắm</span>
    case 'monitor':
      return <span className="text-[#888780] text-sm">Màn hình</span>
    case 'ac':
      return <span className="text-[#888780] text-sm">Điều hòa</span>
    case 'group':
      return <span className="text-[#888780] text-sm">Nhóm</span>
    default:
      return <span className="text-[#888780] text-sm">Tiện ích</span>
  }
}

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<AdminCafeItem[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getCafesForAdmin({ search: search || undefined, status: statusFilter || undefined, limit: 50 })
      .then((data) => setCafes(data.items))
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Không thể tải danh sách quán')
      })
      .finally(() => setLoading(false))
  }, [statusFilter, search, refreshKey])

  const totalCounts = useMemo(
    () => ({
      total: cafes.length,
      status: statusFilter ? STATUS_MAP[statusFilter]?.label || 'Tất cả' : 'Tất cả',
    }),
    [cafes.length, statusFilter]
  )

  const toggleVisibility = async (id: string) => {
    try {
      await AdminService.toggleCafeVisibility(id)
      setRefreshKey((prev) => prev + 1)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Không thể thay đổi trạng thái hiển thị')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Quản lý quán</div>
          <div className="page-sub">Theo dõi trạng thái, tìm kiếm và điều chỉnh hiển thị quán.</div>
        </div>
      </div>

      <div className="filter-row mb-5 flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="search-box flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-[#888780] -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm theo tên hoặc địa chỉ"
            className="w-full rounded-xl border border-[#E0DDD6] bg-white py-3 pl-10 pr-4 text-sm text-[#2C2C2A] outline-none"
          />
        </div>
        <div className="filter-select flex items-center gap-2 rounded-xl border border-[#E0DDD6] bg-white px-4 py-3 text-sm text-[#5F5E5A]">
          Trạng thái
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đang hiển thị</option>
            <option value="rejected">Đã từ chối</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      <div className="stat-cards grid gap-4 lg:grid-cols-3 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Tổng quán</div>
          <div className="kpi-value">{totalCounts.total.toLocaleString('vi-VN')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Trạng thái hiện tại</div>
          <div className="kpi-value">{totalCounts.status}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Hành động</div>
          <div className="kpi-value">Ẩn / Hiện quán</div>
        </div>
      </div>

      <div className="cafe-table">
        <div className="cafe-row cafe-table-header grid grid-cols-[3fr_2fr_1.3fr_1.5fr] gap-4 bg-[#FAFAF8] px-4 py-3 text-xs uppercase text-[#888780]">
          <span>Tên quán</span>
          <span>Địa chỉ / tiện ích</span>
          <span>Trạng thái</span>
          <span>Hành động</span>
        </div>
        <div>
          {loading ? (
            <div className="p-8 text-center text-sm text-[#888780]">Đang tải...</div>
          ) : error ? (
            <div className="p-6 text-sm text-[#B91C1C]">{error}</div>
          ) : cafes.length === 0 ? (
            <div className="p-6 text-sm text-[#5F5E5A]">Không có quán phù hợp.</div>
          ) : (
            cafes.map((cafe) => {
              const status = STATUS_MAP[cafe.status] || { label: cafe.status, badgeClass: 'bg-[#F1EFE8] text-[#5F5E5A]', action: 'Xem' }
              return (
                <div key={cafe.id} className="cafe-row grid grid-cols-[3fr_2fr_1.3fr_1.5fr] gap-4 items-center px-4 py-4 border-b border-[#F1EFE8] hover:bg-[#FAFAF8]">
                  <div className="flex items-center gap-3">
                    <div className="cafe-img bg-[#3D5A45] text-white flex items-center justify-center rounded-lg">{cafe.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-[#2C2C2A] text-sm">{cafe.name}</div>
                      <div className="text-xs text-[#888780] mt-1">{cafe.owner?.fullName || 'Chưa có chủ'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#5F5E5A] mb-2">{cafe.address}</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {cafe.avgRating != null && <span className="tag tag-blue">{cafe.avgRating} ★</span>}
                      <span className="tag tag-green">{cafe.reviewCount} đánh giá</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${status.badgeClass}`}>{status.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(cafe.id)}
                      className="btn btn-ghost text-xs"
                    >
                      {status.action}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
