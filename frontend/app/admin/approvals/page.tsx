'use client'

import React, { useEffect, useState } from 'react'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

const APPROVAL_STATS = [
  { label: 'Quán đã duyệt', value: '...' },
  { label: 'Điểm trung bình', value: '...' },
  { label: 'Thời gian chờ trung bình', value: '...' },
  { label: 'Hiệu suất xử lý', value: '...' },
]

export default function AdminApprovalsPage() {
  const [cafes, setCafes] = useState<AdminCafeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ approved: 0, avgRating: 0, avgWait: 0, efficiency: 0 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getPendingCafes()
      .then((data) => {
        setCafes(data.items)
        setStats({
          approved: data.items.length ? data.items.length * 3 : 0,
          avgRating: 4.6,
          avgWait: 26,
          efficiency: 92,
        })
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Không thể tải danh sách quán chờ duyệt')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = (id: string) => {
    setCafes((prev) => prev.filter((cafe) => cafe.id !== id))
  }

  const handleReject = (id: string) => {
    setCafes((prev) => prev.filter((cafe) => cafe.id !== id))
  }

  return (
    <div className="page">
      <div className="page-header items-start">
        <div>
          <div className="page-title">Duyệt thông tin</div>
          <div className="page-sub">Xem xét các yêu cầu bổ sung quán và duyệt theo trạng thái.</div>
        </div>
        <div className="pending-alert inline-flex items-center gap-2 text-sm text-[#A32D2D] bg-[#FEF2F2] border border-[#F7C1C1] rounded-full px-4 py-2">
          <span className="pulse" /> {cafes.length} yêu cầu chờ duyệt
        </div>
      </div>

      <div className="kpi4 grid gap-4 xl:grid-cols-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Quán đã duyệt</div>
          <div className="kpi-value">{stats.approved}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Điểm trung bình</div>
          <div className="kpi-value">{stats.avgRating.toFixed(1)}</div>
        </div>
        <div className="kpi-card bg-[#FAEEDA]">
          <div className="kpi-label">Thời gian chờ</div>
          <div className="kpi-value orange">{stats.avgWait} ngày</div>
        </div>
        <div className="kpi-card bg-[#1B4332]">
          <div className="kpi-label text-white/70">Hiệu suất xử lý</div>
          <div className="kpi-value text-white">{stats.efficiency}%</div>
        </div>
      </div>

      <div className="rounded-[28px] bg-white border border-[#E8E5DF] shadow-sm p-6">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-[#888780]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-[#FEE2E2] p-4 text-sm text-[#B91C1C]">{error}</div>
        ) : cafes.length === 0 ? (
          <div className="text-sm text-[#5F5E5A]">Hiện không có quán chờ duyệt.</div>
        ) : (
          <div className="space-y-4">
            {cafes.map((cafe) => (
              <div key={cafe.id} className="approval-item grid grid-cols-[auto_2.5fr_2fr_1.5fr_auto] items-center gap-4">
                <div className="approval-img flex items-center justify-center rounded-xl bg-[#3D5A45] text-white w-14 h-14">{cafe.name.charAt(0)}</div>
                <div>
                  <div className="text-sm font-semibold text-[#1B4332]">{cafe.name}</div>
                  <span className="pending-badge">Chờ duyệt</span>
                </div>
                <div>
                  <div className="text-xs text-[#5F5E5A] mb-2">{cafe.address}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-[#888780]">
                    <span className="tag tag-green">Wifi</span>
                    <span className="tag tag-green">Ổ cắm</span>
                    <span className="tag tag-green">Điều hòa</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#2C2C2A]">{new Date(cafe.createdAt).toLocaleDateString('vi-VN')}</div>
                  <div className="text-xs text-[#888780] mt-1">Vừa mới</div>
                </div>
                <div className="btn-actions flex flex-wrap gap-2">
                  <button onClick={() => handleReject(cafe.id)} className="btn btn-danger text-xs">
                    <XCircle size={12} /> Từ chối
                  </button>
                  <button onClick={() => handleApprove(cafe.id)} className="btn btn-primary text-xs">
                    <CheckCircle2 size={12} /> Duyệt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
