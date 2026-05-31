'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { ChevronLeft, ChevronRight, X, CheckCircle2, AlertTriangle, Loader2, Wifi, Plug, Users, Laptop, Coffee, Snowflake, Eye } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const PAGE_SIZE = 5

const FACILITY_ICONS: Record<string, React.ComponentType<any>> = {
  wifi: Wifi,
  socket: Plug,
  workspace: Users,
  desk: Laptop,
  snack: Coffee,
  cleanliness: Snowflake,
}

function toAbsUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}${path}`
}

function formatJpDate(iso: string) {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  } catch { return iso }
}

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`
  if (diff < 172800) return '昨日'
  return `${Math.floor(diff / 86400)}日前`
}

interface RejectModal {
  cafeId: string
  cafeName: string
}

export default function AdminApprovalsPage() {
  const router = useRouter()
  const [cafes, setCafes] = useState<AdminCafeItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [approvedCount, setApprovedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  const [rejectModal, setRejectModal] = useState<RejectModal | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approveTarget, setApproveTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchData = () => {
    setLoading(true)
    setError(null)
    AdminService.getCafesForAdmin({ status: 'pending', page, limit: PAGE_SIZE })
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
  }

  const fetchStatsData = () => {
    AdminService.getStats().then((s) => setApprovedCount(s.activeCafes)).catch(() => { })
  }

  useEffect(() => {
    fetchStatsData()
  }, [])

  useEffect(() => { fetchData() }, [page])

  // ── CUSTOM TOAST DESIGN (APPLE-STYLE GLASSMORPHISM) ──────────────────
  const showCustomToast = (type: 'loading' | 'success' | 'error', message: string, toastId?: string | number) => {
    const config = {
      loading: { bg: 'rgba(255, 255, 255, 0.85)', text: '#414943', border: 'rgba(0,0,0,0.05)', icon: <Loader2 size={18} className="animate-spin" color="#14422D" /> },
      success: { bg: 'rgba(230, 244, 234, 0.90)', text: '#137333', border: 'rgba(16,185,129,0.15)', icon: <CheckCircle2 size={18} color="#10B981" /> },
      error: { bg: 'rgba(254, 226, 226, 0.90)', text: '#991B1B', border: 'rgba(239,68,68,0.15)', icon: <AlertTriangle size={18} color="#EF4444" /> }
    }[type]

    const toastContent = (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
        background: config.bg, borderRadius: 14, border: `1px solid ${config.border}`,
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0px 16px 32px rgba(26,28,25,0.08), 0px 4px 8px rgba(26,28,25,0.02)',
        width: 340, boxSizing: 'border-box'
      }}>
        {config.icon}
        <div style={{ color: config.text, fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '18px', flex: 1 }}>
          {message}
        </div>
      </div>
    )

    if (type === 'loading') {
      return toast.custom(() => toastContent, { duration: Infinity })
    } else {
      if (toastId) toast.dismiss(toastId)
      return toast.custom(() => toastContent, { duration: 3000 })
    }
  }

  // ── XỬ LÝ DUYỆT (THỰC THI QUA CUSTOM MODAL) ──────────────────────────
  const executeApprove = async () => {
    if (!approveTarget) return
    const { id, name } = approveTarget

    setApproveTarget(null)
    const toastId = showCustomToast('loading', `${name} の申請を承認しています...`)
    setActing(id)

    try {
      await AdminService.approveCafe(id)
      showCustomToast('success', `${name} の掲載申請を承認しました。`, toastId)
      fetchData()
      fetchStatsData()
    } catch (err: any) {
      console.error(err)
      showCustomToast('error', err.message || '承認処理に失敗しました。', toastId)
    } finally {
      setActing(null)
    }
  }

  const handleReject = (id: string, name: string) => {
    setRejectReason('')
    setRejectModal({ cafeId: id, cafeName: name })
  }

  // ── XỬ LÝ TỪ CHỐI (THỰC THI QUA CUSTOM MODAL) ────────────────────────
  const handleRejectConfirm = async () => {
    if (!rejectModal) return
    const { cafeId, cafeName } = rejectModal
    const finalReason = rejectReason.trim() || '申請内容に不備があります'

    setRejectModal(null)
    const toastId = showCustomToast('loading', `${cafeName} の却下処理を実行中...`)
    setActing(cafeId)

    try {
      await AdminService.rejectCafe(cafeId, finalReason)
      showCustomToast('success', `${cafeName} の申請を却下しました。`, toastId)
      fetchData()
      fetchStatsData()
    } catch (err: any) {
      console.error(err)
      showCustomToast('error', err.message || '却下処理に失敗しました。', toastId)
    } finally {
      setActing(null)
    }
  }

  const startRow = (page - 1) * PAGE_SIZE + 1
  const endRow = Math.min(page * PAGE_SIZE, total)

  const pageNumbers = (() => {
    const half = 2
    let start = Math.max(1, page - half)
    const end = Math.min(totalPages, start + 4)
    start = Math.max(1, end - 4)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  return (
    <div style={{ width: '100%', minHeight: '100%', background: '#FAFAF5', padding: 48, display: 'flex', flexDirection: 'column', gap: 48 }}>
      <Toaster position="top-right" toastOptions={{ style: { background: 'transparent', border: 'none', boxShadow: 'none' } }} />

      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ maxWidth: 672, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: '#14422D', fontSize: 48, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '48px' }}>
            情報の承認待ち
          </div>
          <div style={{ color: '#414943', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '29.25px' }}>
            ハノイで最高のワークフレンドリーな空間をキュレーション。オーナーから申請<br />
            された新規カフェ情報の審査を行ってください。
          </div>
        </div>

        {/* 未承認バッジ */}
        <div style={{
          paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12,
          background: '#F4F4EF', borderRadius: 9999,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 8, height: 8, background: '#904C18', borderRadius: 9999 }} />
          <span style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px', whiteSpace: 'nowrap' }}>
            {total}件の未承認リクエスト
          </span>
        </div>
      </div>

      {/* ── 統計カード ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingTop: 16 }}>
        {[
          { label: '承認済み店舗数', value: approvedCount ?? '—', bg: 'white', labelColor: '#414943', valueColor: '#14422D', outline: true },
          { label: '平均評価', value: '4.8', bg: 'white', labelColor: '#414943', valueColor: '#14422D', outline: true },
          { label: '平均承認待ち日数', value: '24日間', bg: '#FFDBC7', labelColor: '#733600', valueColor: '#311300', outline: false },
          { label: '処理効率', value: '98%', bg: '#2D5A43', labelColor: 'rgba(188,238,207,0.60)', valueColor: 'white', outline: false },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '32px 32px 34px',
            background: s.bg,
            boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
            borderRadius: 12,
            ...(s.outline ? { outline: '1px rgba(192,201,193,0.05) solid', outlineOffset: '-1px' } : {}),
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ color: s.labelColor, fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 1.2 }}>
              {s.label}
            </div>
            <div style={{ color: s.valueColor, fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '36px' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── テーブル ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 16 }}>

        {/* ヘッダー行 */}
        <div style={{
          paddingTop: 8, paddingBottom: 8, paddingLeft: 24, paddingRight: 24,
          borderBottom: '1px rgba(192,201,193,0.10) solid',
          display: 'grid', gridTemplateColumns: '293fr 220fr 147fr 220fr',
          alignItems: 'center',
        }}>
          {([
            { label: 'カフェ名 & 特徴', align: 'left' },
            { label: '所在地 & 設備', align: 'left' },
            { label: '申請日', align: 'center' },
            { label: 'アクション', align: 'right' },
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

        {/* エラー */}
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, color: '#BA1A1A', fontSize: 14, fontFamily: 'Manrope, sans-serif' }}>
            {error}
          </div>
        )}

        {/* データ */}
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>読み込み中...</div>
        ) : cafes.length === 0 ? (
          <div style={{ padding: 24, color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>現在、承認待ち의 申請はありません。</div>
        ) : (
          cafes.map((cafe) => {
            const img = toAbsUrl(cafe.avatar)
            const isActing = acting === cafe.id
            return (
              <div key={cafe.id} style={{
                padding: 24, background: 'white',
                boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
                borderRadius: 12,
                display: 'grid', gridTemplateColumns: '293fr 220fr 147fr 220fr',
                alignItems: 'center',
                opacity: isActing ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}>

                {/* カフェ名 & 特徴 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                    background: '#E7E5E4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {img
                      ? <img src={img} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>{cafe.name.charAt(0)}</span>
                    }
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      onClick={() => router.push(`/admin/approvals/details?id=${cafe.id}`)}
                      style={{
                        color: '#14422D', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '22.5px',
                        cursor: 'pointer', transition: 'text-decoration 0.15s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}
                    >
                      {cafe.name}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2,
                      background: 'rgba(20,66,45,0.10)', borderRadius: 9999,
                      alignSelf: 'flex-start',
                    }}>
                      <span style={{ color: '#14422D', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '15px' }}>
                        承認待ち
                      </span>
                    </div>
                  </div>
                </div>

                {/* 所在地 & 設備 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
                    {cafe.address}
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

                {/* 申請日 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '20px', textAlign: 'center' }}>
                    {formatJpDate(cafe.createdAt)}
                  </div>
                  <div style={{ color: '#A8A29E', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', lineHeight: '15px' }}>
                    {relativeTime(cafe.createdAt)}
                  </div>
                </div>

                {/* アクション */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleReject(cafe.id, cafe.name)}
                    disabled={isActing}
                    style={{
                      paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10,
                      background: '#E8E8E3', borderRadius: 9999, border: 'none',
                      cursor: isActing ? 'not-allowed' : 'pointer',
                      color: isActing ? '#A8A29E' : '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    却下
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproveTarget({ id: cafe.id, name: cafe.name })}
                    disabled={isActing}
                    style={{
                      paddingLeft: 28, paddingRight: 28, paddingTop: 10, paddingBottom: 10,
                      background: isActing ? '#7F8181' : '#14422D',
                      boxShadow: '0px 4px 6px -4px rgba(20,66,45,0.20), 0px 10px 15px -3px rgba(20,66,45,0.20)',
                      borderRadius: 9999, border: 'none',
                      cursor: isActing ? 'not-allowed' : 'pointer',
                      color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isActing ? '処理中...' : '承認'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── 却下モーダル ── */}
      {rejectModal && (
        <div
          onClick={() => setRejectModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(26,28,25,0.25)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 512, maxWidth: '90vw',
              padding: 32, background: 'white',
              boxShadow: '0px 24px 60px rgba(0,0,0,0.12)',
              borderRadius: 16,
              position: 'relative',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}
          >
            <button
              onClick={() => setRejectModal(null)}
              style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#717973' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 800, lineHeight: '32px' }}>
                却下理由の入力
              </div>
              <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                「{rejectModal.cafeName}」の申請を却下する理由をオーナーに通知します。
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="却下理由を入力してください（例: 写真が不鮮明、営業許可証の期限切れなど）"
              rows={5}
              style={{
                width: '100%', boxSizing: 'border-box',
                height: 160, padding: 16,
                background: '#F4F4EF', borderRadius: 12,
                border: 'none', outline: 'none', resize: 'none',
                color: '#1A1C19', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 400, lineHeight: '24px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                style={{
                  paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10,
                  background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer',
                  color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                style={{
                  paddingLeft: 32, paddingRight: 32, paddingTop: 10, paddingBottom: 10,
                  background: rejectReason.trim() ? '#BA1A1A' : '#7F8181',
                  boxShadow: rejectReason.trim() ? '0px 4px 12px rgba(186,26,26,0.20)' : 'none',
                  borderRadius: 9999, border: 'none',
                  cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                  color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '20px',
                  whiteSpace: 'nowrap',
                  opacity: rejectReason.trim() ? 1 : 0.5,
                }}
              >
                却下を確定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 承認確認カスタムモーダル ── */}
      {approveTarget && (
        <div
          onClick={() => setApproveTarget(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(26,28,25,0.30)', backdropFilter: 'blur(6px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 384, maxWidth: '90vw',
              background: 'white',
              boxShadow: '0px 25px 60px rgba(0,0,0,0.18)',
              borderRadius: 24,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              padding: 32,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}>
              {/* Icon */}
              <div style={{
                width: 56, height: 56,
                background: '#EAF2EC',
                borderRadius: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="#14422D" strokeWidth="1.5" />
                  <path d="M8.5 14L12.5 18L19.5 10" stroke="#14422D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Title */}
              <div style={{
                color: '#1A1C19',
                fontSize: 20,
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                lineHeight: '28px',
                textAlign: 'center',
              }}>
                承認の確認
              </div>

              {/* Description */}
              <div style={{
                color: '#414943',
                fontSize: 14,
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 400,
                lineHeight: '22px',
                textAlign: 'center',
              }}>
                この店舗の情報を承認し、システムに公開してもよろしいですか？
              </div>

              {/* Buttons */}
              <div style={{ paddingTop: 8, width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Approve button */}
                <button
                  type="button"
                  onClick={executeApprove}
                  style={{
                    width: '100%',
                    paddingTop: 14, paddingBottom: 14,
                    background: '#14422D',
                    borderRadius: 9999,
                    border: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: 14,
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 700,
                    lineHeight: '20px',
                    boxShadow: '0px 4px 6px -4px rgba(45,90,67,0.20), 0px 10px 15px -3px rgba(45,90,67,0.20)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#1E5C3A' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#14422D' }}
                >
                  承認する
                </button>

                {/* Cancel button */}
                <div style={{ paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setApproveTarget(null)}
                    style={{
                      width: '100%',
                      paddingTop: 12, paddingBottom: 12,
                      background: 'white',
                      borderRadius: 9999,
                      border: 'none',
                      cursor: 'pointer',
                      color: '#414943',
                      fontSize: 14,
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 500,
                      lineHeight: '20px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'white' }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ページネーション ── */}
      {!loading && totalPages > 1 && (
        <div style={{
          padding: 24, background: '#F4F4EF', borderRadius: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
            全 {total}件中 {startRow}-{endRow}件のリクエストを表示中
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: 'white', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: page === 1 ? '#C0C9C1' : '#14422D',
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  width: 40, height: 40, borderRadius: 9999,
                  background: p === page ? '#14422D' : 'white',
                  boxShadow: p === page
                    ? '0px 2px 4px -2px rgba(0,0,0,0.10), 0px 4px 6px -1px rgba(0,0,0,0.10)'
                    : '0px 1px 2px rgba(0,0,0,0.05)',
                  border: 'none', cursor: 'pointer',
                  color: p === page ? 'white' : '#14422D',
                  fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: p === page ? 700 : 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: 'white', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                border: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: page === totalPages ? '#C0C9C1' : '#14422D',
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}