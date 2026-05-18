'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AdminService, AdminStatsResponse } from '@/services/admin.service'
import { Building2, CheckCircle2, Clock3, Coffee, Loader2, Users2 } from 'lucide-react'

function MiniLineChart({
  data,
  color,
  dark,
}: {
  data: Array<{ month: number; count: string }>
  color: string
  dark?: boolean
}) {
  const points = data.map((item, index) => ({
    x: 8 + (index / (data.length - 1)) * 304,
    y: 72 - (Number(item.count) / (Math.max(...data.map((d) => Number(d.count))) || 1)) * 56,
  }))

  const pathPoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = [
    `8,72`,
    ...points.map((p) => `${p.x},${p.y}`),
    `312,72`,
  ].join(' ')

  return (
    <svg width="100%" height="90" viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={`M ${areaPoints}`} fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(27,67,50,0.08)'} />
      <polyline points={pathPoints} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, idx) => (
        <circle key={idx} cx={point.x} cy={point.y} r="2.5" fill={color} />
      ))}
    </svg>
  )
}

function DonutChart({
  values,
}: {
  values: Array<{ label: string; value: number; color: string }>
}) {
  const total = values.reduce((sum, item) => sum + item.value, 0) || 1
  const circumference = 2 * Math.PI * 50
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <svg className="w-[120px] h-[120px]" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        {values.map((item, index) => {
          const dash = (item.value / total) * circumference
          const circle = (
            <circle
              key={item.label}
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={item.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 60 60)"
            />
          )
          offset += dash
          return circle
        })}
        <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1B4332">
          {total.toLocaleString('vi-VN')}
        </text>
        <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#888780">
          Tổng
        </text>
      </svg>
      <div className="flex flex-col gap-3">
        {values.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm text-[#5F5E5A]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
            <span className="font-semibold text-[#2C2C2A]">{item.value.toLocaleString('vi-VN')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const activityItems = [
  { user: 'Minh Nguyễn', action: 'Đã duyệt Quán Coffee A', time: '5 phút trước', icon: 'user', color: '#EAF3DE', iconColor: '#3B6D11' },
  { user: 'Quý Trần', action: 'Đã duyệt Quán B', time: '10 phút trước', icon: 'check', color: '#E6F1FB', iconColor: '#185FA5' },
  { user: 'Hà Lê', action: 'Cập nhật thông tin quán', time: '1 giờ trước', icon: 'pencil', color: '#E6F1FB', iconColor: '#185FA5' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getStats()
      .then((response) => setStats(response))
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Không thể tải dữ liệu admin')
      })
      .finally(() => setLoading(false))
  }, [])

  const donutValues = useMemo(() => {
    if (!stats) return []
    const total = Number(stats.activeCafes) + Number(stats.pendingCafes) + Number(stats.rejectedCafes)
    return [
      { label: 'Đang hiển thị', value: Number(stats.activeCafes), color: '#22C55E' },
      { label: 'Chờ duyệt', value: Number(stats.pendingCafes), color: '#F59E0B' },
      { label: 'Đã từ chối', value: Number(stats.rejectedCafes), color: '#EF4444' },
    ]
  }, [stats])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-sub">WorkSpot hệ thống hoạt động và thống kê quản lý.</div>
        </div>
        <div className="date-badge">
          <Clock3 size={14} /> {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      <div className="kpi-grid grid gap-4 xl:grid-cols-4 mb-5">
        <div className="kpi-card">
          <div className="kpi-icon bg-[#E6F1FB] text-[#185FA5]">
            <Users2 size={18} />
          </div>
          <div className="kpi-label">Tổng tài khoản</div>
          <div className="kpi-value">{loading ? '...' : stats?.totalAccounts.toLocaleString('vi-VN') ?? '0'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon bg-[#EAF3DE] text-[#3B6D11]">
            <Building2 size={18} />
          </div>
          <div className="kpi-label">Tổng quán</div>
          <div className="kpi-value">{loading ? '...' : stats?.totalCafes.toLocaleString('vi-VN') ?? '0'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon bg-[#FAEEDA] text-[#D97706]">
            <Clock3 size={18} />
          </div>
          <div className="kpi-label">Quán chờ duyệt</div>
          <div className="kpi-value orange">{loading ? '...' : stats?.pendingCafes.toLocaleString('vi-VN') ?? '0'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon bg-[#EAF3DE] text-[#1B7B4A]">
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-label">Quán đang hiển thị</div>
          <div className="kpi-value green">{loading ? '...' : stats?.activeCafes.toLocaleString('vi-VN') ?? '0'}</div>
        </div>
      </div>

      <div className="charts-row grid gap-4 lg:grid-cols-[1.4fr_1fr] mb-5">
        <div className="chart-card dark">
          <div className="chart-title">Tăng trưởng tài khoản</div>
          {stats ? <MiniLineChart data={stats.accountTrend} color="#fff" dark /> : <div className="h-24 flex items-center justify-center text-sm text-[#fff]">Đang tải...</div>}
        </div>
        <div className="chart-card">
          <div className="chart-title">Tăng trưởng quán</div>
          {stats ? <MiniLineChart data={stats.cafeTrend} color="#1B4332" /> : <div className="h-24 flex items-center justify-center text-sm text-[#888]">Đang tải...</div>}
        </div>
      </div>

      <div className="bottom-row grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="chart-card">
          <div className="chart-title">Tỷ lệ trạng thái quán</div>
          {stats ? <DonutChart values={donutValues} /> : <div className="h-32 flex items-center justify-center text-sm text-[#888]">Đang tải...</div>}
        </div>
        <div className="chart-card">
          <div className="chart-title">Hoạt động gần đây</div>
          <div className="activity-header grid grid-cols-[1.8fr_1.2fr_0.8fr] gap-3 pb-2 border-b border-[#E8E5DF] text-xs uppercase text-[#888780]">
            <span>Người dùng</span>
            <span>Hành động</span>
            <span>Thời gian</span>
          </div>
          <div className="mt-4 space-y-3">
            {activityItems.map((item) => (
              <div key={item.time} className="activity-row grid grid-cols-[1.8fr_1.2fr_0.8fr] items-center gap-3 py-3 border-b border-[#F1EFE8] last:border-none">
                <div className="act-user flex items-center gap-3">
                  <div className="act-avatar" style={{ background: item.color }}>
                    {item.user.charAt(0)}
                  </div>
                  <div>
                    <div className="act-name">{item.user}</div>
                  </div>
                </div>
                <div className="act-action text-sm text-[#5F5E5A]">{item.action}</div>
                <div className="act-time text-xs text-[#888780]">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
