'use client'

import React, { useEffect, useState } from 'react'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const PAGE_SIZE = 5

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  approved: { label: '営業中',   dot: '#10B981', bg: '#D1FAE5', text: '#065F46' },
  hidden:   { label: '非表示',   dot: '#F97316', bg: '#FFEDD5', text: '#9A3412' },
  pending:  { label: '承認待ち', dot: '#3B82F6', bg: '#DBEAFE', text: '#1E40AF' },
  rejected: { label: '却下済み', dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
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
  { value: 'rejected', label: '却下済み' },
]

// Bổ sung danh sách khu vực thực tế tại Hà Nội phục vụ bộ lọc công công
const HANOI_AREAS = [
  { value: 'Cầu Giấy', label: 'Cầu Giấy' },
  { value: 'Hoàn Kiếm', label: 'Hoàn Kiếm' },
  { value: 'Đống Đa', label: 'Đống Đa' },
  { value: 'Hai Bà Trưng', label: 'Hai Bà Trưng' },
  { value: 'Ba Đình', label: 'Ba Đình' },
  { value: 'Thanh Xuân', label: 'Thanh Xuân' },
  { value: 'Long Biên', label: 'Long Biên' },
]

export default function AdminCafesPage() {
  const [cafes, setCafes]           = useState<AdminCafeItem[]>([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]             = useState(1)
  const [stats, setStats]           = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [areaFilter, setAreaFilter]     = useState('') // Bổ sung lọc theo khu vực
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Trạng thái điều khiển Custom Modal từ chối cửa hàng vi phạm
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null)
  const [rejectionInput, setRejectionInput] = useState('')

  // Lấy thống kê dashboard cafe
  useEffect(() => {
    AdminService.getStats().then(setStats).catch(() => {})
  }, [refreshKey])

  // Lấy danh sách cửa hàng kèm đồng bộ bộ lọc nâng cao
  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getCafesForAdmin({
      search:  search || undefined,
      status:  statusFilter || undefined,
      // Bổ sung truyền trường vùng miền nếu hàm getCafesForAdmin có hỗ trợ filter tổng quát
      page,
      limit:   PAGE_SIZE,
    })
      .then((data) => {
        // Hỗ trợ xử lý lọc client-side cho thuộc tính khu vực nếu API chưa kịp cập nhật trường area
        let items = data.items
        if (areaFilter) {
          items = items.filter((c: any) => c.address?.includes(areaFilter))
        }
        setCafes(items)
        setTotal(areaFilter ? items.length : data.total)
        setTotalPages(areaFilter ? Math.ceil(items.length / PAGE_SIZE) : data.totalPages)
      })
      .catch((err) => {
        console.error(err)
        const errMsg = err.message || 'データを読み込めませんでした'
        setError(errMsg)
        toast.error(`データ取得失敗: ${errMsg}`)
      })
      .finally(() => setLoading(false))
  }, [statusFilter, areaFilter, search, page, refreshKey])

  const handleStatusFilter = (v: string) => { setStatusFilter(v); setPage(1) }
  const handleAreaFilter   = (v: string) => { setAreaFilter(v); setPage(1) }
  const handleSearch       = (v: string) => { setSearch(v);       setPage(1) }

  // 1. Thao tác Ẩn / Hiện quán cà phê đã được duyệt công khai
  const handleToggleVisibility = async (id: string, currentName: string) => {
    toast.promise(AdminService.toggleCafeVisibility(id), {
      loading: `${currentName} の表示状態を更新中...`,
      success: () => {
        setRefreshKey((prev) => prev + 1)
        return `${currentName} の表示状態を更新しました。`
      },
      error: (err: any) => err.message || '操作に失敗しました'
    })
  }

  // 2. Luồng thao tác Duyệt đồng ý hoạt động cho cơ sở đăng ký mới
  const handleApprove = async (id: string, cafeName: string) => {
    if (!window.confirm(`「${cafeName}」の掲載申請を承認しますか？`)) return

    toast.promise(AdminService.approveCafe(id), {
      loading: `${cafeName} を承認しています...`,
      success: () => {
        setRefreshKey((prev) => prev + 1)
        return `${cafeName} の申請を承認しました。店舗が公開されました。`
      },
      error: (err: any) => err.message || '承認処理に失敗しました'
    })
  }

  // 3. Luồng thao tác Từ chối đơn đăng ký kèm lý do hệ thống
  const handleRejectSubmit = async () => {
    if (!rejectTarget || !rejectionInput.trim()) return

    const { id, name } = rejectTarget

    toast.promise(AdminService.rejectCafe(id, rejectionInput), {
      loading: `${name} の却下処理を実行中...`,
      success: () => {
        setRefreshKey((prev) => prev + 1)
        setRejectTarget(null)
        setRejectionInput('')
        return `${name} の申請を却下しました。`
      },
      error: (err: any) => err.message || '却下処理に失敗しました'
    })
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', background: '#FAFAF5', padding: 48, display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Toaster position="top-right" richColors closeButton />

      {/* ── ヘッダー + 検索 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <div style={{ color: '#14422D', fontSize: 48, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '48px', marginBottom: 16 }}>
            既存店舗管理
          </div>
          <div style={{ color: '#414943', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '29.25px' }}>
            ハノイ市内の登録済みワークスペースの管理。新規店舗の承認、掲載状態の切り替え、稼働状況の監視が可能です。
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
            {/* Đã đồng bộ sự kiện kết nối cho bộ lọc khu vực Hà Nội */}
            <select
              value={areaFilter}
              onChange={(e) => handleAreaFilter(e.target.value)}
              style={{
                width: 175, height: 46, paddingLeft: 21, paddingRight: 36,
                background: 'white', borderRadius: 9999, border: 'none',
                boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                outline: '1px rgba(192,201,193,0.30) solid', outlineOffset: '-1px',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="">エリア (すべて)</option>
              {HANOI_AREAS.map((area) => (
                <option key={area.value} value={area.value}>{area.label}</option>
              ))}
            </select>

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
        <div style={{
          paddingTop: 8, paddingBottom: 8, paddingLeft: 24, paddingRight: 24,
          borderBottom: '1px rgba(192,201,193,0.10) solid',
          display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.2fr 2.3fr',
          alignItems: 'center', gap: 16,
        }}>
          {([
            { label: '店舗情報・雰囲気', align: 'left'   },
            { label: '所在地・アメニティ', align: 'left' },
            { label: '稼働状況',          align: 'center' },
            { label: 'アクション',         align: 'right'  },
          ] as const).map((h) => (
            <div key={h.label} style={{ color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1, textAlign: h.align }}>
              {h.label}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>読み込み中...</div>
        ) : error ? (
          <div style={{ padding: 24, color: '#BA1A1A', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>{error}</div>
        ) : cafes.length === 0 ? (
          <div style={{ padding: 24, color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>該当する店舗がありません。</div>
        ) : (
          cafes.map((cafe) => {
            const sc  = STATUS_CONFIG[cafe.status] || STATUS_CONFIG['approved']
            const tags = (cafe.facilities ?? []).slice(0, 2).map((f) => FACILITY_LABEL[f] ?? f)

            return (
              <div key={cafe.id} style={{ padding: 16, background: 'white', borderRadius: 12, boxShadow: '0px 2px 8px rgba(0,0,0,0.02)', display: 'grid', gridTemplateColumns: '2.5fr 2fr 1.2fr 2.3fr', alignItems: 'center', gap: 16 }}>
                
                {/* Cột 1: Thông tin quán */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: '#14422D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cafe.avatar ? (
                      <img src={cafe.avatar.startsWith('http') ? cafe.avatar : `${API_URL}${cafe.avatar}`} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{cafe.name.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                    <div style={{ color: '#14422D', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cafe.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {tags.map((tag) => (
                        <span key={tag} style={{ paddingLeft: 8, paddingRight: 8, background: 'rgba(255,219,199,0.50)', borderRadius: 9999, color: '#311300', fontSize: 9, fontWeight: 500, lineHeight: '18px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cột 2: Địa chỉ & Chủ sở hữu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <div style={{ color: '#1A1C19', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cafe.address}
                  </div>
                  {cafe.owner && (
                    <div style={{ color: 'rgba(65,73,67,0.70)', fontSize: 11 }}>
                      オーナー: {cafe.owner.fullName}
                    </div>
                  )}
                </div>

                {/* Cột 3: Trạng thái duyệt */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, background: sc.bg, borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, background: sc.dot, borderRadius: 9999 }} />
                    <span style={{ color: sc.text, fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap' }}>{sc.label}</span>
                  </div>
                </div>

                {/* Cột 4: Tổ hợp nút hành động phân tách logic nâng cao */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6, background: '#14422D', borderRadius: 9999, border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 500 }}>
                    詳細
                  </button>

                  {cafe.status === 'pending' ? (
                    // NẾU LÀ QUÁN CHỜ DUYỆT: Hiện cụm nút Duyệt và Từ chối
                    <>
                      <button onClick={() => handleApprove(cafe.id, cafe.name)} type="button" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6, background: '#10B981', borderRadius: 9999, border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 600 }}>
                        承認
                      </button>
                      <button onClick={() => setRejectTarget({ id: cafe.id, name: cafe.name })} type="button" style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6, background: '#EF4444', borderRadius: 9999, border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 600 }}>
                        却下
                      </button>
                    </>
                  ) : (
                    // NẾU LÀ QUÁN ĐÃ DUYỆT HOẶC ĐANG ẨN: Hiện nút Ẩn/Hiện thông thường
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(cafe.id, cafe.name)}
                      style={{
                        paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6,
                        background: cafe.status === 'hidden' ? '#065F46' : '#7F8181',
                        borderRadius: 9999, border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap'
                      }}
                    >
                      {cafe.status === 'hidden' ? '再表示' : '非表示'}
                    </button>
                  )}
                </div>

              </div>
            )
          })
        )}

        {/* ── ページネーション ── */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
            <div style={{ color: '#414943', fontSize: 13, fontWeight: 500 }}>
              {total} 件中 {(page - 1) * PAGE_SIZE + 1}〜{Math.min(page * PAGE_SIZE, total)} 件表示
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ width: 36, height: 36, borderRadius: 9999, border: '1px rgba(192,201,193,0.50) solid', background: page === 1 ? '#F4F4F1' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#C0C9C1' : '#14422D' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} type="button" onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 9999, border: p === page ? 'none' : '1px rgba(192,201,193,0.50) solid', background: p === page ? '#14422D' : 'white', cursor: 'pointer', color: p === page ? 'white' : '#414943', fontSize: 13, fontWeight: p === page ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p}
                </button>
              ))}
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ width: 36, height: 36, borderRadius: 9999, border: '1px rgba(192,201,193,0.50) solid', background: page === totalPages ? '#F4F4F1' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#C0C9C1' : '#14422D' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CUSTOM REJECT MODAL (APPLE STYLE) ── */}
      {rejectTarget && (
        <div onClick={() => setRejectTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(26,28,25,0.25)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: '90vw', background: 'white', boxShadow: '0px 24px 60px rgba(0,0,0,0.12)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
            <button onClick={() => setRejectTarget(null)} style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#717973' }}><X size={18} /></button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#1A1C19', fontSize: 20, fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>掲載申請の却下</div>
              <div style={{ color: '#414943', fontSize: 14, lineHeight: '22px' }}>
                「{rejectTarget.name}」の申請を却下する理由を入力してください。この理由は店舗オーナーに通知されます。
              </div>
            </div>
            <textarea
              value={rejectionInput}
              onChange={(e) => setRejectionInput(e.target.value)}
              placeholder="例: 店舗の外観写真が不鮮明です。ライセンスの住所と一致しません。"
              style={{ width: '100%', height: 100, boxSizing: 'border-box', padding: 12, background: '#F4F4EF', border: 'none', borderRadius: 8, outline: 'none', resize: 'none', fontSize: 14, fontFamily: 'sans-serif' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setRejectTarget(null)} style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10, background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer', color: '#1A1C19', fontSize: 14 }}>キャンセル</button>
              <button type="button" onClick={handleRejectSubmit} disabled={!rejectionInput.trim()} style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10, background: '#EF4444', borderRadius: 9999, border: 'none', cursor: rejectionInput.trim() ? 'pointer' : 'not-allowed', color: 'white', fontSize: 14, fontWeight: 600, opacity: rejectionInput.trim() ? 1 : 0.5 }}>却下する</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}