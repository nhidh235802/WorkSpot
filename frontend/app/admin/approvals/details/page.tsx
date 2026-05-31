'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    MapPin,
    Clock,
    Wifi,
    Plug,
    Monitor,
    X,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Star,
    User,
    Calendar,
} from 'lucide-react'
import { AdminService, AdminCafeItem } from '@/services/admin.service'
import { CafeService } from '@/services/cafe.service'
import { toast, Toaster } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function toAbsUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${API_URL}${path}`
}

function formatJpDate(iso: string) {
    try {
        const d = new Date(iso)
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    } catch {
        return iso
    }
}

const FACILITY_LABELS: Record<string, { label: string; icon: React.ComponentType<any> }> = {
    wifi: { label: 'Wi-Fi', icon: Wifi },
    socket: { label: 'コンセント', icon: Plug },
    workspace: { label: 'ワークスペース', icon: Monitor },
    desk: { label: 'ワークデスク', icon: Monitor },
    snack: { label: 'スナック', icon: Monitor },
    cleanliness: { label: '清潔', icon: Monitor },
}

// ─────────────────────────────────────────────────
//  Custom toast (same style as approvals list page)
// ─────────────────────────────────────────────────
function useCustomToast() {
    const show = useCallback(
        (type: 'loading' | 'success' | 'error', message: string, toastId?: string | number) => {
            const cfg = {
                loading: {
                    bg: 'rgba(255,255,255,0.85)',
                    text: '#414943',
                    border: 'rgba(0,0,0,0.05)',
                    icon: <Loader2 size={18} className="animate-spin" color="#14422D" />,
                },
                success: {
                    bg: 'rgba(230,244,234,0.90)',
                    text: '#137333',
                    border: 'rgba(16,185,129,0.15)',
                    icon: <CheckCircle2 size={18} color="#10B981" />,
                },
                error: {
                    bg: 'rgba(254,226,226,0.90)',
                    text: '#991B1B',
                    border: 'rgba(239,68,68,0.15)',
                    icon: <AlertTriangle size={18} color="#EF4444" />,
                },
            }[type]

            const content = (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 20px',
                        background: cfg.bg,
                        borderRadius: 14,
                        border: `1px solid ${cfg.border}`,
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: '0px 16px 32px rgba(26,28,25,0.08), 0px 4px 8px rgba(26,28,25,0.02)',
                        width: 340,
                        boxSizing: 'border-box' as const,
                    }}
                >
                    {cfg.icon}
                    <div
                        style={{
                            color: cfg.text,
                            fontSize: 13,
                            fontFamily: 'Manrope, sans-serif',
                            fontWeight: 600,
                            lineHeight: '18px',
                            flex: 1,
                        }}
                    >
                        {message}
                    </div>
                </div>
            )

            if (type === 'loading') return toast.custom(() => content, { duration: Infinity })
            if (toastId) toast.dismiss(toastId)
            return toast.custom(() => content, { duration: 3000 })
        },
        []
    )
    return show
}

// ─────────────────────────────────────────────────
//  Photo Gallery Modal (same as cafes/[id]/page)
// ─────────────────────────────────────────────────
function PhotoGalleryModal({ images, initialIndex, onClose }: {
    images: string[]
    initialIndex: number
    onClose: () => void
}) {
    const [activeIndex, setActiveIndex] = useState(initialIndex)

    const goToPrev = () => setActiveIndex(i => i === 0 ? images.length - 1 : i - 1)
    const goToNext = () => setActiveIndex(i => i === images.length - 1 ? 0 : i + 1)

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrev()
            if (e.key === 'ArrowRight') goToNext()
            if (e.key === 'Escape') onClose()
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKey)
        }
    }, [images.length])

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
        >
            {/* Close */}
            <button
                onClick={(e) => { e.stopPropagation(); onClose() }}
                style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
            >×</button>

            {/* Counter */}
            <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'Manrope, sans-serif' }}>
                {activeIndex + 1} / {images.length}
            </div>

            {/* Main image */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '60px 100px 20px', position: 'relative' }}>
                <button onClick={e => { e.stopPropagation(); goToPrev() }}
                    style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >‹</button>

                <img
                    src={images[activeIndex]}
                    alt={`Photo ${activeIndex + 1}`}
                    onClick={e => e.stopPropagation()}
                    style={{ maxHeight: 'calc(100vh - 180px)', maxWidth: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default' }}
                />

                <button onClick={e => { e.stopPropagation(); goToNext() }}
                    style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >›</button>
            </div>

            {/* Thumbnail strip */}
            <div style={{ width: '100%', padding: '12px 24px 28px', display: 'flex', justifyContent: 'center', gap: 10, overflowX: 'auto' }}>
                {images.map((img, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setActiveIndex(i) }}
                        style={{ width: 70, height: 50, flexShrink: 0, borderRadius: 6, overflow: 'hidden', border: i === activeIndex ? '2px solid white' : '2px solid transparent', opacity: i === activeIndex ? 1 : 0.45, cursor: 'pointer', padding: 0, background: 'none' }}
                    >
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────
export default function ApprovalDetailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const showToast = useCustomToast()

    const cafeId = searchParams.get('id')

    const [cafe, setCafe] = useState<AdminCafeItem | null>(null)
    const [cafeDetail, setCafeDetail] = useState<any>(null)
    const [images, setImages] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [acting, setActing] = useState(false)

    const [rejectModal, setRejectModal] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [approveModal, setApproveModal] = useState(false)

    const [modalOpen, setModalOpen] = useState(false)
    const [modalStartIndex, setModalStartIndex] = useState(0)

    const openModal = (index: number) => { setModalStartIndex(index); setModalOpen(true) }

    // ── Fetch cafe detail ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!cafeId) { setError('カフェIDが見つかりません'); setLoading(false); return }

        setLoading(true)
        Promise.all([
            AdminService.getCafesForAdmin({ status: 'pending' }),
            CafeService.getCafeById(cafeId).catch(() => null),  // fallback if not accessible
        ])
            .then(([adminData, detail]) => {
                const found = adminData.items.find((c) => c.id === cafeId)
                if (!found) throw new Error('カフェが見つかりませんでした')
                setCafe(found)
                setCafeDetail(detail)

                // Build image list: prefer full cafe images, fallback to avatar
                const rawImages: string[] = detail?.images ?? []
                const absImages = rawImages
                    .map((p: string) => toAbsUrl(p))
                    .filter((u): u is string => Boolean(u))

                if (absImages.length > 0) {
                    setImages(absImages)
                } else {
                    const av = toAbsUrl(found.avatar)
                    setImages(av ? [av] : [])
                }
            })
            .catch((err) => setError(err.message || 'データを読み込めませんでした'))
            .finally(() => setLoading(false))
    }, [cafeId])

    // ── Approve ────────────────────────────────────────────────────────────────
    const executeApprove = async () => {
        if (!cafe) return
        setApproveModal(false)
        const tid = showToast('loading', `${cafe.name} の申請を承認しています...`)
        setActing(true)
        try {
            await AdminService.approveCafe(cafe.id)
            showToast('success', `${cafe.name} の掲載申請を承認しました。`, tid)
            setTimeout(() => router.push('/admin/approvals'), 1200)
        } catch (err: any) {
            showToast('error', err.message || '承認処理に失敗しました。', tid)
        } finally {
            setActing(false)
        }
    }

    // ── Reject ─────────────────────────────────────────────────────────────────
    const executeReject = async () => {
        if (!cafe) return
        const finalReason = rejectReason.trim() || '申請内容に不備があります'
        setRejectModal(false)
        const tid = showToast('loading', `${cafe.name} の却下処理を実行中...`)
        setActing(true)
        try {
            await AdminService.rejectCafe(cafe.id, finalReason)
            showToast('success', `${cafe.name} の申請を却下しました。`, tid)
            setTimeout(() => router.push('/admin/approvals'), 1200)
        } catch (err: any) {
            showToast('error', err.message || '却下処理に失敗しました。', tid)
        } finally {
            setActing(false)
        }
    }

    // ── Loading / Error states ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAFAF5' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <Loader2 size={36} color="#14422D" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#414943', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>読み込み中...</span>
                </div>
                <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
            </div>
        )
    }

    if (error || !cafe) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAFAF5' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <AlertTriangle size={40} color="#BA1A1A" />
                    <div style={{ color: '#BA1A1A', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 600 }}>
                        {error || 'カフェが見つかりませんでした'}
                    </div>
                    <button
                        onClick={() => router.push('/admin/approvals')}
                        style={{
                            padding: '10px 24px', background: '#14422D', color: 'white',
                            borderRadius: 9999, border: 'none', cursor: 'pointer',
                            fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 500,
                        }}
                    >
                        承認一覧に戻る
                    </button>
                </div>
            </div>
        )
    }

    const ownerName = cafe.owner?.fullName ?? '不明'
    const appliedAt = formatJpDate(cafe.createdAt)
    const facilities = cafe.facilities ?? []

    const getHourString = (days: string[]) => {
        if (!cafeDetail?.operatingHours) return null
        const match = cafeDetail.operatingHours.find((h: any) => days.includes(h.dayOfWeek))
        if (!match) return null
        if (match.isDayOff) return '定休日'
        const open = match.openTime ? match.openTime.substring(0, 5) : ''
        const close = match.closeTime ? match.closeTime.substring(0, 5) : ''
        if (!open || !close) return null
        return `${open} - ${close}`
    }

    const weekdayStr = cafeDetail ? (getHourString(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']) ?? '08:00 - 21:00') : '08:00 - 21:00'
    const weekendStr = cafeDetail ? (getHourString(['saturday', 'sunday']) ?? '09:00 - 22:00') : '09:00 - 22:00'

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{ style: { background: 'transparent', border: 'none', boxShadow: 'none' } }}
            />

            <div style={{ minHeight: '100vh', background: '#FAFAF5', padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── Back + Title bar ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>

                    {/* Left: back + name + status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                            onClick={() => router.push('/admin/approvals')}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#6B7280', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                                padding: '4px 0', marginBottom: 4,
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#14422D' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
                        >
                            <ArrowLeft size={15} />
                            承認一覧に戻る
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <h1 style={{
                                margin: 0,
                                color: '#14422D',
                                fontSize: 28,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 800,
                                lineHeight: '34px',
                            }}>
                                {cafe.name}
                            </h1>

                            {/* Status badge */}
                            <span style={{
                                padding: '3px 10px',
                                background: '#FEF3C7',
                                borderRadius: 4,
                                color: '#B45309',
                                fontSize: 10,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.8,
                            }}>
                                承認待ち
                            </span>
                        </div>

                        {cafe.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                <MapPin size={14} color="#64748B" />
                                <span style={{ color: '#64748B', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
                                    {cafe.address}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right: Action buttons */}
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0, paddingTop: 8 }}>
                        <button
                            onClick={() => { setRejectReason(''); setRejectModal(true) }}
                            disabled={acting}
                            style={{
                                padding: '10px 28px',
                                borderRadius: 9999,
                                border: '1.5px solid #FECACA',
                                background: 'white',
                                color: '#DC2626',
                                fontSize: 15,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 600,
                                cursor: acting ? 'not-allowed' : 'pointer',
                                opacity: acting ? 0.5 : 1,
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { if (!acting) { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' } }}
                            onMouseLeave={(e) => { if (!acting) { (e.currentTarget as HTMLElement).style.background = 'white' } }}
                        >
                            却下
                        </button>

                        <button
                            onClick={() => setApproveModal(true)}
                            disabled={acting}
                            style={{
                                padding: '10px 32px',
                                borderRadius: 9999,
                                border: 'none',
                                background: acting ? '#7F8181' : '#14422D',
                                color: 'white',
                                fontSize: 15,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 600,
                                cursor: acting ? 'not-allowed' : 'pointer',
                                opacity: acting ? 0.7 : 1,
                                boxShadow: '0px 4px 6px -4px rgba(20,66,45,0.20), 0px 10px 15px -3px rgba(20,66,45,0.20)',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { if (!acting) { (e.currentTarget as HTMLElement).style.background = '#1E5C3A' } }}
                            onMouseLeave={(e) => { if (!acting) { (e.currentTarget as HTMLElement).style.background = '#14422D' } }}
                        >
                            {acting ? '処理中...' : '承認'}
                        </button>
                    </div>
                </div>

                {/* ── Content grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Photo gallery modal */}
                        {modalOpen && images.length > 0 && (
                            <PhotoGalleryModal
                                images={images}
                                initialIndex={modalStartIndex}
                                onClose={() => setModalOpen(false)}
                            />
                        )}

                        {/* Photo gallery grid */}
                        <section style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gridTemplateRows: '263px 263px',
                            gap: 16,
                            borderRadius: 16,
                            overflow: 'hidden',
                        }}>
                            {/* Large left image – spans 2 rows */}
                            <div style={{ gridRow: '1 / 3', overflow: 'hidden', cursor: images.length > 0 ? 'pointer' : 'default' }} onClick={() => images.length > 0 && openModal(0)}>
                                {images[0] ? (
                                    <img src={images[0]} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#F1F0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8A29E', fontFamily: 'Manrope, sans-serif', fontSize: 14 }}>写真がありません</div>
                                )}
                            </div>

                            {/* Top-right small image */}
                            <div style={{ overflow: 'hidden', cursor: images.length > 1 ? 'pointer' : 'default' }} onClick={() => images.length > 1 && openModal(1)}>
                                {images[1] ? (
                                    <img src={images[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#F1F0EB' }} />
                                )}
                            </div>

                            {/* Bottom-right small image + overlay button */}
                            <div style={{ position: 'relative', overflow: 'hidden', cursor: images.length > 2 ? 'pointer' : 'default' }} onClick={() => images.length > 2 && openModal(2)}>
                                {images[2] ? (
                                    <img
                                        src={images[2]}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: images.length > 3 ? 'brightness(0.5)' : 'none' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#F1F0EB' }} />
                                )}
                                {images.length > 3 && (
                                    <button
                                        onClick={() => openModal(0)}
                                        style={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            background: 'rgba(255,255,255,0.18)',
                                            border: '1px solid rgba(255,255,255,0.35)',
                                            backdropFilter: 'blur(8px)',
                                            color: 'white', fontSize: 14, fontWeight: 500,
                                            padding: '10px 22px', borderRadius: 9999,
                                            cursor: 'pointer', whiteSpace: 'nowrap',
                                            fontFamily: 'Manrope, sans-serif',
                                        }}
                                    >
                                        全{images.length}枚の写真を見る
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* Store description */}
                        <section style={{
                            padding: 32,
                            background: 'white',
                            borderRadius: 20,
                            boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                            outline: '1px solid #F1F5F9',
                            outlineOffset: '-1px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                        }}>
                            <h2 style={{
                                margin: 0,
                                color: '#14422D',
                                fontSize: 18,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 700,
                                lineHeight: '26px',
                            }}>
                                店の特徴
                            </h2>
                            <p style={{
                                margin: 0,
                                color: '#475569',
                                fontSize: 15,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 500,
                                lineHeight: '26px',
                            }}>
                                {cafe.name} は、ハノイに位置するワークフレンドリーなカフェです。
                                {facilities.length > 0
                                    ? ` 高速Wi-Fiや豊富なコンセントなど、${facilities.length}種類の設備が整っています。`
                                    : ' 快適な作業環境を提供しています。'}
                                デジタルノマドや長期プロジェクトに取り組む専門家に最適なスペースです。
                            </p>
                        </section>

                        {/* Opening hours */}
                        <section style={{
                            padding: 32,
                            background: 'white',
                            borderRadius: 20,
                            boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                            outline: '1px solid #F1F5F9',
                            outlineOffset: '-1px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}>
                            <h2 style={{
                                margin: 0,
                                color: '#14422D',
                                fontSize: 18,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 700,
                            }}>
                                営業時間
                            </h2>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    background: '#F8FAFC',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Clock size={20} color="#475569" />
                                </div>
                                <div style={{ display: 'flex', gap: 250 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <span style={{
                                            color: '#64748B',
                                            fontSize: 13,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 500,
                                        }}>
                                            平日
                                        </span>
                                        <span style={{
                                            color: '#1E293B',
                                            fontSize: 16,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 700,
                                        }}>
                                            {weekdayStr}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <span style={{
                                            color: '#64748B',
                                            fontSize: 13,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 500,
                                        }}>
                                            土日祝
                                        </span>
                                        <span style={{
                                            color: '#1E293B',
                                            fontSize: 16,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 700,
                                        }}>
                                            {weekendStr}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Rating overview (if available) */}
                        {(cafe.avgRating > 0 || cafe.reviewCount > 0) && (
                            <section style={{
                                padding: 32,
                                background: 'white',
                                borderRadius: 20,
                                boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                                outline: '1px solid #F1F5F9',
                                outlineOffset: '-1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 24,
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Star size={22} color="#F59E0B" fill="#F59E0B" />
                                        <span style={{
                                            color: '#1E293B',
                                            fontSize: 28,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 800,
                                        }}>
                                            {cafe.avgRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <span style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
                                        {cafe.reviewCount}件のレビュー
                                    </span>
                                </div>
                                <div style={{ width: 1, height: 48, background: '#E2E8F0' }} />
                                <span style={{ color: '#475569', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
                                    ユーザーによる平均評価
                                </span>
                            </section>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Owner Avatar */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 9999,
                                    overflow: 'hidden',
                                    outline: '3px solid white',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                    background: 'linear-gradient(135deg, #14422D 0%, #2D5A43 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {toAbsUrl((cafe.owner as any)?.avatar) ? (
                                        <img
                                            src={toAbsUrl((cafe.owner as any)?.avatar)!}
                                            alt={ownerName}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{
                                            color: 'white',
                                            fontSize: 22,
                                            fontFamily: 'Manrope, sans-serif',
                                            fontWeight: 700,
                                            lineHeight: 1,
                                            userSelect: 'none',
                                        }}>
                                            {ownerName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#1E293B', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                                        {ownerName}
                                    </div>
                                    {cafe.owner?.email && (
                                        <div style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'Manrope, sans-serif', fontWeight: 500, marginTop: 2 }}>
                                            {cafe.owner.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Registration info */}
                        <section style={{
                            padding: 24,
                            background: 'white',
                            borderRadius: 20,
                            boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                            outline: '1px solid #F1F5F9',
                            outlineOffset: '-1px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}>
                            <span style={{
                                color: '#94A3B8',
                                fontSize: 10,
                                fontFamily: 'Manrope, sans-serif',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                            }}>
                                登録情報
                            </span>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Owner */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingBottom: 16,
                                    borderBottom: '1px solid #F8FAFC',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ color: '#64748B', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
                                            オーナー名
                                        </span>
                                    </div>
                                    <span style={{ color: '#1E293B', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                                        {ownerName}
                                    </span>
                                </div>
                                {/* Applied date */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ color: '#64748B', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
                                            申請日
                                        </span>
                                    </div>
                                    <span style={{ color: '#1E293B', fontSize: 13, fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                                        {appliedAt}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Facilities / Space analysis */}
                        {facilities.length > 0 && (
                            <section style={{
                                padding: 24,
                                background: 'white',
                                borderRadius: 20,
                                boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                                outline: '1px solid #F1F5F9',
                                outlineOffset: '-1px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}>
                                <span style={{
                                    color: '#94A3B8',
                                    fontSize: 10,
                                    fontFamily: 'Manrope, sans-serif',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1.2,
                                }}>
                                    空間分析
                                </span>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {facilities.map((f) => {
                                        const meta = FACILITY_LABELS[f]
                                        const label = meta?.label ?? f
                                        const Icon = meta?.icon ?? Monitor
                                        return (
                                            <div
                                                key={f}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '6px 14px',
                                                    background: '#FFF7ED',
                                                    borderRadius: 9999,
                                                    color: '#C2410C',
                                                }}
                                            >
                                                <Icon size={13} color="#C2410C" />
                                                <span style={{ fontSize: 12, fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>
                                                    {label}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 却下モーダル ── */}
            {rejectModal && (
                <div
                    onClick={() => setRejectModal(false)}
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
                            borderRadius: 20,
                            position: 'relative',
                            display: 'flex', flexDirection: 'column', gap: 24,
                        }}
                    >
                        <button
                            onClick={() => setRejectModal(false)}
                            style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#717973' }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ color: '#14422D', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>
                                却下理由の入力
                            </div>
                            <div style={{ color: '#414943', fontSize: 14, fontFamily: 'Manrope, sans-serif', lineHeight: '22px' }}>
                                「{cafe.name}」の申請を却下する理由をオーナーに通知します。
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
                                color: '#1A1C19', fontSize: 15, fontFamily: 'Manrope, sans-serif', lineHeight: '24px',
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                onClick={() => setRejectModal(false)}
                                style={{
                                    padding: '10px 24px',
                                    background: '#E8E8E3', borderRadius: 9999, border: 'none', cursor: 'pointer',
                                    color: '#1A1C19', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 500,
                                }}
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={executeReject}
                                disabled={!rejectReason.trim()}
                                style={{
                                    padding: '10px 28px',
                                    background: rejectReason.trim() ? '#BA1A1A' : '#7F8181',
                                    boxShadow: rejectReason.trim() ? '0px 4px 12px rgba(186,26,26,0.20)' : 'none',
                                    borderRadius: 9999, border: 'none',
                                    cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                                    color: 'white', fontSize: 14, fontFamily: 'Manrope, sans-serif', fontWeight: 700,
                                    opacity: rejectReason.trim() ? 1 : 0.5,
                                    transition: 'all 0.15s',
                                }}
                            >
                                却下を確定
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 承認確認モーダル ── */}
            {approveModal && (
                <div
                    onClick={() => setApproveModal(false)}
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
                                        onClick={() => setApproveModal(false)}
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
        </>
    )
}