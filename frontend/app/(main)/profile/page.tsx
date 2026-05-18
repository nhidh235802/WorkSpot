'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { userService } from '@/services/user.service'
import OwnerSidebar from '@/components/OwnerSidebar'

type UserRole = 'customer' | 'owner' | 'admin'

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string | null
  avatar: string | null
  address: string | null
  bio: string | null
  role: UserRole
  createdAt: string
}

const ROLE_LABEL: Record<UserRole, string> = {
  customer: 'ユーザー',
  owner: 'Chủ quán',
  admin: '管理者',
}

const PROFILE_TEXT: Record<UserRole, {
  locale: string
  pageTitle: string
  pageSubtitle: string
  memberSinceSuffix: string
  basicInfoTitle: string
  securityTitle: string
  fieldLabels: {
    fullName: string
    email: string
    phone: string
    address: string
    bio: string
    currentPassword: string
    newPassword: string
  }
  save: string
  saving: string
  cancel: string
  edit: string
  backHome: string
  logout: string
  loading: string
  loadErrorTitle: string
  passwordSuccess: string
  passwordRequired: string
  passwordMinLength: string
  avatarTypeError: string
  avatarSizeError: string
  profileUpdateFailed: string
}> = {
  customer: {
    locale: 'ja-JP',
    pageTitle: 'プロフィール',
    pageSubtitle: 'アカウント情報を管理して、WorkSpotをより便利に利用しましょう。',
    memberSinceSuffix: 'から利用中',
    basicInfoTitle: '基本情報',
    securityTitle: 'セキュリティ',
    fieldLabels: {
      fullName: '氏名',
      email: 'メールアドレス',
      phone: '電話番号',
      address: '所在地',
      bio: '自己紹介',
      currentPassword: '現在のパスワード',
      newPassword: '新しいパスワード',
    },
    save: '保存',
    saving: '保存中...',
    cancel: 'キャンセル',
    edit: '編集',
    backHome: 'ホームに戻る',
    logout: 'ログアウト',
    loading: '読み込み中...',
    loadErrorTitle: 'プロフィールを読み込めませんでした',
    passwordSuccess: 'パスワードを変更しました。',
    passwordRequired: 'パスワードを入力してください。',
    passwordMinLength: '新しいパスワードは6文字以上で入力してください。',
    avatarTypeError: '画像ファイル (jpg, jpeg, png, gif) を選択してください。',
    avatarSizeError: '5MB以下の画像を選択してください。',
    profileUpdateFailed: 'プロフィールの更新に失敗しました。',
  },
  owner: {
    locale: 'vi-VN',
    pageTitle: 'Hồ sơ',
    pageSubtitle: 'Quản lý thông tin tài khoản để sử dụng WorkSpot dễ dàng hơn.',
    memberSinceSuffix: 'đã tham gia',
    basicInfoTitle: 'Thông tin cơ bản',
    securityTitle: 'Bảo mật',
    fieldLabels: {
      fullName: 'Họ và tên',
      email: 'Email',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      bio: 'Giới thiệu bản thân',
      currentPassword: 'Mật khẩu hiện tại',
      newPassword: 'Mật khẩu mới',
    },
    save: 'Lưu',
    saving: 'Đang lưu...',
    cancel: 'Hủy',
    edit: 'Chỉnh sửa',
    backHome: 'Về trang chủ',
    logout: 'Đăng xuất',
    loading: 'Đang tải...',
    loadErrorTitle: 'Không thể tải hồ sơ',
    passwordSuccess: 'Đã đổi mật khẩu.',
    passwordRequired: 'Vui lòng điền mật khẩu.',
    passwordMinLength: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
    avatarTypeError: 'Vui lòng chọn tệp ảnh (jpg, jpeg, png, gif).',
    avatarSizeError: 'Vui lòng chọn ảnh dưới 5MB.',
    profileUpdateFailed: 'Cập nhật hồ sơ thất bại.',
  },
  admin: {
    locale: 'ja-JP',
    pageTitle: 'プロフィール',
    pageSubtitle: 'アカウント情報を管理して、WorkSpotをより便利に利用しましょう。',
    memberSinceSuffix: 'から利用中',
    basicInfoTitle: '基本情報',
    securityTitle: 'セキュリティ',
    fieldLabels: {
      fullName: '氏名',
      email: 'メールアドレス',
      phone: '電話番号',
      address: '所在地',
      bio: '自己紹介',
      currentPassword: '現在のパスワード',
      newPassword: '新しいパスワード',
    },
    save: '保存',
    saving: '保存中...',
    cancel: 'キャンセル',
    edit: '編集',
    backHome: 'ホームに戻る',
    logout: 'ログアウト',
    loading: '読み込み中...',
    loadErrorTitle: 'プロフィールを読み込めませんでした',
    passwordSuccess: 'パスワードを変更しました。',
    passwordRequired: 'パスワードを入力してください。',
    passwordMinLength: '新しいパスワードは6文字以上で入力してください。',
    avatarTypeError: '画像ファイル (jpg, jpeg, png, gif) を選択してください。',
    avatarSizeError: '5MB以下の画像を選択してください。',
    profileUpdateFailed: 'プロフィールの更新に失敗しました。',
  },
}

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`
  return headers
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    const msg = json.message
    return Array.isArray(msg) ? msg.join(', ') : (msg ?? `エラー ${res.status}`)
  } catch {
    return `エラー ${res.status}`
  }
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API}/profile`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

async function patchProfile(data: Partial<Pick<UserProfile, 'fullName' | 'email' | 'phone' | 'address' | 'bio'>>): Promise<UserProfile> {
  const res = await fetch(`${API}/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API}/profile/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword: newPassword }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
      <path d="M11 0C6 0 1.73 3.11 0 7.5 1.73 11.89 6 15 11 15s9.27-3.11 11-7.5C20.27 3.11 16 0 11 0zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#C0C9C1" />
    </svg>
  ) : (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
      <path d="M2.42 1L1 2.41l3.36 3.36A11.14 11.14 0 0 0 0 7.5C1.73 11.89 6 15 11 15a10.9 10.9 0 0 0 4.36-.9l3.22 3.22L20 15.83 2.42 1zM11 12.5a5 5 0 0 1-4.9-4.03l1.56 1.56A3 3 0 0 0 11 13.5v-1zm0-10a10.83 10.83 0 0 1 9.54 5.8 11.07 11.07 0 0 1-2.88 3.35l-1.42-1.42A5 5 0 0 0 11 2.5a4.93 4.93 0 0 0-2.16.49L7.3 1.45A10.9 10.9 0 0 1 11 1z" fill="#C0C9C1" />
    </svg>
  )
}

const fieldLabelStyle: React.CSSProperties = {
  color: '#78716C', fontSize: 12, fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 600, textTransform: 'uppercase', lineHeight: '16px',
  letterSpacing: 1.20, paddingLeft: 4, paddingRight: 4,
}

const readOnlyBoxStyle: React.CSSProperties = {
  alignSelf: 'stretch', padding: 16, background: '#E3E3DE',
  overflow: 'hidden', borderRadius: 8, color: '#1A1C19',
  fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 400, lineHeight: '24px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: 16,
  background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
  color: '#1A1C19', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 400, lineHeight: '24px',
}

export default function ProfilePage() {
  const router = useRouter()

  const [userRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) return JSON.parse(userStr).role || 'customer'
      } catch { /* ignore */ }
    }
    return 'customer'
  })

  const roleStrings = PROFILE_TEXT[userRole]

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', address: '', bio: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Navbar dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  function handleLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setDropdownOpen(false)
    router.push('/')
  }

  // Load profile
  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data)
        setEditForm({ fullName: data.fullName ?? '', email: data.email ?? '', phone: data.phone ?? '', address: data.address ?? '', bio: data.bio ?? '' })
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveProfile() {
    setSavingProfile(true); setProfileError('')
    try {
      const updated = await patchProfile({
        fullName: editForm.fullName.trim(), email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined, address: editForm.address.trim() || undefined,
        bio: editForm.bio.trim() || undefined,
      })
      setProfile(updated); setIsEditing(false)
    } catch (e: unknown) { setProfileError((e as Error).message) }
    finally { setSavingProfile(false) }
  }

  function handleCancelEdit() {
    if (!profile) return
    setEditForm({ fullName: profile.fullName ?? '', email: profile.email ?? '', phone: profile.phone ?? '', address: profile.address ?? '', bio: profile.bio ?? '' })
    setIsEditing(false); setProfileError('')
  }

  async function handleChangePassword() {
    setPwdError(''); setPwdSuccess(false)
    if (!currentPwd || !newPwd) { setPwdError(roleStrings.passwordRequired); return }
    if (newPwd.length < 6) { setPwdError(roleStrings.passwordMinLength); return }
    setSavingPwd(true)
    try {
      await changePassword(currentPwd, newPwd)
      setCurrentPwd(''); setNewPwd(''); setPwdSuccess(true)
    } catch (e: unknown) { setPwdError((e as Error).message) }
    finally { setSavingPwd(false) }
  }

  // Upload avatar → lưu vào DB
  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      setAvatarError(roleStrings.avatarTypeError); return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(roleStrings.avatarSizeError); return
    }

    setUploadingAvatar(true); setAvatarError('')

    // Preview ngay lập tức
    const localPreview = URL.createObjectURL(file)
    const prevAvatar = profile?.avatar ?? null
    setProfile(prev => prev ? { ...prev, avatar: localPreview } : prev)

    try {
      // Gọi POST /profile/avatar → backend lưu file, trả về { avatar: "/uploads/xxx.jpg" }
      const result = await userService.uploadAvatar(file)
      // Cập nhật bằng URL thật từ server
      setProfile(prev => prev ? { ...prev, avatar: result.avatar } : prev)
      // Sync localStorage + notify Navbar ngay lập tức
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          userData.avatar = result.avatar
          localStorage.setItem('user', JSON.stringify(userData))
        } catch { /* ignore */ }
      }
      window.dispatchEvent(new CustomEvent('workspot:user-updated', { detail: { avatar: result.avatar } }))
    } catch (error: unknown) {
      setAvatarError((error as Error).message)
      // Rollback về avatar cũ nếu thất bại
      setProfile(prev => prev ? { ...prev, avatar: prevAvatar } : prev)
    } finally {
      setTimeout(() => URL.revokeObjectURL(localPreview), 500)
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const memberSince = profile
    ? `${new Date(profile.createdAt).toLocaleDateString(roleStrings.locale, { year: 'numeric', month: 'long' })} ${roleStrings.memberSinceSuffix}`
    : ''

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#414943', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif' }}>{roleStrings.loading}</p>
    </div>
  )

  if (loadError) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: 384 }}>
        <p style={{ color: '#BA1A1A', fontWeight: 600, marginBottom: 8, fontFamily: 'Manrope, sans-serif' }}>{roleStrings.loadErrorTitle}</p>
        <p style={{ color: '#78716C', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif' }}>{loadError}</p>
      </div>
    </div>
  )

  const profileContent = (
    <div style={userRole === 'owner' ? { width: '100%' } : { paddingLeft: 65, paddingRight: 65 }}>
      <div style={userRole === 'owner'
        ? { maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }
        : { maxWidth: 1152, margin: '0 auto', paddingTop: 64, paddingLeft: 24, paddingRight: 24, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 64 }
      }>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, color: '#14422D', fontSize: 40, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '48px' }}>{roleStrings.pageTitle}</h1>
          <p style={{ margin: 0, maxWidth: 512, color: '#414943', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
            {roleStrings.pageSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* ── Left: Avatar card ── */}
          <div style={{ width: 304, flexShrink: 0, background: 'white', borderRadius: 12, paddingTop: 32, paddingBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ position: 'relative' }}>
                {profile?.avatar ? (
                  <img
                    src={profile.avatar.startsWith('blob:') || profile.avatar.startsWith('http') ? profile.avatar : `${API}${profile.avatar}`}
                    alt="avatar"
                    style={{ width: 128, height: 128, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 128, height: 128, borderRadius: '50%', background: '#E3E3DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#14422D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: '50%', background: '#14422D', border: 'none', cursor: uploadingAvatar ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: uploadingAvatar ? 0.6 : 1 }}
                >
                  {uploadingAvatar ? (
                    <div style={{ width: 16, height: 16, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4z" />
                      <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L13 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                    </svg>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
              {avatarError && (
                <div style={{ color: '#BA1A1A', fontSize: 12, marginTop: 8, textAlign: 'center', maxWidth: 200, fontFamily: 'Be Vietnam Pro, sans-serif' }}>{avatarError}</div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>

            <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px', textAlign: 'center', paddingLeft: 16, paddingRight: 16 }}>{profile?.fullName}</div>
            <div style={{ color: '#78716C', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', lineHeight: '20px', textAlign: 'center', paddingLeft: 16, paddingRight: 16 }}>{memberSince}</div>
            <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6, background: '#FFDBC7', borderRadius: 9999 }}>
              <span style={{ color: '#311300', fontSize: 12, fontFamily: 'Be Vietnam Pro, sans-serif', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.30 }}>
                {ROLE_LABEL[profile?.role ?? 'customer']}
              </span>
            </div>
          </div>

          {/* ── Right: Forms ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* 基本情報 */}
            <div style={{ background: 'white', borderRadius: 12, paddingTop: 40, paddingBottom: 56, paddingLeft: 40, paddingRight: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
              <h2 style={{ margin: 0, color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px' }}>{roleStrings.basicInfoTitle}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>{roleStrings.fieldLabels.fullName}</div>
                    {isEditing ? <input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} style={inputStyle} /> : <div style={readOnlyBoxStyle}>{profile?.fullName}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>{roleStrings.fieldLabels.email}</div>
                    {isEditing ? <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} /> : <div style={readOnlyBoxStyle}>{profile?.email}</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>{roleStrings.fieldLabels.phone}</div>
                    {isEditing ? <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} /> : <div style={readOnlyBoxStyle}>{profile?.phone || <span style={{ color: '#78716C' }}>—</span>}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>{roleStrings.fieldLabels.address}</div>
                    {isEditing ? <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} /> : <div style={readOnlyBoxStyle}>{profile?.address || <span style={{ color: '#78716C' }}>—</span>}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={fieldLabelStyle}>{roleStrings.fieldLabels.bio}</div>
                  {isEditing ? <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} rows={4} style={{ ...inputStyle, paddingTop: 16, paddingBottom: 40, resize: 'none' }} /> : <div style={{ ...readOnlyBoxStyle, paddingTop: 16, paddingBottom: 40 }}>{profile?.bio || <span style={{ color: '#78716C' }}>—</span>}</div>}
                </div>
              </div>

              {profileError && (
                <div style={{ padding: 12, background: '#FFDAD6', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 15, height: 15, flexShrink: 0, background: '#BA1A1A', borderRadius: 9999 }} />
                  <div style={{ color: '#BA1A1A', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500 }}>{profileError}</div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {isEditing ? (
                  <>
                    <button onClick={handleSaveProfile} disabled={savingProfile} style={{ width: 120, padding: '8px 16px', background: '#14422D', borderRadius: 8, border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer', color: 'white', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, opacity: savingProfile ? 0.6 : 1 }}>
                      {savingProfile ? roleStrings.saving : roleStrings.save}
                    </button>
                    <button onClick={handleCancelEdit} style={{ padding: '8px 16px', background: '#FDFFFE', borderRadius: 8, outline: '1px rgba(20,66,45,0.25) solid', outlineOffset: '-1px', border: 'none', cursor: 'pointer', color: '#14422D', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500 }}>
                      {roleStrings.cancel}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} style={{ width: 120, padding: '8px 16px', background: '#14422D', borderRadius: 8, border: 'none', cursor: 'pointer', color: 'white', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500 }}>
                      {roleStrings.edit}
                    </button>
                    <button onClick={() => router.push(userRole === 'owner' ? '/dashboard' : '/')} style={{ padding: '8px 16px', background: '#FDFFFE', borderRadius: 8, outline: '1px rgba(20,66,45,0.25) solid', outlineOffset: '-1px', border: 'none', cursor: 'pointer', color: '#14422D', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500 }}>
                      {roleStrings.backHome}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* セキュリティ */}
            <div style={{ background: 'white', borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
              <h2 style={{ margin: 0, color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px' }}>{roleStrings.securityTitle}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>{roleStrings.fieldLabels.currentPassword}</div>
                    <div style={{ position: 'relative' }}>
                      <input type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingTop: 18, paddingBottom: 18, paddingRight: 48 }} />
                      <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <EyeIcon open={showCurrent} />
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>{roleStrings.fieldLabels.newPassword}</div>
                    <div style={{ position: 'relative' }}>
                      <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingTop: 18, paddingBottom: 18, paddingRight: 48 }} />
                      <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <EyeIcon open={showNew} />
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ paddingTop: 24, borderTop: '1px #E8E8E3 solid', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  {pwdError && <p style={{ margin: 0, fontSize: 14, color: '#BA1A1A', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{pwdError}</p>}
                  {pwdSuccess && <p style={{ margin: 0, fontSize: 14, color: '#14422D', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{roleStrings.passwordSuccess}</p>}
                  <button onClick={handleChangePassword} disabled={savingPwd} style={{ padding: '10px 24px', background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: savingPwd ? 'not-allowed' : 'pointer', color: '#1A1C19', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, opacity: savingPwd ? 0.6 : 1 }}>
                    {savingPwd ? roleStrings.saving : roleStrings.save}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )

  if (userRole === 'owner') {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#FAFAF5', width: '100%', minWidth: 1280, overflow: 'hidden', position: 'relative' }}>
        <OwnerSidebar />
        <main
          style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 48,
            paddingRight: 48,
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {profileContent}
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 1500, width: '100%', background: 'rgba(250,250,245,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 8px 30px 0 rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(20,66,45,0.05)' }}>
        <div style={{ maxWidth: 1536, margin: '0 auto', padding: '0 32px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: '#14422D', fontSize: 24, fontFamily: 'Acme', fontWeight: 400, textDecoration: 'none', lineHeight: '32px' }}>WorkSpot</Link>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setDropdownOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              {profile?.avatar ? (
                <img
                  src={profile.avatar.startsWith('blob:') || profile.avatar.startsWith('http') ? profile.avatar : `${API}${profile.avatar}`}
                  alt={profile?.fullName}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #14422D' }}
                />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #14422D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14422D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </button>
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#EEEEE9', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: 140, zIndex: 1600, padding: '14px 16px' }}>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#14422D', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Manrope, sans-serif', width: '100%' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14422D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span style={{ lineHeight: '20px' }}>{roleStrings.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {profileContent}
    </div>
  )
}
