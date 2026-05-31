'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type FormData = { email: string; password: string }

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [bannedReason, setBannedReason] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } =
    useForm<FormData>()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user.role === 'owner') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }, [router])

  const onSubmit = async (data: FormData) => {
    setServerError('')
    setBannedReason(null)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    try {
      const res = await axios.post(`${apiUrl}/auth/login`, data)
      const user = res.data.user
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(user))

      // Redirection logic based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user.role === 'owner') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const responseData = err.response?.data
        const errorMessage = responseData?.message || 'メールアドレスまたはパスワードが正しくありません'
        // Nếu là tài khoản bị hạn chế, hiển popup với lý do
        const isRestricted = responseData?.code === 'ACCOUNT_DISABLED'
          || responseData?.status === 'disabled'
          || errorMessage.includes('無効') || errorMessage.includes('disabled') || errorMessage.includes('制限')
        if (isRestricted && responseData?.reason) {
          setBannedReason(responseData.reason)
        } else if (isRestricted) {
          setBannedReason('')
        } else {
          setServerError(errorMessage)
        }
      } else {
        setServerError('ログインに失敗しました。もう一度お試しください。')
      }
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#FAFAF5', display: 'flex' }}>

      {/* ══ 左パネル ══ */}
      <div
        className="max-lg:hidden"
        style={{
          display: 'flex',
          width: 768,
          flexShrink: 0,
          minHeight: '100vh',
          padding: 80,
          position: 'relative',
          background: 'linear-gradient(127deg, #14422D 0%, #2D5A43 100%)',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* ブラー装飾 */}
        <div style={{
          width: 800, height: 800,
          position: 'absolute', left: 352, top: 608,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 9999, filter: 'blur(32px)',
        }} />

        {/* スペーサー（上部） */}
        <div style={{ width: 100, height: 100 }} />

        {/* WorkSpot + ヘッドライン */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48, position: 'relative', zIndex: 1, alignSelf: 'stretch' }}>
          <div style={{ color: 'white', fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 800, lineHeight: '36px' }}>
            WorkSpot
          </div>
          <div style={{ fontSize: 72, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '72px' }}>
            <span style={{ color: 'white' }}>集中できる</span>
            <span style={{ color: '#BCEECF' }}>場所</span>
            <span style={{ color: 'white' }}>と<br />創造性を育む</span>
            <span style={{ color: '#FFDBC7' }}>心。</span>
          </div>
        </div>

        {/* 説明文 */}
        <div style={{
          position: 'relative', zIndex: 1,
          color: '#A1D1B4', fontSize: 18,
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontWeight: 500, lineHeight: '29.25px',
        }}>
          ハノイの街に隠れた、<br />
          最高のカフェで見つける<br />
          インスピレーションに満ちたワークスペース。
        </div>
      </div>

      {/* ══ 右パネル ══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 96,
        paddingRight: 96,
        paddingTop: 48,
        paddingBottom: 48,
        background: '#FAFAF5',
      }}>
        <div style={{ width: '100%', maxWidth: 448, display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* タイトル */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#14422D', fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '36px' }}>
              お帰りなさい
            </div>
            <div style={{ color: '#414943', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
              情報を入力してログインしてください。
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* メール */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '20px', paddingLeft: 4 }}>
                メールアドレス
              </label>
              <input
                {...register('email')}
                type="text"
                placeholder="name@example.com"
                style={{
                  height: 56, width: '100%', boxSizing: 'border-box',
                  paddingLeft: 16, paddingRight: 16, paddingTop: 18, paddingBottom: 18,
                  background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
                  color: '#1A1C19', fontSize: 16,
                  fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400,
                }}
              />
            </div>

            {/* パスワード */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '20px', paddingLeft: 4 }}>
                パスワード
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={{
                    height: 56, width: '100%', boxSizing: 'border-box',
                    paddingLeft: 16, paddingRight: 48, paddingTop: 18, paddingBottom: 18,
                    background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
                    color: '#1A1C19', fontSize: 16,
                    fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#414943', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* パスワード忘れ */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: 4, paddingRight: 4, marginTop: -8 }}>
              <Link href="/forgot-password" style={{ color: '#904C18', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '16px', textDecoration: 'none' }}>
                パスワードをお忘れですか？
              </Link>
            </div>

            {/* エラー */}
            {serverError && (
              <div style={{ width: '100%', padding: 12, background: '#FFDAD6', borderRadius: 8, outline: '1px rgba(186,26,26,0.10) solid', outlineOffset: '-1px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 15, height: 15, flexShrink: 0, background: '#BA1A1A', borderRadius: 9999 }} />
                <div style={{ color: '#BA1A1A', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
                  {serverError}
                </div>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: 56, width: '100%',
                background: 'linear-gradient(170deg, #14422D 0%, #2D5A43 100%)',
                borderRadius: 9999, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                color: 'white', fontSize: 16,
                fontFamily: 'Manrope, sans-serif', fontWeight: 600, lineHeight: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isSubmitting ? 0.6 : 1,
                boxShadow: '0px 4px 6px -4px rgba(20,66,45,0.10), 0px 10px 15px -3px rgba(20,66,45,0.10)',
              }}
            >
              {isSubmitting ? '処理中...' : (
                <>{' '}ログイン<ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} /></>
              )}
            </button>
          </form>

          {/* 新規登録リンク */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
            <span style={{ color: '#414943' }}>アカウントをお持ちでないですか？ </span>
            <Link href="/register" style={{ color: '#904C18', textDecoration: 'none' }}>新規登録</Link>
          </div>

        </div>
      </div>

      {/* ホームへ戻る */}
      <Link
        href="/"
        style={{
          position: 'absolute', left: 24, top: 24,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
          borderRadius: 9999,
          color: 'white',
          fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px',
          textDecoration: 'none',
          background: 'rgba(0,0,0,0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <ArrowLeft size={14} />
        ホームへ戻る
      </Link>

      {/* ══ POPUP THÔNG BÁO TÀI KHOẢN BọA HẠN CHẾ ══ */}
      {bannedReason !== null && (
        <div
          onClick={() => setBannedReason(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(26,28,25,0.35)', backdropFilter: 'blur(6px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 480, maxWidth: '90vw',
              background: 'white',
              borderRadius: 20,
              boxShadow: '0px 24px 60px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header đỏ */}
            <div style={{
              background: 'linear-gradient(135deg, #BA1A1A 0%, #93000A 100%)',
              padding: '28px 32px 24px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9999,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div style={{ color: 'white', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '24px' }}>
                  アカウントが無効化されています
                </div>
              </div>
              <div style={{ color: 'rgba(255,218,214,0.85)', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 400, paddingLeft: 46 }}>
                このアカウントは管理者によりアクセスが制限されています。
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {bannedReason ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ color: '#A8A29E', fontSize: 11, fontFamily: 'Manrope, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
                    管理者からのメッセージ
                  </div>
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid rgba(186,26,26,0.15)',
                    borderRadius: 12,
                    padding: '14px 18px',
                    color: '#350F12',
                    fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 400, lineHeight: '22px',
                  }}>
                    {bannedReason}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#57736A', fontSize: 14, fontFamily: 'Manrope, sans-serif', lineHeight: '22px' }}>
                  詳しい理由は提供されていません。お問い合わせが必要な場合はサポートまでご連絡ください。
                </div>
              )}

              <button
                type="button"
                onClick={() => setBannedReason(null)}
                style={{
                  width: '100%', height: 48,
                  background: '#E8E8E3',
                  borderRadius: 9999, border: 'none', cursor: 'pointer',
                  color: '#1A1C19', fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 600,
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
