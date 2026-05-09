'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string | null
  avatar: string | null
  address: string | null
  bio: string | null
  role: 'customer' | 'owner' | 'admin'
  createdAt: string
}

const ROLE_LABEL_JP: Record<string, string> = {
  customer: 'ユーザー',
  owner: 'オーナー',
  admin: '管理者',
}

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : ''
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
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
  color: '#78716C',
  fontSize: 12,
  fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  lineHeight: '16px',
  letterSpacing: 1.20,
  paddingLeft: 4,
  paddingRight: 4,
}

const readOnlyBoxStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  padding: 16,
  background: '#E3E3DE',
  overflow: 'hidden',
  borderRadius: 8,
  color: '#1A1C19',
  fontSize: 16,
  fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 400,
  lineHeight: '24px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: 16,
  background: '#E3E3DE',
  borderRadius: 8,
  border: 'none',
  outline: 'none',
  color: '#1A1C19',
  fontSize: 16,
  fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 400,
  lineHeight: '24px',
}

export default function ProfilePage() {
  const router = useRouter()
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

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data)
        setEditForm({
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          bio: data.bio ?? '',
        })
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileError('')
    try {
      const updated = await patchProfile({
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        bio: editForm.bio.trim() || undefined,
      })
      setProfile(updated)
      setIsEditing(false)
    } catch (e: unknown) {
      setProfileError((e as Error).message)
    } finally {
      setSavingProfile(false)
    }
  }

  function handleCancelEdit() {
    if (!profile) return
    setEditForm({
      fullName: profile.fullName ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      bio: profile.bio ?? '',
    })
    setIsEditing(false)
    setProfileError('')
  }

  async function handleChangePassword() {
    setPwdError('')
    setPwdSuccess(false)
    if (!currentPwd || !newPwd) { setPwdError('パスワードを入力してください。'); return }
    if (newPwd.length < 6) { setPwdError('新しいパスワードは6文字以上で入力してください。'); return }
    setSavingPwd(true)
    try {
      await changePassword(currentPwd, newPwd)
      setCurrentPwd('')
      setNewPwd('')
      setPwdSuccess(true)
    } catch (e: unknown) {
      setPwdError((e as Error).message)
    } finally {
      setSavingPwd(false)
    }
  }

  const memberSince = profile
    ? `${new Date(profile.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}から利用中`
    : ''

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#414943', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif' }}>読み込み中...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: 384 }}>
          <p style={{ color: '#BA1A1A', fontWeight: 600, marginBottom: 8, fontFamily: 'Manrope, sans-serif' }}>プロフィールを読み込めませんでした</p>
          <p style={{ color: '#78716C', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif' }}>{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5', position: 'relative' }}>

      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,245,0.80)', boxShadow: '0px 8px 30px rgba(0,0,0,0.04)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1536, margin: '0 auto', paddingLeft: 32, paddingRight: 32, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ color: '#14422D', fontSize: 24, fontFamily: 'Acme, sans-serif', fontWeight: 400, lineHeight: '32px', textDecoration: 'none' }}>
            WorkSpot
          </a>
          <div>
            {profile?.avatar ? (
              <img src={profile.avatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: 9999, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#14422D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                {profile?.fullName?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div style={{ paddingLeft: 65, paddingRight: 65 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', paddingTop: 64, paddingLeft: 24, paddingRight: 24, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 64 }}>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h1 style={{ margin: 0, color: '#14422D', fontSize: 48, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '48px' }}>
              プロフィール
            </h1>
            <p style={{ margin: 0, maxWidth: 512, color: '#414943', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
              アカウント情報を管理して、WorkSpotをより便利に利用しましょう。
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

            {/* ── Left: Avatar card ── */}
            <div style={{ width: 304, flexShrink: 0, background: 'white', borderRadius: 12, paddingTop: 32, paddingBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {/* Avatar with camera button */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    style={{ width: 128, height: 128, borderRadius: 9999, objectFit: 'cover', boxShadow: '0px 0px 0px 4px rgba(45,90,67,0.10)' }}
                  />
                ) : (
                  <div style={{ width: 128, height: 128, borderRadius: 9999, background: '#E3E3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 0px 0px 4px rgba(45,90,67,0.10)' }}>
                    <span style={{ fontSize: 48, fontWeight: 700, color: '#14422D', fontFamily: 'Manrope, sans-serif' }}>
                      {profile?.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                )}
                {/* Camera edit button */}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, background: '#14422D', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.10), 0px 10px 15px -3px rgba(0,0,0,0.10)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4z" />
                    <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L13 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                  </svg>
                </div>
              </div>

              {/* Name */}
              <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px', textAlign: 'center', paddingLeft: 16, paddingRight: 16 }}>
                {profile?.fullName}
              </div>

              {/* Member since */}
              <div style={{ color: '#78716C', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, lineHeight: '20px', textAlign: 'center', paddingLeft: 16, paddingRight: 16 }}>
                {memberSince}
              </div>

              {/* Role badge */}
              <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 6, paddingBottom: 6, background: '#FFDBC7', borderRadius: 9999 }}>
                <span style={{ color: '#311300', fontSize: 12, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.30 }}>
                  {ROLE_LABEL_JP[profile?.role ?? 'customer']}
                </span>
              </div>
            </div>

            {/* ── Right: Form sections ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 48 }}>

              {/* 基本情報 */}
              <div style={{ background: 'white', borderRadius: 12, paddingTop: 40, paddingBottom: 56, paddingLeft: 40, paddingRight: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px' }}>基本情報</h2>
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* 氏名 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>氏名</div>
                    {isEditing ? (
                      <input
                        value={editForm.fullName}
                        onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={readOnlyBoxStyle}>{profile?.fullName}</div>
                    )}
                  </div>

                  {/* メールアドレス */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>メールアドレス</div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={readOnlyBoxStyle}>{profile?.email}</div>
                    )}
                  </div>

                  {/* 電話番号 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>電話番号</div>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={readOnlyBoxStyle}>{profile?.phone || <span style={{ color: '#78716C' }}>—</span>}</div>
                    )}
                  </div>

                  {/* 所在地 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={fieldLabelStyle}>所在地</div>
                    {isEditing ? (
                      <input
                        value={editForm.address}
                        onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                        style={inputStyle}
                      />
                    ) : (
                      <div style={readOnlyBoxStyle}>{profile?.address || <span style={{ color: '#78716C' }}>—</span>}</div>
                    )}
                  </div>

                  {/* 自己紹介 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16 }}>
                    <div style={fieldLabelStyle}>自己紹介</div>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio}
                        onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                        rows={4}
                        style={{ ...inputStyle, paddingTop: 16, paddingBottom: 40, resize: 'none' }}
                      />
                    ) : (
                      <div style={{ ...readOnlyBoxStyle, paddingTop: 16, paddingBottom: 40 }}>
                        {profile?.bio || <span style={{ color: '#78716C' }}>—</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile error */}
                {profileError && (
                  <div style={{ padding: 12, background: '#FFDAD6', borderRadius: 8, outline: '1px rgba(186,26,26,0.10) solid', outlineOffset: '-1px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 15, height: 15, flexShrink: 0, background: '#BA1A1A', borderRadius: 9999 }} />
                    <div style={{ color: '#BA1A1A', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500 }}>{profileError}</div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        style={{ width: 120, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: '#14422D', borderRadius: 8, border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer', color: 'white', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '20px', textAlign: 'center', opacity: savingProfile ? 0.6 : 1 }}
                      >
                        {savingProfile ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingProfile}
                        style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: '#FDFFFE', borderRadius: 8, outline: '1px rgba(20,66,45,0.25) solid', outlineOffset: '-1px', border: 'none', cursor: 'pointer', color: '#14422D', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '20px' }}
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{ width: 120, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: '#14422D', borderRadius: 8, border: 'none', cursor: 'pointer', color: 'white', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '20px', textAlign: 'center' }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: '#FDFFFE', borderRadius: 8, outline: '1px rgba(20,66,45,0.25) solid', outlineOffset: '-1px', border: 'none', cursor: 'pointer', color: '#14422D', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '20px' }}
                      >
                        ホームに戻る
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ── セキュリティ ── */}
              <div style={{ background: 'white', borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
                <h2 style={{ margin: 0, color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px' }}>セキュリティ</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {/* Password fields side by side */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    {/* 現在のパスワード */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={fieldLabelStyle}>現在のパスワード</div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPwd}
                          onChange={e => setCurrentPwd(e.target.value)}
                          placeholder="••••••••"
                          style={{ ...inputStyle, paddingTop: 18, paddingBottom: 18, paddingRight: 48 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(v => !v)}
                          style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                          <EyeIcon open={showCurrent} />
                        </button>
                      </div>
                    </div>

                    {/* 新しいパスワード */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={fieldLabelStyle}>新しいパスワード</div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          placeholder="••••••••"
                          style={{ ...inputStyle, paddingTop: 18, paddingBottom: 18, paddingRight: 48 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(v => !v)}
                          style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                          <EyeIcon open={showNew} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error / Success + 変更する button */}
                  <div style={{ paddingTop: 24, borderTop: '1px #E8E8E3 solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {pwdError && (
                        <p style={{ margin: 0, fontSize: 14, color: '#BA1A1A', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{pwdError}</p>
                      )}
                      {pwdSuccess && (
                        <p style={{ margin: 0, fontSize: 14, color: '#14422D', fontFamily: 'Be Vietnam Pro, sans-serif' }}>パスワードを変更しました。</p>
                      )}
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPwd}
                      style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10, background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: savingPwd ? 'not-allowed' : 'pointer', color: '#1A1C19', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, lineHeight: '20px', opacity: savingPwd ? 0.6 : 1 }}
                    >
                      {savingPwd ? '変更中...' : '変更する'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
