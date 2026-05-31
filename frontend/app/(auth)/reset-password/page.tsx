'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import axios from 'axios'

const schema = z.object({
  newPassword: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

const errorBanner = (msg: string) => (
  <div style={{ width: '100%', padding: 12, background: '#FFDAD6', borderRadius: 8, outline: '1px rgba(186,26,26,0.10) solid', outlineOffset: '-1px', display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ width: 15, height: 15, flexShrink: 0, background: '#BA1A1A', borderRadius: 9999 }} />
    <div style={{ color: '#BA1A1A', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px' }}>
      {msg}
    </div>
  </div>
)

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) setServerError('リンクが無効です。再度お試しください。')
  }, [token])

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })
  const onSubmit = async (data: FormData) => {
    setServerError('')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    try {
      await axios.post(`${apiUrl}/auth/reset-password`, {
        token,
        newPassword: data.newPassword,
      })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setServerError(typeof msg === 'string' ? msg : 'リンクが無効または期限切れです。')
    }
  }

  const inputStyle = (showToggle = false): React.CSSProperties => ({
    height: 56, width: '100%', boxSizing: 'border-box',
    paddingLeft: 16, paddingRight: showToggle ? 48 : 16, paddingTop: 18, paddingBottom: 18,
    background: '#E3E3DE', borderRadius: 8, border: 'none', outline: 'none',
    color: '#1A1C19', fontSize: 16,
    fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 400,
  })

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#FAFAF5', display: 'flex' }}>

      {/* Left panel */}
      <div
        className="max-lg:hidden"
        style={{
          width: 768, flexShrink: 0, minHeight: '100vh',
          padding: 80, position: 'relative',
          background: 'linear-gradient(126deg, #14422D 0%, #2D5A43 100%)',
          overflow: 'hidden', display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start',
        }}
      >
        <div style={{
          width: 800, height: 800,
          position: 'absolute', left: 352, top: 608,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 9999, filter: 'blur(32px)',
        }} />

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

        <div style={{ position: 'relative', zIndex: 1, color: '#A1D1B4', fontSize: 18, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '29.25px' }}>
          ハノイの街に隠れた、<br />
          最高のカフェで見つける<br />
          インスピレーションに満ちたワークスペース。
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingLeft: 96, paddingRight: 96, paddingTop: 48, paddingBottom: 48,
        background: '#FAFAF5',
      }}>
        <div style={{ width: '100%', maxWidth: 448, paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 40 }}>

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
              <CheckCircle size={56} color="#14422D" />
              <div>
                <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 600, marginBottom: 8 }}>
                  パスワードを再設定しました！
                </div>
                <div style={{ color: '#414943', fontSize: 15 }}>
                  ログイン画面に移動しています...
                </div>
              </div>
              <Link
                href="/login"
                style={{
                  height: 48, padding: '0 32px',
                  background: 'linear-gradient(171deg, #14422D 0%, #2D5A43 100%)',
                  borderRadius: 9999,
                  display: 'inline-flex', alignItems: 'center',
                  color: 'white', fontSize: 15, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                ログイン画面へ
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: '#14422D', fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '36px' }}>
                  新しいパスワードを設定
                </div>
                <div style={{ color: '#414943', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
                  アカウントの新しいパスワードを入力してください。
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* New password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px', paddingLeft: 4 }}>
                    新しいパスワード
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      {...register('newPassword')}
                      type={showNew ? 'text' : 'password'}
                      placeholder="6文字以上"
                      style={inputStyle(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && errorBanner(errors.newPassword.message!)}
                </div>

                {/* Confirm password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px', paddingLeft: 4 }}>
                    パスワード（確認）
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="もう一度入力してください"
                      style={inputStyle(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && errorBanner(errors.confirmPassword.message!)}
                </div>

                {serverError && errorBanner(serverError)}

                <button
                  type="submit"
                  disabled={isSubmitting || !token}
                  style={{
                    marginTop: 32,
                    height: 56, width: '100%',
                    background: 'linear-gradient(170deg, #14422D 0%, #2D5A43 100%)',
                    borderRadius: 9999, border: 'none', cursor: (isSubmitting || !token) ? 'not-allowed' : 'pointer',
                    color: 'white', fontSize: 16,
                    fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: (isSubmitting || !token) ? 0.6 : 1,
                    boxShadow: '0px 4px 6px -4px rgba(20,66,45,0.10), 0px 10px 15px -3px rgba(20,66,45,0.10)',
                  }}
                >
                  {isSubmitting ? '処理中...' : 'パスワードを再設定する'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/login"
        style={{
          position: 'absolute', left: 24, top: 24,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
          borderRadius: 9999, color: 'white', fontSize: 14,
          fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px',
          textDecoration: 'none',
          background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)',
        }}
      >
        <ArrowLeft size={14} />
        ログインへ戻る
      </Link>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
