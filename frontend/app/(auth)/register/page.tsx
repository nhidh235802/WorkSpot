'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, IdCard, Lock, Mail, Store, User } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const schema = z
  .object({
    role: z.enum(['customer', 'owner']),
    fullName: z.string().min(1, '氏名を入力してください'),
    email: z.email(),
    password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  paddingTop: 18,
  paddingBottom: 18,
  paddingLeft: 48,
  paddingRight: 16,
  background: '#E3E3DE',
  borderRadius: 12,
  border: 'none',
  outline: 'none',
  color: '#1A1C19',
  fontSize: 16,
  fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 400,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#414943',
  fontSize: 12,
  fontFamily: 'Be Vietnam Pro, sans-serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  lineHeight: '16px',
  letterSpacing: 0.60,
  marginBottom: 6,
  paddingLeft: 4,
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'owner'>('customer')
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'customer' } })

  const pickRole = (role: 'customer' | 'owner') => {
    setSelectedRole(role)
    setValue('role', role)
  }

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await axios.post('http://localhost:3001/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      router.push('/login')
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setServerError('このメールアドレスはすでに使用されています。')
      } else {
        setServerError('登録に失敗しました。もう一度お試しください。')
      }
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', background: '#FAFAF5', display: 'flex' }}>

      {/* ══ 左パネル ══ */}
      <div
        className="max-lg:hidden"
        style={{ flex: '1 1 0', position: 'relative', background: '#14422D', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
      >
        <Image
          src="/images/291cf934ac1b4d19a98f0b191a0efa2da4f4de86.png"
          alt="WorkSpot cafe"
          fill
          style={{ objectFit: 'cover', opacity: 0.60 }}
          priority
        />
        <div style={{
          position: 'relative', zIndex: 1, flex: '1 1 0', height: '100%',
          paddingTop: 82, paddingBottom: 64, paddingLeft: 64, paddingRight: 64,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          {/* ロゴ */}
          <div style={{ color: 'white', fontSize: 24, fontFamily: 'Acme, sans-serif', fontWeight: 400, lineHeight: '32px' }}>
            WorkSpot
          </div>

          {/* キャッチコピー */}
          <div style={{ width: '100%', maxWidth: 448, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ color: 'white', fontSize: 48, fontFamily: 'Manrope, sans-serif', fontWeight: 800, lineHeight: '60px' }}>
              ハノイの中心で、あなたらしく働ける場所を。
            </div>
            <div style={{ color: '#BCEECF', fontSize: 18, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '29.25px' }}>
              WorkSpotは、リモートワーカーとカフェオーナーをつなぐサービスです。
            </div>
          </div>

          {/* ドット */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 4, borderRadius: 9999, background: 'white' }} />
            <div style={{ width: 16, height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </div>

      {/* ══ 右パネル ══ */}
      <div style={{
        flex: '1 1 0', padding: 96,
        background: '#F4F4EF', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 448, paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* タイトル */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#1A1C19', fontSize: 36, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '40px' }}>
              アカウント作成
            </div>
            <div style={{ color: '#414943', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
              WorkSpotを今すぐ始めましょう。
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* アカウント種別 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, textTransform: 'uppercase', lineHeight: '20px', letterSpacing: 0.35 }}>
                アカウント種別
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  type="button"
                  onClick={() => pickRole('customer')}
                  style={{
                    height: 60, padding: 16,
                    borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: selectedRole === 'customer' ? '#14422D' : '#E3E3DE',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                    color: selectedRole === 'customer' ? 'white' : '#414943',
                    fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600,
                  }}
                >
                  <User size={16} />
                  リモートワーカー
                </button>
                <button
                  type="button"
                  onClick={() => pickRole('owner')}
                  style={{
                    height: 60, padding: 16,
                    borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: selectedRole === 'owner' ? '#14422D' : '#E3E3DE',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                    color: selectedRole === 'owner' ? 'white' : '#414943',
                    fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 800,
                  }}
                >
                  <Store size={16} />
                  カフェオーナー
                </button>
              </div>
            </div>

            {/* フィールド群 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>

              {/* 氏名 */}
              <div>
                <label style={labelStyle}>氏名</label>
                <div style={{ position: 'relative' }}>
                  <IdCard size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#C0C9C1' }} />
                  <input {...register('fullName')} type="text" placeholder="山田 太郎" style={inputBase} />
                </div>
                {errors.fullName && <p style={{ color: '#EF4444', fontSize: 12, margin: '4px 0 0' }}>{errors.fullName.message}</p>}
              </div>

              {/* メールアドレス */}
              <div>
                <label style={labelStyle}>メールアドレス</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#C0C9C1' }} />
                  <input {...register('email')} type="email" placeholder="name@example.com" style={inputBase} />
                </div>
                {errors.email && <p style={{ color: '#EF4444', fontSize: 12, margin: '4px 0 0' }}>{errors.email.message}</p>}
              </div>

              {/* パスワード */}
              <div>
                <label style={labelStyle}>パスワード</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#C0C9C1' }} />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputBase, paddingRight: 48 }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#C0C9C1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#EF4444', fontSize: 12, margin: '4px 0 0' }}>{errors.password.message}</p>}
              </div>

              {/* パスワード（確認） */}
              <div>
                <label style={labelStyle}>パスワード（確認）</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#C0C9C1' }} />
                  <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputBase, paddingRight: 48 }} />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#C0C9C1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ color: '#EF4444', fontSize: 12, margin: '4px 0 0' }}>{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* サーバーエラー */}
            {serverError && (
              <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '12px 16px', color: '#DC2626', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                {serverError}
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', paddingTop: 20, paddingBottom: 20,
                background: 'linear-gradient(90deg, #14422D 0%, #2D5A43 100%)',
                borderRadius: 9999, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                color: 'white', fontSize: 18, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, lineHeight: '28px',
                opacity: isSubmitting ? 0.6 : 1,
                boxShadow: '0px 8px 10px -6px rgba(20,66,45,0.10), 0px 20px 25px -5px rgba(20,66,45,0.10)',
              }}
            >
              {isSubmitting ? '処理中...' : (
                <>アカウントを作成<ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /></>
              )}
            </button>
          </form>

          {/* ログインリンク */}
          <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#414943', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
              すでにアカウントをお持ちの方
            </span>
            <Link href="/login" style={{ color: '#904C18', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 600, lineHeight: '24px', textDecoration: 'none' }}>
              ログイン
            </Link>
          </div>

        </div>
      </div>

      {/* ホームに戻る */}
      <div style={{ position: 'absolute', left: 32, top: 32, zIndex: 20 }}>
        <Link
          href="/"
          style={{
            paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
            background: 'rgba(250,250,245,0.80)', borderRadius: 9999,
            backdropFilter: 'blur(12px)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#14422D', fontSize: 16, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 500, lineHeight: '24px',
            textDecoration: 'none',
            boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,0,0,0.05)',
          }}
        >
          <ArrowLeft size={16} />
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
