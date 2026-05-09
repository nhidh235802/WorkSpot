'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail } from 'lucide-react'
import axios from 'axios'

const schema = z.object({
  email: z.email(),
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

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await axios.post('http://localhost:3001/auth/forgot-password', { email: data.email })
      setSent(true)
    } catch {
      setServerError('送信に失敗しました。もう一度お試しください。')
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#FAFAF5', display: 'flex' }}>

      {/* ══ 左パネル ══ */}
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

      {/* ══ 右パネル ══ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingLeft: 96, paddingRight: 96, paddingTop: 48, paddingBottom: 48,
        background: '#FAFAF5',
      }}>
        <div style={{ width: '100%', maxWidth: 448, paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* タイトル */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: '#14422D', fontSize: 30, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '36px' }}>
              パスワード再設定
            </div>
            <div style={{ color: '#414943', fontSize: 16, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
              メールアドレスを入力すると、再設定リン<br />クをお送りします。
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* メールアドレス */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '20px', paddingLeft: 4, paddingRight: 4 }}>
                メールアドレス
              </label>
              <input
                {...register('email')}
                type="email"
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

            {/* バリデーションエラー */}
            {errors.email && errorBanner('メールアドレスの形式が正しくありません')}

            {/* サーバーエラー */}
            {serverError && errorBanner(serverError)}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: 32,
                height: 56, width: '100%',
                background: 'linear-gradient(170deg, #14422D 0%, #2D5A43 100%)',
                borderRadius: 9999, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                color: 'white', fontSize: 16,
                fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isSubmitting ? 0.6 : 1,
                boxShadow: '0px 4px 6px -4px rgba(20,66,45,0.10), 0px 10px 15px -3px rgba(20,66,45,0.10)',
              }}
            >
              {isSubmitting ? '送信中...' : (
                <>パスワード再設定メールを送信<ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} /></>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* ホームへ戻る */}
      <Link
        href="/"
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
        ホームへ戻る
      </Link>

      {/* ══ 送信完了モーダル ══ */}
      {sent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          {/* オーバーレイ */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(26,28,25,0.40)',
            backdropFilter: 'blur(2px)',
          }} />

          {/* カード */}
          <div style={{
            position: 'relative', zIndex: 1,
            width: 384, maxWidth: '100%', padding: 32,
            background: 'white', borderRadius: 8,
            boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          }}>
            {/* アイコン */}
            <div style={{ paddingBottom: 24 }}>
              <div style={{
                width: 64, height: 64,
                background: 'rgba(20,66,45,0.10)', borderRadius: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Mail size={20} style={{ color: '#14422D' }} />
              </div>
            </div>

            {/* テキスト */}
            <div style={{
              textAlign: 'center', marginBottom: 32,
              color: '#1A1C19', fontSize: 18,
              fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '29.25px',
            }}>
              登録済みの場合、再設定リンクを送信<br />しました。<br />メールをご確認ください。
            </div>

            {/* ボタン */}
            <Link
              href="/login"
              style={{
                alignSelf: 'stretch', height: 48,
                background: 'linear-gradient(171deg, #14422D 0%, #2D5A43 100%)',
                borderRadius: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 16,
                fontFamily: 'Manrope, sans-serif', fontWeight: 500, lineHeight: '24px',
                textDecoration: 'none',
              }}
            >
              ログイン画面へ戻る
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
