'use client'

import React, { useEffect, useState } from 'react'
import { AdminService, AdminUser } from '@/services/admin.service'
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

const PAGE_SIZE = 10

const removeAccents = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd').replace(/\u0110/g, 'D');

const ROLE_CONFIG: Record<string, { label: string; avatarBg: string; avatarText: string }> = {
  admin:    { label: '管理者',       avatarBg: '#BCEECF', avatarText: '#14422D' },
  owner:    { label: 'オーナー',     avatarBg: '#FFDBC7', avatarText: '#904C18' },
  customer: { label: '一般ユーザー', avatarBg: '#FFDBC7', avatarText: '#904C18' },
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  active:    { label: '有効', bg: '#D1FAE5', dot: '#10B981', text: '#065F46' },
  disabled:  { label: '無効', bg: '#FFEDD5', dot: '#F97316', text: '#9A3412' },
  suspended: { label: '停止', bg: '#FEE2E2', dot: '#EF4444', text: '#991B1B' },
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}/${m}/${day} ${h}:${min}`
  } catch {
    return iso
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? parts[parts.length - 1].slice(0, 2) : name.slice(0, 2)
}

export default function AdminAccountPage() {
  const [users, setUsers]         = useState<AdminUser[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [totalAccounts, setTotalAccounts] = useState<number | null>(null)

  const [nameInput, setNameInput]   = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [roleInput, setRoleInput]   = useState('')

  const [appliedName, setAppliedName]   = useState('')
  const [appliedEmail, setAppliedEmail] = useState('')
  const [appliedRole, setAppliedRole]   = useState('')
  const [statusInput, setStatusInput]   = useState('')
  const [appliedStatus, setAppliedStatus] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // STATE ĐỂ ĐIỀU KHIỂN HỘP THOẠI XÁC NHẬN TÙY CHỈNH CAO CẤP
  const [confirmTarget, setConfirmTarget] = useState<{ userId: string; userName: string; status: 'active' | 'disabled' | 'suspended' } | null>(null)

  // STATE CHO MODAL NHẬP LÝ DO VÔ HIỆU HÓA
  const [disableTarget, setDisableTarget] = useState<{ userId: string; userName: string; userRole: string } | null>(null)
  const [disableReason, setDisableReason] = useState('')
  const [disableReasonError, setDisableReasonError] = useState('')
  const [hasSubmittedDisable, setHasSubmittedDisable] = useState(false)

  const fetchStats = () => {
    AdminService.getStats()
      .then((s) => setTotalAccounts(s.totalAccounts))
      .catch((err) => {
        console.error('統計データの取得に失敗しました:', err)
        setError('ダッシュボードの統計データを読み込めませんでした。')
      })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    AdminService.getUsers({
      name:   appliedName   || undefined,
      email:  appliedEmail  || undefined,
      role:   appliedRole   || undefined,
      status: appliedStatus || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        setUsers(data.items)
        setTotal(data.total)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'ユーザーデータの読み込みに失敗しました。')
      })
      .finally(() => setLoading(false))
  }, [appliedName, appliedEmail, appliedRole, appliedStatus, page])

  const handleSearch = () => {
    setAppliedName(removeAccents(nameInput))
    setAppliedEmail(emailInput)
    setAppliedRole(roleInput)
    setAppliedStatus(statusInput)
    setPage(1)
  }

  // Hàm thực thi cập nhật thực tế sau khi nhấn Xác nhận trong Custom Modal
  const executeUpdateStatus = async (reason?: string) => {
    if (!confirmTarget) return

    const { userId, status } = confirmTarget

    try {
      setError(null)
      await AdminService.updateUserStatus(userId, status, reason)
      
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, status: status } : user))
      )
      
      if (status === 'active') toast.success('アカウントを正常に有効化しました。')
      if (status === 'disabled') toast.success('アカウントを正常に無効化しました。')
      if (status === 'suspended') toast.success('アカウントを正常に利用停止しました。')

      fetchStats()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'ステータスの更新に失敗しました。')
      setError(err.message || 'ステータスの更新に失敗しました。')
    } finally {
      setConfirmTarget(null)
    }
  }

  // Hàm xử lý submit disable modal (có lý do)
  const handleDisableSubmit = async () => {
    setHasSubmittedDisable(true)
    if (!disableReason.trim()) {
      setDisableReasonError('理由の入力は必須です。')
      return
    }
    if (disableReason.length > 500) {
      setDisableReasonError('理由は500文字以内で入力してください。')
      return
    }
    if (!disableTarget) return

    const { userId, userName, userRole } = disableTarget

    try {
      setError(null)
      // Vô hiệu hóa tài khoản với lý do
      await AdminService.updateUserStatus(userId, 'disabled', disableReason)
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, status: 'disabled' } : user))
      )
      toast.success(`${userName} のアカウントを無効化しました。`)

      // Nếu là owner → ẩn tất cả quán của owner đó
      if (userRole === 'owner') {
        try {
          await AdminService.disableOwnerCafes(userId, disableReason)
          toast.success(`${userName} の店舗もあわせて非表示にしました。`)
        } catch (cafeErr: any) {
          toast.error('店舗の非表示処理に失敗しました: ' + (cafeErr.message || ''))
        }
      }

      fetchStats()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || '無効化処理に失敗しました。')
      setError(err.message || '無効化処理に失敗しました。')
    } finally {
      setDisableTarget(null)
      setDisableReason('')
      setDisableReasonError('')
      setHasSubmittedDisable(false)
    }
  }

  const handleCloseDisableModal = () => {
    setDisableTarget(null)
    setDisableReason('')
    setDisableReasonError('')
    setHasSubmittedDisable(false)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const startRow   = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endRow     = Math.min(page * PAGE_SIZE, total)

  const activeCount = users.filter((u) => u.status === 'active' || !u.status).length
  const disabledCount = users.filter((u) => u.status === 'disabled').length
  const suspendedCount = users.filter((u) => u.status === 'suspended').length

  const pageNumbers = (() => {
    const half  = 2
    let start   = Math.max(1, page - half)
    const end   = Math.min(totalPages, start + 4)
    start       = Math.max(1, end - 4)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })()

  // Hàm chuyển đổi nội dung tiêu đề thông báo trong Custom Modal
  const getConfirmModalTitle = () => {
    if (!confirmTarget) return ''
    if (confirmTarget.status === 'active') return 'アカウントの有効化'
    if (confirmTarget.status === 'disabled') return 'アカウントの無効化'
    return 'アカウントの利用停止'
  }

  // Hàm chuyển đổi văn bản nội dung câu hỏi trong Custom Modal
  const getConfirmModalBody = () => {
    if (!confirmTarget) return ''
    const name = confirmTarget.userName
    if (confirmTarget.status === 'active') return `本当に「${name}」のアカウント制限を解除し、有効化しますか？`
    if (confirmTarget.status === 'disabled') return `本当に「${name}」のアカウントを無効化しますか？`
    return `本当に「${name}」のアカウントを制限（利用停止）しますか？この操作によりユーザーは即座にログアウトされます。`
  }

  return (
    <div style={{ width: '100%', minHeight: '100%', background: '#FAFAF5', paddingTop: 32, paddingBottom: 40, paddingLeft: 32, paddingRight: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ color: '#14422D', fontSize: 36, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '40px' }}>
          アカウント管理
        </div>
        <div style={{ color: '#414943', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
          ユーザーアカウントの権限管理とステータスの監視を行います。
        </div>
      </div>

      {/* ── TOAST THÔNG BÁO THÀNH CÔNG ── */}


      {/* ── エラーアラート通知 ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px',
          background: '#FFDADA', borderRadius: 12, border: '1px solid rgba(186,26,26,0.2)',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.02)'
        }}>
          <AlertCircle size={20} color="#BA1A1A" style={{ flexShrink: 0 }} />
          <div style={{ color: '#350F12', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
            {error}
          </div>
        </div>
      )}

      {/* ── 統計カード ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingTop: 16 }}>
        {[
          { label: '全アカウント数',   value: totalAccounts ?? '—', bg: 'white',   labelColor: '#414943', valueColor: '#14422D' },
          { label: '有効アカウント',   value: total ? activeCount : '—', bg: '#BCEECF', labelColor: '#224F39', valueColor: '#002112' },
          { label: '無効アカウント',   value: total ? disabledCount : 0, bg: '#FFDBC7', labelColor: '#733600', valueColor: '#311300' },
          { label: '停止中アカウント', value: total ? suspendedCount : 0, bg: '#FFDADA', labelColor: '#69393B', valueColor: '#350F12' },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '32px 32px 34px',
            background: s.bg,
            boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
            borderRadius: 12,
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

      {/* ── 検索フォーム ── */}
      <div style={{ background: '#F4F4EF', borderRadius: 12, paddingTop: 48, paddingBottom: 32, paddingLeft: 32, paddingRight: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px', paddingLeft: 4 }}>
              名前
            </label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="例: 山田 太郎"
              style={{
                paddingTop: 13, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
                background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px', paddingLeft: 4 }}>
              メールアドレス
            </label>
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="example@workspot.jp"
              style={{
                paddingTop: 13, paddingBottom: 12, paddingLeft: 16, paddingRight: 16,
                background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400,
                width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px', paddingLeft: 4 }}>
              ロール
            </label>
            <select
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              style={{
                paddingTop: 11, paddingBottom: 11, paddingLeft: 16, paddingRight: 36,
                background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="">全てのロール</option>
              <option value="owner">オーナー</option>
              <option value="customer">一般ユーザー</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px', paddingLeft: 4 }}>
              ステータス
            </label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              style={{
                paddingTop: 11, paddingBottom: 11, paddingLeft: 16, paddingRight: 36,
                background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
                color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="">全てのステータス</option>
              <option value="active">有効</option>
              <option value="disabled">無効</option>
              <option value="suspended">停止</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleSearch}
            style={{
              paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12,
              background: 'linear-gradient(171deg, #14422D 0%, #2D5A43 100%)',
              borderRadius: 9999, border: 'none', cursor: 'pointer',
              boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.10), 0px 10px 15px -3px rgba(0,0,0,0.10)',
              color: 'white', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px',
            }}
          >
            検索
          </button>
        </div>
      </div>

      {/* ── テーブル ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>

        <div style={{
          paddingLeft: 24, paddingRight: 24, paddingTop: 8, paddingBottom: 8,
          display: 'grid', gridTemplateColumns: '228fr 152fr 152fr 152fr 228fr',
          alignItems: 'center',
        }}>
          {([
            { label: 'ユーザー情報', align: 'left'   },
            { label: 'ロール',       align: 'left'   },
            { label: 'ステータス',   align: 'left'   },
            { label: '最終ログイン', align: 'center' },
            { label: '操作',         align: 'right'  },
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

        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>読み込み中...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 24, color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>該当するアカウントがありません。</div>
        ) : (
          users.map((user) => {
            const rc = ROLE_CONFIG[user.role] ?? { label: user.role, avatarBg: '#E3E3DE', avatarText: '#717973' }
            const sc = STATUS_CONFIG[user.status || 'active'] || STATUS_CONFIG.active

            return (
              <div key={user.id} style={{
                padding: 24, background: 'white',
                boxShadow: '0px 12px 40px rgba(26,28,25,0.06)',
                borderRadius: 12, outline: '1px rgba(192,201,193,0.05) solid', outlineOffset: '-1px',
                display: 'grid', gridTemplateColumns: '228fr 152fr 152fr 152fr 228fr',
                alignItems: 'center',
              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.fullName}
                      style={{ width: 48, height: 48, borderRadius: 9999, objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none' }}
                    />
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: 9999, flexShrink: 0,
                      background: rc.avatarBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: rc.avatarText, fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                    }}>
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.fullName}
                    </div>
                    <div style={{ color: '#414943', fontSize: 12, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 3, paddingBottom: 3,
                    background: '#E3E3DE', borderRadius: 9999,
                    color: '#414943', fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                    textTransform: 'uppercase', lineHeight: '15px', whiteSpace: 'nowrap',
                  }}>
                    {rc.label}
                  </span>
                </div>

                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4,
                    background: sc.bg, borderRadius: 9999,
                  }}>
                    <div style={{ width: 6, height: 6, background: sc.dot, borderRadius: 9999 }} />
                    <span style={{ color: sc.text, fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '15px' }}>
                      {sc.label}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', color: '#414943', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  {formatDate(user.createdAt)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setDetailUser(user)}
                    style={{
                      paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 9,
                      background: '#14422D', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                      borderRadius: 9999, border: 'none', cursor: 'pointer',
                      color: 'white', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    詳細
                  </button>

                  {/* NÚT VÔ HIỆU HÓA → MỞ MODAL NHẬP LÝ DO */}
                  {user.status && user.status !== 'active' ? (
                    <button
                      type="button"
                      onClick={() => setConfirmTarget({ userId: user.id, userName: user.fullName, status: 'active' })}
                      style={{
                        paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8,
                        background: '#BCEECF', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        color: '#14422D', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '16px',
                        whiteSpace: 'nowrap', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#A7DFBB' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#BCEECF' }}
                    >
                      有効化
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDisableTarget({ userId: user.id, userName: user.fullName, userRole: user.role })}
                      style={{
                        paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8,
                        background: 'transparent', borderRadius: 9999,
                        border: 'none', outline: '1px #717973 solid', outlineOffset: '-1px',
                        cursor: 'pointer', color: '#414943', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      無効化
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── ユーザー詳細モーダル ── */}
      {detailUser && (() => {
        const rc = ROLE_CONFIG[detailUser.role] ?? { label: detailUser.role, avatarBg: '#E3E3DE', avatarText: '#717973' }
        const sc = STATUS_CONFIG[detailUser.status || 'active'] || STATUS_CONFIG.active

        return (
          <div
            onClick={() => setDetailUser(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(2px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 512, maxWidth: '90vw', background: 'white',
                boxShadow: '0px 12px 40px rgba(26,28,25,0.06)', borderRadius: 16,
                outline: '1px rgba(192,201,193,0.10) solid', outlineOffset: '-1px',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{
                background: 'linear-gradient(171deg, #14422D 0%, #2D5A43 100%)',
                padding: '32px 32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              }}>
                {detailUser.avatar ? (
                  <img 
                    src={detailUser.avatar} 
                    alt={detailUser.fullName}
                    style={{ width: 80, height: 80, borderRadius: 9999, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: 9999,
                    background: rc.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: rc.avatarText, fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, flexShrink: 0,
                  }}>
                    {getInitials(detailUser.fullName)}
                  </div>
                )}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: 'white', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                    {detailUser.fullName}
                  </div>
                  <div style={{ color: 'rgba(188,238,207,0.80)', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400 }}>
                    {detailUser.email}
                  </div>
                </div>
                <div style={{
                  paddingLeft: 16, paddingRight: 16, paddingTop: 4, paddingBottom: 4,
                  background: 'rgba(255,255,255,0.15)', borderRadius: 9999,
                  color: 'white', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>
                  {rc.label}
                </div>
              </div>

              <div style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 16, paddingBottom: 16, borderBottom: '1px rgba(192,201,193,0.20) solid',
                }}>
                  <span style={{ color: '#A8A29E', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                    アカウントステータス
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, background: sc.bg, borderRadius: 9999 }}>
                    <div style={{ width: 6, height: 6, background: sc.dot, borderRadius: 9999 }} />
                    <span style={{ color: sc.text, fontSize: 10, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>{sc.label}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 16, paddingBottom: 16, borderBottom: '1px rgba(192,201,193,0.20) solid',
                }}>
                  <span style={{ color: '#A8A29E', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                    登録日
                  </span>
                  <span style={{ color: '#414943', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400 }}>
                    {formatDate(detailUser.createdAt)}
                  </span>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 16, paddingBottom: 16, borderBottom: '1px rgba(192,201,193,0.20) solid',
                }}>
                  <span style={{ color: '#A8A29E', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                    最終ログイン
                  </span>
                  <span style={{ color: '#414943', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400 }}>
                    {formatDate(detailUser.createdAt)}
                  </span>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 16, paddingBottom: 16,
                }}>
                  <span style={{ color: '#A8A29E', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                    ユーザーID
                  </span>
                  <span style={{ color: '#A8A29E', fontSize: 12, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {detailUser.id}
                  </span>
                </div>

                <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setDetailUser(null)}
                    style={{
                      paddingLeft: 32, paddingRight: 32, paddingTop: 12, paddingBottom: 12,
                      background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer',
                      color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#D8D8D3' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#E8E8E3' }}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {confirmTarget && (
        <div
          onClick={() => setConfirmTarget(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(26,28,25,0.25)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 440, maxWidth: '90vw', background: 'white',
              boxShadow: '0px 24px 60px rgba(0,0,0,0.12)', borderRadius: 16,
              padding: 32, display: 'flex', flexDirection: 'column', gap: 24,
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setConfirmTarget(null)}
              style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#717973' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#1A1C19', fontSize: 20, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '28px' }}>
                {getConfirmModalTitle()}
              </div>
              <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 400, lineHeight: '22px' }}>
                {getConfirmModalBody()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                style={{
                  paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10,
                  background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer',
                  color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#D8D8D3' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#E8E8E3' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => executeUpdateStatus()}
                style={{
                  paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10,
                  background: confirmTarget.status === 'active' ? '#14422D' : '#BA1A1A',
                  borderRadius: 9999, border: 'none', cursor: 'pointer',
                  color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 600,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => { 
                  (e.currentTarget as HTMLElement).style.background = confirmTarget.status === 'active' ? '#2D5A43' : '#93000A' 
                }}
                onMouseLeave={(e) => { 
                  (e.currentTarget as HTMLElement).style.background = confirmTarget.status === 'active' ? '#14422D' : '#BA1A1A' 
                }}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NHẬP LÝ DO VÔ HIỆU HÓA TÀI KHOẢN ── */}
      {disableTarget && (
        <div
          onClick={handleCloseDisableModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(26,28,25,0.25)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 500, maxWidth: '90vw', padding: 32, background: 'white',
              boxShadow: '0px 12px 40px rgba(26,28,25,0.06)', borderRadius: 16,
              outline: '1px rgba(192,201,193,0.10) solid', outlineOffset: '-1px',
              display: 'flex', flexDirection: 'column', gap: 24,
            }}
          >
            {/* Tiêu đề */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                アカウント無効化の理由
              </div>
              <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                「{disableTarget.userName}」のアカウントを無効化する理由を入力してください。
                {disableTarget.userRole === 'owner' && (
                  <span style={{ display: 'block', marginTop: 6, color: '#F97316', fontWeight: 500 }}>
                    ⚠ このオーナーの店舗もあわせて非表示になります。
                  </span>
                )}
              </div>
            </div>

            {/* Textarea lý do */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={disableReason}
                onChange={(e) => {
                  setDisableReason(e.target.value)
                  if (e.target.value.trim() !== '') setDisableReasonError('')
                }}
                placeholder="理由を入力してください"
                style={{
                  alignSelf: 'stretch',
                  height: 160,
                  padding: 16,
                  background: '#F4F4EF',
                  border: disableReasonError ? '1.5px solid #BA1A1A' : 'none',
                  borderRadius: 12,
                  outline: 'none',
                  resize: 'none',
                  fontSize: 15,
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: '#1A1C19',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 }}>
                {disableReasonError ? (
                  <span style={{ color: '#BA1A1A', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>
                    {disableReasonError}
                  </span>
                ) : <span />}
                <span style={{ color: disableReason.length > 500 ? '#BA1A1A' : '#A8A29E', fontSize: 12, fontFamily: 'Manrope, sans-serif' }}>
                  {disableReason.length}/500
                </span>
              </div>
            </div>

            {/* Nút action */}
            <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={handleCloseDisableModal}
                style={{
                  paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10,
                  background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer',
                  color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#D8D8D3' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#E8E8E3' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDisableSubmit}
                style={{
                  paddingLeft: 32, paddingRight: 32, paddingTop: 10, paddingBottom: 10,
                  background: '#BA1A1A', borderRadius: 9999, border: 'none', cursor: 'pointer',
                  color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700,
                  boxShadow: '0px 4px 6px -4px rgba(186,26,26,0.20), 0px 10px 15px -3px rgba(186,26,26,0.20)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#93000A' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#BA1A1A' }}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ページネーション ── */}
      {!loading && totalPages > 1 && (
        <div style={{
          paddingLeft: 32, paddingRight: 32, paddingTop: 24, paddingBottom: 24,
          background: '#F4F4EF', borderRadius: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
            全 {total} アカウント中 {startRow}-{endRow} を表示
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
                color: page === 1 ? '#C0C9C1' : '#14422D', opacity: page === 1 ? 0.5 : 1,
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
                  boxShadow: p === page ? '0px 2px 4px -2px rgba(0,0,0,0.10), 0px 4px 6px -1px rgba(0,0,0,0.10)' : '0px 1px 2px rgba(0,0,0,0.05)',
                  border: 'none', cursor: 'pointer',
                  color: p === page ? 'white' : '#14422D',
                  fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
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
                color: page === totalPages ? '#C0C9C1' : '#14422D', opacity: page === totalPages ? 0.5 : 1,
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