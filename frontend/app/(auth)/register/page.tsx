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

// ── Zod schema ────────────────────────────────────────────────
const schema = z
  .object({
    role: z.enum(['customer', 'owner']),
    fullName: z.string().min(1, '氏名を入力してください'),
    email: z.string().email('メールアドレスの形式が正しくありません'),
    password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

// ── Shared input class ─────────────────────────────────────────
const inputClass =
  'w-full rounded-xl bg-[#E3E3DE] py-[18px] pl-12 pr-12 text-base text-[#1A1C19] outline-none ' +
  'placeholder:text-[#C0C9C1] placeholder:font-normal focus:ring-2 focus:ring-[#14422D]'

const labelClass =
  'block text-[12px] font-semibold uppercase tracking-[0.6px] text-[#414943] font-[var(--font-be-vietnam-pro)]'

// ── Page ──────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'owner'>('customer')
  const [serverError, setServerError]   = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  })

  const pickRole = (role: 'customer' | 'owner') => {
    setSelectedRole(role)
    setValue('role', role)
  }

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await axios.post('http://localhost:3000/auth/register', {
        fullName: data.fullName,
        email:    data.email,
        password: data.password,
        role:     data.role,
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
    <div className="relative flex h-screen overflow-hidden">

      {/* ══════════════════════════════════════════════════════
          左側：カフェ写真 + テキスト
      ══════════════════════════════════════════════════════ */}
      <div className="relative hidden w-1/2 lg:block bg-[#14422D]">
        {/* 背景画像 */}
        <Image
          src="/login_register_img/291cf934ac1b4d19a98f0b191a0efa2da4f4de86.png"
          alt="WorkSpot cafe"
          fill
          className="object-cover opacity-60"
          priority
        />

        {/* コンテンツ */}
        <div className="relative z-10 flex h-full flex-col px-16 pt-[82px] pb-16 justify-between">
          {/* ロゴ */}
          <p
            className="text-2xl text-white"
            style={{ fontFamily: 'var(--font-acme)', lineHeight: '32px' }}
          >
            WorkSpot
          </p>

          {/* キャッチコピー */}
          <div className="flex flex-col gap-6 max-w-[448px]">
            <h1
              className="text-[48px] font-extrabold text-white leading-[60px]"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              ハノイの中心で、あなたらしく働ける場所を。
            </h1>
            <p
              className="text-[18px] font-medium text-[#BCEECF] leading-[29px]"
              style={{ fontFamily: 'var(--font-be-vietnam-pro)' }}
            >
              WorkSpotは、リモートワーカーとカフェオーナーをつなぐサービスです。
            </p>
          </div>

          {/* ページドット */}
          <div className="flex items-center gap-4">
            <div className="h-1 w-12 rounded-full bg-white" />
            <div className="h-1 w-4 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          右側：フォーム
      ══════════════════════════════════════════════════════ */}
      <div
        className="flex w-full items-center justify-center overflow-y-auto bg-[#F4F4EF] px-8 lg:w-1/2"
        style={{ fontFamily: 'var(--font-be-vietnam-pro)' }}
      >
        <div className="w-full max-w-[448px] py-10 pt-10 flex flex-col gap-10">

          {/* タイトル */}
          <div className="flex flex-col gap-2">
            <h2
              className="text-[36px] font-medium text-[#1A1C19] leading-10"
              style={{ fontFamily: 'var(--font-manrope)' }}
            >
              アカウント作成
            </h2>
            <p className="text-[16px] font-medium text-[#414943] leading-6">
              WorkSpotを今すぐ始めましょう。
            </p>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

            {/* ── アカウント種別 ── */}
            <div className="flex flex-col gap-3">
              <label
                className="text-[14px] font-semibold uppercase text-[#1A1C19] tracking-[0.35px]"
              >
                アカウント種別
              </label>
              <div className="grid grid-cols-2">
                {/* リモートワーカー */}
                <button
                  type="button"
                  onClick={() => pickRole('customer')}
                  className={`flex items-center justify-center gap-2 rounded-xl h-[60px] px-4 text-[14px] font-semibold transition-all ${
                    selectedRole === 'customer'
                      ? 'bg-[#14422D] text-white'
                      : 'bg-[#E3E3DE] text-[#414943]'
                  }`}
                >
                  <User size={16} />
                  リモートワーカー
                </button>
                {/* カフェオーナー */}
                <button
                  type="button"
                  onClick={() => pickRole('owner')}
                  className={`flex items-center justify-center gap-2 rounded-xl h-[60px] px-4 text-[14px] font-extrabold transition-all ${
                    selectedRole === 'owner'
                      ? 'bg-[#14422D] text-white'
                      : 'bg-[#E3E3DE] text-[#414943]'
                  }`}
                >
                  <Store size={16} />
                  カフェオーナー
                </button>
              </div>
            </div>

            {/* ── フィールド群 ── */}
            <div className="flex flex-col gap-4 pb-4">

              {/* 氏名 */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>氏名</label>
                <div className="relative">
                  <IdCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C9C1]" />
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="山田 太郎"
                    className={inputClass}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>メールアドレス</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C9C1]" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@example.com"
                    className={inputClass}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* パスワード */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>パスワード</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C9C1]" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C0C9C1] hover:text-[#414943]"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* パスワード（確認） */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>パスワード（確認）</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C0C9C1]" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C0C9C1] hover:text-[#414943]"
                  >
                    {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* サーバーエラー */}
            {serverError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </p>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative flex w-full items-center justify-center gap-2 rounded-full py-5 text-[18px] font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{
                background: 'linear-gradient(90deg, #14422D 0%, #2D5A43 100%)',
                boxShadow:
                  '0px 8px 10px -6px rgba(20,66,45,0.10), 0px 20px 25px -5px rgba(20,66,45,0.10)',
              }}
            >
              {isSubmitting ? '処理中...' : (
                <>
                  アカウントを作成
                  <ArrowLeft size={16} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* ログインリンク */}
          <div className="flex items-center justify-center gap-1 pt-2">
            <span className="text-[16px] font-medium text-[#414943]">
              すでにアカウントをお持ちの方
            </span>
            <Link
              href="/login"
              className="text-[16px] font-semibold text-[#904C18] hover:underline"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          ホームに戻る — 左上に浮いているボタン
      ══════════════════════════════════════════════════════ */}
      <div className="absolute left-8 top-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[rgba(250,250,245,0.80)] px-4 py-2 text-[16px] font-medium text-[#14422D] backdrop-blur-[12px] transition hover:bg-[rgba(250,250,245,0.95)]"
          style={{
            boxShadow:
              '0px 4px 6px -4px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,0,0,0.05)',
          }}
        >
          <ArrowLeft size={16} />
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
