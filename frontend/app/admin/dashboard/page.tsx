'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AdminService, AdminStatsResponse } from '@/services/admin.service'
import { Calendar, Users, Building2, Clock, CheckCircle } from 'lucide-react'

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

function formatJpToday() {
  const d = new Date()
  return `本日、${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function buildCounts(trend: Array<{ month: number; count: string }>): number[] {
  const arr = Array(12).fill(0)
  trend.forEach((d) => {
    const idx = Number(d.month) - 1
    if (idx >= 0 && idx < 12) arr[idx] = Number(d.count)
  })
  return arr
}

function TrendChart({
  counts,
  yMax,
  ySteps,
  lineColor,
  areaColor,
  labelColor,
  axisColor,
  dark,
  title,
}: {
  counts: number[]
  yMax: number
  ySteps: number[]
  lineColor: string
  areaColor: string
  labelColor: string
  axisColor: string
  dark?: boolean
  title: string
}) {
  const W = 340, H = 152, PL = 8, PR = 8
  const safe = yMax || 1
  const pts = counts.map((c, i) => ({
    x: PL + (i / 11) * (W - PL - PR),
    y: H - Math.max(0, Math.min(1, c / safe)) * H,
  }))
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = [`${PL},${H}`, ...pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`), `${W - PR},${H}`].join(' ')
  const curMonth = new Date().getMonth()

  return (
    <div style={{
      flex: 1,
      padding: 32, borderRadius: 24,
      background: dark ? '#14422D' : 'white',
      boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
      overflow: 'hidden',
      ...(dark ? {} : { outline: '1px rgba(192,201,193,0.10) solid', outlineOffset: '-1px' }),
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ color: dark ? 'white' : '#14422D', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '28px', paddingBottom: 32 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
        {/* Y-axis */}
        <div style={{
          paddingRight: 16, paddingBottom: 32,
          borderRight: `1px ${axisColor} solid`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          alignSelf: 'stretch', minWidth: 44,
        }}>
          {ySteps.map((y) => (
            <span key={y} style={{ color: labelColor, fontSize: 10, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 700, lineHeight: '15px' }}>
              {y}
            </span>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: labelColor, fontSize: 10, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 700 }}>0</span>
            <span style={{ color: labelColor, fontSize: 8, fontFamily: 'Manrope, sans-serif', fontWeight: 500, opacity: 0.6 }}>件数</span>
          </div>
        </div>

        {/* Chart area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
          <svg width="100%" height="152" viewBox="0 0 340 152" preserveAspectRatio="none" style={{ display: 'block' }}>
            <polygon points={area} fill={areaColor} />
            <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="6.63" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* X-axis */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 4, paddingRight: 4, marginTop: 8 }}>
            {MONTHS.map((m, i) => (
              <span key={m} style={{
                color: i === curMonth
                  ? (dark ? 'white' : '#14422D')
                  : (dark ? 'rgba(255,255,255,0.60)' : 'rgba(65,73,67,0.60)'),
                fontSize: 9,
                fontFamily: 'Manrope, sans-serif',
                fontWeight: i === curMonth ? 700 : 400,
                lineHeight: '14px',
              }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DonutChart({ pending, active, rejected }: { pending: number; active: number; rejected: number }) {
  const total = pending + active + rejected || 1
  const strokeR = 64
  const circ = 2 * Math.PI * strokeR
  const segments = [
    { color: '#EAB308', count: pending, label: '承認待ち' },
    { color: '#22C55E', count: active,  label: '承認済み' },
    { color: '#EF4444', count: rejected, label: '却下' },
  ]
  let acc = 0
  const arcs = segments.map((s) => {
    const dash = (s.count / total) * circ
    const node = { ...s, dash, offset: acc }
    acc += dash
    return node
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 192, height: 192, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
        <svg width="192" height="192" viewBox="0 0 192 192" style={{ position: 'absolute', top: 0, left: 0 }}>
          {arcs.map((s, i) => (
            <circle
              key={i}
              cx="96" cy="96" r={strokeR}
              fill="none"
              stroke={s.color}
              strokeWidth="21.33"
              strokeDasharray={`${s.dash.toFixed(2)} ${(circ - s.dash).toFixed(2)}`}
              strokeDashoffset={(circ / 4 - s.offset).toFixed(2)}
              transform="rotate(-90 96 96)"
            />
          ))}
        </svg>
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <div style={{ color: '#14422D', fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 800, lineHeight: '36px' }}>
            {total.toLocaleString()}
          </div>
          <div style={{ color: '#414943', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1 }}>
            総計
          </div>
        </div>
      </div>
      <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, background: s.color, borderRadius: 9999 }} />
              <span style={{ color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px' }}>{s.label}</span>
            </div>
            <span style={{ color: '#1A1C19', fontSize: 12, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 700, lineHeight: '16px' }}>{s.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ACTIVITY = [
  { user: '顧客A',      action: '新規店舗登録',           time: '2分前',  avatarBg: '#F1F5F9', avatarText: '#334155' },
  { user: 'ミン・グエン', action: '「HanoiCoffee」を承認', time: '15分前', avatarBg: '#DCFCE7', avatarText: '#15803D' },
  { user: 'クイ・チャン', action: '店舗情報を更新',         time: '1時間前', avatarBg: '#DBEAFE', avatarText: '#1D4ED8' },
  { user: 'ハ・レ',     action: 'アカウントを作成',        time: '3時間前', avatarBg: '#FEF9C3', avatarText: '#854D0E' },
]

const STAT_CARDS = (s: AdminStatsResponse | null, loading: boolean) => [
  {
    icon: Users,
    iconBg: 'rgba(20,66,45,0.05)',
    iconColor: '#14422D',
    label: '総アカウント数',
    value: loading ? '…' : (s?.totalAccounts ?? 0).toLocaleString(),
    valueColor: '#1A1C19',
  },
  {
    icon: Building2,
    iconBg: 'rgba(20,66,45,0.05)',
    iconColor: '#14422D',
    label: '総店舗数',
    value: loading ? '…' : (s?.totalCafes ?? 0).toLocaleString(),
    valueColor: '#1A1C19',
  },
  {
    icon: Clock,
    iconBg: 'rgba(144,76,24,0.05)',
    iconColor: '#904C18',
    label: '承認待ち店舗数',
    value: loading ? '…' : (s?.pendingCafes ?? 0).toLocaleString(),
    valueColor: '#904C18',
  },
  {
    icon: CheckCircle,
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    label: '公開中店舗数',
    value: loading ? '…' : (s?.activeCafes ?? 0).toLocaleString(),
    valueColor: '#16A34A',
  },
]

export default function AdminDashboard() {
  const [stats, setStats]   = useState<AdminStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AdminService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const accountCounts = useMemo(() => stats ? buildCounts(stats.accountTrend) : Array(12).fill(0), [stats])
  const cafeCounts    = useMemo(() => stats ? buildCounts(stats.cafeTrend)    : Array(12).fill(0), [stats])
  const accountMax    = useMemo(() => Math.max(...accountCounts, 1), [accountCounts])
  const cafeMax       = useMemo(() => Math.max(...cafeCounts, 1), [cafeCounts])

  const accountYSteps = useMemo(() => {
    const top = Math.ceil(accountMax / 250) * 250 || 1000
    return [top, top * 0.75, top * 0.5, top * 0.25].map(Math.round)
  }, [accountMax])

  const cafeYSteps = useMemo(() => {
    const top = Math.ceil(cafeMax / 50) * 50 || 200
    return [top, top * 0.75, top * 0.5, top * 0.25].map(Math.round)
  }, [cafeMax])

  const cards = STAT_CARDS(stats, loading)

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: '#FAFAF5',
      padding: 48,
      display: 'flex', flexDirection: 'column', gap: 32,
    }}>

      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: '#14422D', fontSize: 36, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '40px' }}>
            管理者ダッシュボード
          </div>
          <div style={{ color: '#414943', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
            WorkSpotシステム活動の概要
          </div>
        </div>
        <div style={{
          paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10,
          background: '#F4F4EF', borderRadius: 9999,
          outline: '1px rgba(192,201,193,0.20) solid', outlineOffset: '-1px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Calendar size={14} color="#414943" />
          <span style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '20px', whiteSpace: 'nowrap' }}>
            {formatJpToday()}
          </span>
        </div>
      </div>

      {/* ── KPIカード ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, paddingTop: 16 }}>
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} style={{
              padding: 24, background: 'white',
              boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
              borderRadius: 16,
              outline: '1px rgba(192,201,193,0.10) solid', outlineOffset: '-1px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ width: 40, height: 40, background: c.iconBg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }}>
                <Icon size={20} color={c.iconColor} />
              </div>
              <div style={{ color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.6, paddingTop: 12 }}>
                {c.label}
              </div>
              <div style={{ color: c.valueColor, fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '36px' }}>
                {c.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── トレンドチャート ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <TrendChart
          counts={accountCounts}
          yMax={accountMax}
          ySteps={accountYSteps}
          lineColor="white"
          areaColor="rgba(255,255,255,0.12)"
          labelColor="rgba(255,255,255,0.40)"
          axisColor="rgba(255,255,255,0.10)"
          dark
          title="新規アカウント登録傾向グラフ"
        />
        <TrendChart
          counts={cafeCounts}
          yMax={cafeMax}
          ySteps={cafeYSteps}
          lineColor="#14422D"
          areaColor="rgba(20,66,45,0.08)"
          labelColor="rgba(65,73,67,0.40)"
          axisColor="rgba(192,201,193,0.10)"
          title="新規店舗登録傾向グラフ"
        />
      </div>

      {/* ── ドーナツ + アクティビティ ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>

        {/* 店舗ステータス比率 */}
        <div style={{
          padding: 32, background: 'white',
          boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
          borderRadius: 24,
          outline: '1px rgba(192,201,193,0.10) solid', outlineOffset: '-1px',
          display: 'flex', flexDirection: 'column', gap: 32,
        }}>
          <div style={{ color: '#14422D', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '28px' }}>
            店舗ステータス比率
          </div>
          {stats ? (
            <DonutChart
              pending={stats.pendingCafes}
              active={stats.activeCafes}
              rejected={stats.rejectedCafes}
            />
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A29E', fontSize: 14, fontFamily: 'Manrope, sans-serif' }}>
              読み込み中...
            </div>
          )}
        </div>

        {/* 最近の活動 */}
        <div style={{
          paddingTop: 32, paddingBottom: 78, paddingLeft: 32, paddingRight: 32,
          background: 'white',
          boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
          borderRadius: 24,
          outline: '1px rgba(192,201,193,0.10) solid', outlineOffset: '-1px',
          display: 'flex', flexDirection: 'column', gap: 32,
        }}>
          <div style={{ color: '#14422D', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '28px' }}>
            最近の活動
          </div>

          {/* テーブルヘッダー */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 0.5fr', paddingBottom: 17, borderBottom: '1px rgba(192,201,193,0.10) solid' }}>
            {(['イベント','操作','時間'] as const).map((h, i) => (
              <div key={h} style={{
                color: 'rgba(65,73,67,0.50)', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: 1,
                textAlign: i === 2 ? 'right' : 'left',
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* 行 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY.map((a, idx) => (
              <div key={idx} style={{
                display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 0.5fr',
                alignItems: 'center',
                paddingTop: 12, paddingBottom: 12,
                borderTop: idx > 0 ? '1px rgba(192,201,193,0.05) solid' : 'none',
              }}>
                {/* ユーザー */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9999, flexShrink: 0,
                    background: a.avatarBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: a.avatarText, fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 600,
                  }}>
                    {a.user.charAt(0)}
                  </div>
                  <span style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
                    {a.user}
                  </span>
                </div>
                {/* 操作 */}
                <span style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  {a.action}
                </span>
                {/* 時間 */}
                <span style={{ color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', textAlign: 'right' }}>
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
