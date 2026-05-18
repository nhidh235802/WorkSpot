'use client'

import React, { useEffect, useState } from 'react'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const PAGE_SIZE = 5

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; actionLabel: string }> = {
  approved: { label: '営業中',   dot: '#14422D', bg: 'rgba(20,66,45,0.10)',    text: '#14422D', actionLabel: '非表示' },
  hidden:   { label: '非表示',   dot: '#BA1A1A', bg: 'rgba(186,26,26,0.10)',   text: '#BA1A1A', actionLabel: '再表示' },
  pending:  { label: '承認待ち', dot: '#B45309', bg: 'rgba(245,158,11,0.10)',  text: '#B45309', actionLabel: '非表示' },
  rejected: { label: '休業中',   dot: '#BA1A1A', bg: 'rgba(186,26,26,0.10)',   text: '#BA1A1A', actionLabel: '非表示' },
}

const FACILITY_LABEL: Record<string, string> = {
  wifi:           'Wi-Fi',
  socket:         '電源',
  workspace:      'ワークスペース',
  desk:           'デスク席',
  snack:          '軽食・飲料',
  flexible_hours: '時間柔軟',
  cleanliness:    '清潔感',
  smoking_rule:   '禁煙・分煙',
}

const STATUS_FILTER_OPTIONS = [
  { value: '',         label: 'ステータス (すべて)' },
  { value: 'approved', label: '営業中' },
  { value: 'pending',  label: '承認待ち' },
  { value: 'hidden',   label: '非表示' },
  { value: 'rejected', label: '休業中' },
]

function toAbsUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}${path}`
}

export default function AdminCafesPage() {
  const [cafes, setCafes]           = useState<AdminCafeItem[]>([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]             = useState(1)
  const [stats, setStats]           = useState<{ totalCafes?: number; activeCafes?: number; pendingCafes?: number } | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    AdminService.getStats().then(setStats).catch(() => {})
  }, [refreshKey])

  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getCafesForAdmin({
      search:  search || undefined,
      status:  statusFilter || undefined,
      page,
      limit:   PAGE_SIZE,
    })
      .then((data) => {
        setCafes(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'データを読み込めませんでした')
      })
      .finally(() => setLoading(false))
  }, [statusFilter, search, page, refreshKey])

  // フィルター変更時はページを1に戻す
  const handleStatusFilter = (v: string) => { setStatusFilter(v); setPage(1) }
  const handleSearch       = (v: string) => { setSearch(v);       setPage(1) }

  const toggleVisibility = async (id: string) => {
    try {
      await AdminService.toggleCafeVisibility(id)
      setRefreshKey((prev) => prev + 1)
    } catch (err: any) {
      console.error(err)
      setError(err.message || '操作に失敗しました')
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', background: '#FAFAF5', padding: 48, display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* ── ヘッダー + 検索 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* タイトル */}
        <div style={{ maxWidth: 672 }}>
          <div style={{ color: '#14422D', fontSize: 48, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '48px', marginBottom: 16 }}>
            既存店舗管理
          </div>
          <div style={{ color: '#414943', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '29.25px' }}>
            ハノイ市内の登録済みワークスペースの管理。店舗情報の更新、稼働状況の確認、<br />
            およびプロモーション設定が可能です。
          </div>
        </div>

        {/* 検索 + フィルター */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, maxWidth: 576, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#414943' }} />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="店舗名で検索"
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingTop: 15, paddingBottom: 14, paddingLeft: 48, paddingRight: 24,
                background: 'white', borderRadius: 9999, border: 'none',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                outline: '1px rgba(192,201,193,0.30) solid', outlineOffset: '-1px',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {/* エリアフィルター (UI のみ) */}
            <select
              style={{
                width: 164, height: 46, paddingLeft: 21, paddingRight: 36,
                background: 'white', borderRadius: 9999, border: 'none',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                outline: '1px rgba(192,201,193,0.30) solid', outlineOffset: '-1px',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                appearance: 'none', cursor: 'pointer',
              }}
            >
              <option>エリア (すべて)</option>
            </select>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              style={{
                width: 192, height: 46, paddingLeft: 21, paddingRight: 36,
                background: 'white', borderRadius: 9999, border: 'none',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                outline: '1px rgba(192,201,193,0.30) solid', outlineOffset: '-1px',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                appearance: 'none', cursor: 'pointer',
              }}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 統計カード ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: '登録店舗総数',   value: stats?.totalCafes   },
          { label: '公開中の店舗',   value: stats?.activeCafes  },
          { label: '承認待ちの店舗', value: stats?.pendingCafes },
        ].map((s) => (
          <div key={s.label} style={{
            padding: 24, background: 'white',
            boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
            borderRadius: 12, outline: '1px rgba(192,201,193,0.05) solid', outlineOffset: '-1px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ color: '#414943', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1 }}>
              {s.label}
            </div>
            <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
              {s.value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* ── テーブル ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ヘッダー行 */}
        <div style={{
          paddingTop: 8, paddingBottom: 8, paddingLeft: 24, paddingRight: 24,
          borderBottom: '1px rgba(192,201,193,0.10) solid',
          display: 'grid', gridTemplateColumns: '3fr 2fr 1.3fr 2fr',
          alignItems: 'center', gap: 16,
        }}>
          {([
            { label: '店舗情報・雰囲気', align: 'left'   },
            { label: '所在地・アメニティ', align: 'left' },
            { label: '稼働状況',          align: 'center' },
            { label: 'アクション',         align: 'right'  },
          ] as const).map((h) => (
            <div key={h.label} style={{
              color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
              textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1,
              textAlign: h.align,
            }}>
              {h.label}
            </div>
          ))}
        </div>

        {/* データ行 */}
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>
            読み込み中...
          </div>
        ) : error ? (
          <div style={{ padding: 24, color: '#BA1A1A', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>
            {error}
          </div>
        ) : cafes.length === 0 ? (
          <div style={{ padding: 24, color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>
            該当する店舗がありません。
          </div>
        ) : (
          cafes.map((cafe) => {
            const sc  = STATUS_CONFIG[cafe.status] ?? STATUS_CONFIG['approved']
            const img = toAbsUrl(cafe.avatar)
            const tags = (cafe.facilities ?? []).slice(0, 2).map((f) => FACILITY_LABEL[f] ?? f)

            return (
              <div key={cafe.id} style={{
                padding: 16, background: 'white', borderRadius: 12,
                outline: '1px rgba(192,201,193,0.05) solid', outlineOffset: '-1px',
                display: 'grid', gridTemplateColumns: '3fr 2fr 1.3fr 2fr',
                alignItems: 'center', gap: 16,
              }}>

                {/* 店舗情報 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                    background: '#14422D',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {img ? (
                      <img src={img} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontSize: 20, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                        {cafe.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <div style={{ color: '#14422D', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cafe.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {tags.length > 0 ? tags.map((tag) => (
                        <span key={tag} style={{
                          paddingLeft: 8, paddingRight: 8,
                          background: 'rgba(255,219,199,0.50)', borderRadius: 9999,
                          color: '#311300', fontSize: 9, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                          lineHeight: '18px', whiteSpace: 'nowrap',
                        }}>
                          {tag}
                        </span>
                      )) : (
                        <>
                          {cafe.avgRating != null && (
                            <span style={{ paddingLeft: 8, paddingRight: 8, background: 'rgba(255,219,199,0.50)', borderRadius: 9999, color: '#311300', fontSize: 9, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '18px', whiteSpace: 'nowrap' }}>
                              ★ {cafe.avgRating}
                            </span>
                          )}
                          <span style={{ paddingLeft: 8, paddingRight: 8, background: 'rgba(255,219,199,0.50)', borderRadius: 9999, color: '#311300', fontSize: 9, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '18px', whiteSpace: 'nowrap' }}>
                            {cafe.reviewCount} レビュー
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 住所 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#1A1C19', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px' }}>
                    {cafe.address}
                  </div>
                  {cafe.owner && (
                    <div style={{ color: 'rgba(65,73,67,0.70)', fontSize: 11, fontFamily: 'Manrope, sans-serif', fontWeight: 400 }}>
                      {cafe.owner.fullName}
                    </div>
                  )}
                </div>

                {/* 稼働状況 */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2,
                    background: sc.bg, borderRadius: 9999,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ width: 6, height: 6, background: sc.dot, borderRadius: 9999, flexShrink: 0 }} />
                    <span style={{ color: sc.text, fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '15px', whiteSpace: 'nowrap' }}>
                      {sc.label}
                    </span>
                  </div>
                </div>

                {/* アクション */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    style={{
                      paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6,
                      background: '#14422D', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                      borderRadius: 9999, border: 'none', cursor: 'pointer',
                      color: 'white', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    詳細を表示
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(cafe.id)}
                    style={{
                      paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6,
                      background: '#7F8181', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                      borderRadius: 9999, border: 'none', cursor: 'pointer',
                      color: 'white', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sc.actionLabel}
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* ── ページネーション ── */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingLeft: 8, paddingRight: 8 }}>
            <div style={{ color: '#414943', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
              {total} 件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, total)} 件表示
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* 前へ */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  width: 36, height: 36, borderRadius: 9999,
                  border: '1px rgba(192,201,193,0.50) solid',
                  background: page === 1 ? '#F4F4F1' : 'white',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: page === 1 ? '#C0C9C1' : '#14422D',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {/* ページ番号 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 9999,
                    border: p === page ? 'none' : '1px rgba(192,201,193,0.50) solid',
                    background: p === page ? '#14422D' : 'white',
                    cursor: 'pointer',
                    color: p === page ? 'white' : '#414943',
                    fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: p === page ? 700 : 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {p}
                </button>
              ))}

              {/* 次へ */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  width: 36, height: 36, borderRadius: 9999,
                  border: '1px rgba(192,201,193,0.50) solid',
                  background: page === totalPages ? '#F4F4F1' : 'white',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: page === totalPages ? '#C0C9C1' : '#14422D',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
