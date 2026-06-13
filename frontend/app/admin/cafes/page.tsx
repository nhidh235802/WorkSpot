'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, X, Wifi, Plug, Users, Coffee, Snowflake, Laptop, CigaretteOff, Clock } from 'lucide-react'
import { toast, Toaster } from 'sonner'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const PAGE_SIZE = 5

const removeAccents = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  approved: { label: '営業中',   dot: '#10B981', bg: '#D1FAE5', text: '#065F46' },
  hidden:   { label: '非表示',   dot: '#F97316', bg: '#FFEDD5', text: '#9A3412' },
  pending:  { label: '承認待ち', dot: '#3B82F6', bg: '#DBEAFE', text: '#1E40AF' },
  rejected: { label: '却下済み', dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
}

const FACILITY_LABEL: Record<string, string> = {
  wifi:           'Wi-Fi完備',
  socket:         '電源コンセントあり',
  workspace:      '作業スペース',
  desk:           '作業用デスク',
  snack:          '軽食あり',
  flexible_hours: '営業時間が柔軟',
  cleanliness:    '清潔な空間',
  smoking_rule:   '禁煙',
}

const FACILITY_ICONS: Record<string, React.ComponentType<any>> = {
  wifi: Wifi,
  socket: Plug,
  workspace: Users,
  desk: Laptop,
  snack: Coffee,
  cleanliness: Snowflake,
  smoking_rule: CigaretteOff,
  flexible_hours: Clock,
}

const STATUS_FILTER_OPTIONS = [
  { value: '',         label: 'ステータス (すべて)' },
  { value: 'approved', label: '営業中' },
  { value: 'hidden',   label: '非表示' },
  { value: 'rejected', label: '却下済み' },
]

// Danh sách quận Hà Nội với giá trị tìm kiếm là tiếng Việt không dấu
const HANOI_AREAS = [
  { value: 'Cau Giay', label: 'Cầu Giấy' },
  { value: 'Hoan Kiem', label: 'Hoàn Kiếm' },
  { value: 'Dong Da', label: 'Đống Đa' },
  { value: 'Hai Ba Trung', label: 'Hai Bà Trưng' },
  { value: 'Ba Dinh', label: 'Ba Đình' },
  { value: 'Thanh Xuan', label: 'Thanh Xuân' },
  { value: 'Long Bien', label: 'Long Biên' },
]

export default function AdminCafesPage() {
  const router = useRouter()
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

  // Trạng thái điều khiển Custom Modal ẩn cửa hàng
  const [hideTarget, setHideTarget] = useState<{ id: string; name: string } | null>(null)
  const [hideReason, setHideReason] = useState('')
  const [hideError, setHideError] = useState('')
  const [hasSubmittedHide, setHasSubmittedHide] = useState(false)

  // Lấy thống kê dashboard cafe
  useEffect(() => {
    AdminService.getStats().then(setStats).catch(() => {})
  }, [refreshKey])

  // Lấy danh sách cửa hàng kèm đồng bộ bộ lọc nâng cao
  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getCafesForAdmin({
      search:  search ? removeAccents(search) : undefined,
      status:  statusFilter || undefined,
      page,
      limit:   PAGE_SIZE,
    })
      .then((data) => {
        // Filter client-side by area, normalizing both sides
        let items = data.items
        if (areaFilter) {
          const normalizedFilter = removeAccents(areaFilter).toLowerCase()
          items = items.filter((c: any) => removeAccents(c.address || '').toLowerCase().includes(normalizedFilter))
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
  const handleToggleVisibility = async (id: string, currentName: string, currentStatus: string) => {
    if (currentStatus === 'hidden') {
      // Nếu đang ẩn -> hiện lại thì không cần nhập lý do
      toast.promise(AdminService.toggleCafeVisibility(id), {
        loading: `${currentName} の表示状態を更新中...`,
        success: () => {
          setRefreshKey((prev) => prev + 1)
          return `${currentName} の表示状態を更新しました。`
        },
        error: (err: any) => err.message || '操作に失敗しました'
      })
    } else {
      // Nếu đang hiện -> ẩn đi thì yêu cầu nhập lý do qua Pop-up
      setHideTarget({ id, name: currentName })
      setHideReason('')
      setHideError('')
      setHasSubmittedHide(false)
    }
  }

  const handleHideSubmit = async () => {
    setHasSubmittedHide(true)
    if (!hideReason.trim()) {
      setHideError('理由の入力は必須です。')
      return
    }
    if (hideReason.length > 500) {
      setHideError('理由は500文字以内で入力してください。')
      return
    }

    if (!hideTarget) return
    const { id, name } = hideTarget

    toast.promise(AdminService.toggleCafeVisibility(id, hideReason), {
      loading: `${name} の非表示処理を実行中...`,
      success: () => {
        setRefreshKey((prev) => prev + 1)
        setHideTarget(null)
        setHideReason('')
        setHideError('')
        setHasSubmittedHide(false)
        return `${name} を非表示にしました。`
      },
      error: (err: any) => err.message || '非表示処理に失敗しました'
    })
  }

  const handleCloseHideModal = () => {
    setHideTarget(null)
    setHideReason('')
    setHideError('')
    setHasSubmittedHide(false)
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
          alignSelf: 'stretch', paddingTop: 8, paddingBottom: 8, paddingLeft: 24, paddingRight: 24.02,
          borderBottom: '1px rgba(192, 201, 193, 0.10) solid', justifyContent: 'space-between',
          alignItems: 'center', display: 'flex'
        }}>
          <div style={{width: 297.98, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope', fontWeight: '500', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1, whiteSpace: 'nowrap'}}>店舗情報・雰囲気</div>
          </div>
          <div style={{width: 223.50, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope', fontWeight: '500', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1, whiteSpace: 'nowrap'}}>所在地・アメニティ</div>
          </div>
          <div style={{width: 149, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
            <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope', fontWeight: '500', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1, whiteSpace: 'nowrap'}}>稼働状況</div>
          </div>
          <div style={{width: 223.50, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', display: 'inline-flex'}}>
            <div style={{textAlign: 'right', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope', fontWeight: '500', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 1, whiteSpace: 'nowrap'}}>アクション</div>
          </div>
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
              <div key={cafe.id} style={{
                alignSelf: 'stretch', padding: 16, background: 'white', borderRadius: 12,
                outline: '1px rgba(192, 201, 193, 0.05) solid', outlineOffset: '-1px',
                justifyContent: 'space-between', alignItems: 'center', display: 'flex'
              }}>
                
                {/* Column 1: cafe info */}
                <div style={{ width: 297.98, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex' }}>
                  <div style={{ width: 56, height: 56, background: '#E7E5E4', overflow: 'hidden', borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
                    {cafe.avatar ? (
                      <img src={cafe.avatar.startsWith('http') ? cafe.avatar : `${API_URL}${cafe.avatar}`} alt={cafe.name} style={{ alignSelf: 'stretch', flex: '1 1 0', position: 'relative', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ alignSelf: 'stretch', flex: '1 1 0', background: '#14422D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700 }}>
                        {cafe.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex', minWidth: 0, flex: 1 }}>
                    <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
                      <div style={{ alignSelf: 'stretch', color: '#14422D', fontSize: 16, fontFamily: 'Manrope', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word' }}>
                        {cafe.name}
                      </div>
                    </div>
                    <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex' }}>
                      {tags.map((tag) => (
                        <div key={tag} style={{ alignSelf: 'stretch', paddingLeft: 8, paddingRight: 8, background: 'rgba(255, 219, 199, 0.50)', borderRadius: 9999, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
                          <div style={{ height: 14, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#311300', fontSize: 9, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '13.50px', wordWrap: 'break-word' }}>
                            {tag}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: location & owner */}
                <div style={{ width: 223.50, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex', minWidth: 0 }}>
                  <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
                    <div style={{ alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#1A1C19', fontSize: 12, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cafe.address}
                    </div>
                  </div>
                  {/* Facility Icons */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {(cafe.facilities ?? []).map((f) => {
                      const IconComponent = FACILITY_ICONS[f];
                      if (!IconComponent) return null;
                      return <IconComponent key={f} size={14} style={{ color: '#7F8181' }} />;
                    })}
                  </div>
                </div>

                {/* Column 3: status */}
                <div style={{ width: 149, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
                  <div style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 2, paddingBottom: 2, background: sc.bg, borderRadius: 9999, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex' }}>
                    <div style={{ width: 6, height: 6, background: sc.dot, borderRadius: 9999 }} />
                    <div style={{ height: 15, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: sc.text, fontSize: 10, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '15px', wordWrap: 'break-word' }}>
                      {sc.label}
                    </div>
                  </div>
                </div>

                {/* Column 4: action buttons */}
                {cafe.status === 'pending' ? (
                  <div style={{ width: 223.50, justifyContent: 'flex-end', alignItems: 'center', gap: 12, display: 'flex' }}>
                    <button type="button" onClick={() => router.push(`/admin/cafes/${cafe.id}`)} style={{ border: 'none', paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6, background: '#14422D', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 9999, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
                      <div style={{ width: 60.28, height: 16, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word' }}>詳細を表示</div>
                    </button>
                    <button onClick={() => handleApprove(cafe.id, cafe.name)} type="button" style={{ border: 'none', paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6, background: '#10B981', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 9999, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
                      <div style={{ width: 60.28, height: 16, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word' }}>承認</div>
                    </button>
                    <button onClick={() => setRejectTarget({ id: cafe.id, name: cafe.name })} type="button" style={{ border: 'none', paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6, background: '#EF4444', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 9999, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
                      <div style={{ width: 60.28, height: 16, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word' }}>却下</div>
                    </button>
                  </div>
                ) : (
                  <div style={{ width: 223.50, justifyContent: 'flex-end', alignItems: 'center', gap: 12, display: 'flex' }}>
                    <button type="button" onClick={() => router.push(`/admin/cafes/${cafe.id}`)} style={{ border: 'none', paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6, background: '#14422D', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 9999, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
                      <div style={{ width: 60.28, height: 16, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word' }}>詳細を表示</div>
                    </button>
                    {/* リジェクトされた店舗には非表示/再表示ボタンを表示しない */}
                    {cafe.status !== 'rejected' && (
                      <button onClick={() => handleToggleVisibility(cafe.id, cafe.name, cafe.status)} type="button" style={{ border: 'none', paddingLeft: 20, paddingRight: 20, paddingTop: 6, paddingBottom: 6, background: '#7F8181', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 9999, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
                        <div style={{ width: 60.28, height: 16, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Manrope', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word' }}>
                          {cafe.status === 'hidden' ? '再表示' : '非表示'}
                        </div>
                      </button>
                    )}
                  </div>
                )}
                
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

      {/* ── CUSTOM HIDE MODAL ── */}
      {hideTarget && (
        <div onClick={handleCloseHideModal} style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(26,28,25,0.25)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 500, maxWidth: '90vw', padding: 32, background: 'white', boxShadow: '0px 12px 40px rgba(26, 28, 25, 0.06)', borderRadius: 16, outline: '1px rgba(192, 201, 193, 0.10) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex' }}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                    <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#14422D', fontSize: 24, fontFamily: 'Alfa Slab One', fontWeight: '400', lineHeight: '32px', wordWrap: 'break-word'}}>非表示の理由</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                    <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#414943', fontSize: 14, fontFamily: 'Aleo', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>理由を教えてください</div>
                </div>
            </div>
            
            <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={hideReason}
                onChange={(e) => {
                  setHideReason(e.target.value)
                  if (e.target.value.trim() !== '') {
                    setHideError('')
                  }
                }}
                placeholder="理由を入力してください"
                style={{
                  alignSelf: 'stretch',
                  height: 160,
                  padding: 16,
                  background: '#F4F4EF',
                  border: hideError ? '1.5px solid #BA1A1A' : 'none',
                  borderRadius: 12,
                  outline: 'none',
                  resize: 'none',
                  fontSize: 16,
                  fontFamily: 'Acme',
                  fontWeight: '400',
                  lineHeight: '24px',
                  color: '#1A1C19',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minHeight: '20px' }}>
                {hideError ? (
                  <span style={{ color: '#BA1A1A', fontSize: 13, fontFamily: 'Aleo', fontWeight: 'bold' }}>
                    {hideError}
                  </span>
                ) : (
                  <span />
                )}
                <span style={{ color: hideReason.length > 500 ? '#BA1A1A' : '#A8A29E', fontSize: 12, fontFamily: 'Acme' }}>
                  {hideReason.length}/500
                </span>
              </div>
            </div>

            <div style={{alignSelf: 'stretch', paddingTop: 8, justifyContent: 'flex-end', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
                <button
                  type="button"
                  onClick={handleCloseHideModal}
                  style={{
                    paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10,
                    background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'
                  }}
                >
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#414943', fontSize: 14, fontFamily: 'WenQuanYi Zen Hei', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word'}}>キャンセル</div>
                </button>
                <button
                  type="button"
                  onClick={handleHideSubmit}
                  style={{
                    paddingLeft: 32, paddingRight: 32, paddingTop: 10, paddingBottom: 10,
                    position: 'relative', background: '#14422D', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'
                  }}
                >
                    <div style={{width: '100%', height: '100%', left: 0, top: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 4px 6px -4px rgba(20, 66, 45, 0.20), 0px 10px 15px -3px rgba(20, 66, 45, 0.20)', borderRadius: 9999}} />
                    <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 14, fontFamily: 'WenQuanYi Zen Hei', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word', position: 'relative', zIndex: 1}}>確認</div>
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
