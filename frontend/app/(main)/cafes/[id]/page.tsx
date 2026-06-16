'use client';

import { JSX, useEffect, useState, Suspense, MouseEvent } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CafeService } from '@/services/cafe.service';
import { facilityConfig } from '@/utils/facilityConfig';
import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const toAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${API_URL}${path}`;
};


// ── Icon components (inline SVG đơn giản) ──────────────────────────
const icons: Record<string, JSX.Element> = {
  wifi: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>,
  zap: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  wind: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>,
  coffee: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
  'volume-x': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>,
  monitor: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  slash: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
  'cigarette-off': <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 12H7" /><path d="M22 12v4" /><path d="M7 12v4" /><path d="M18 12v4" /><path d="M2 12v4h5" /><path d="m2 2 20 20" /><path d="M15 8c0-2-2-2-2-4" /><path d="M19 8c0-3-2-3-2-5" /></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  sparkles: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 4.8L5 10l5.1 2.2L12 17l1.9-4.8L19 10l-5.1-2.2L12 3Z" /><path d="m5 3-.8 2.2L2 6l2.2.8L5 9l.8-2.2L8 6l-2.2-.8L5 3Z" /></svg>,
};

// ── Star rating display ────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#D97706', fontSize: 18, letterSpacing: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

function PhotoGalleryModal({ images, initialIndex, onClose }: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const goToPrev = () => setActiveIndex(i => i === 0 ? images.length - 1 : i - 1);
  const goToNext = () => setActiveIndex(i => i === images.length - 1 ? 0 : i + 1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [images.length]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>

      {/* Nút đóng */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
      >×</button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.75)', fontSize: 16, fontFamily: 'Manrope, sans-serif' }}>
        {activeIndex + 1} / {images.length}
      </div>

      {/* Main image + prev/next — container không stopPropagation để click vùng tối vẫn đóng modal */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '60px 100px 20px', position: 'relative' }}>

        <button onClick={e => { e.stopPropagation(); goToPrev(); }} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>

        <img src={images[activeIndex]} alt={`Photo ${activeIndex + 1}`}
          onClick={e => e.stopPropagation()}
          style={{ maxHeight: 'calc(100vh - 180px)', maxWidth: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default' }} />

        <button onClick={e => { e.stopPropagation(); goToNext(); }} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      </div>

      {/* Thumbnail strip */}
      <div style={{ width: '100%', padding: '12px 24px 28px', display: 'flex', justifyContent: 'center', gap: 10, overflowX: 'auto' }}>
        {images.map((img, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setActiveIndex(i); }}
            style={{ width: 70, height: 50, flexShrink: 0, borderRadius: 6, overflow: 'hidden', border: i === activeIndex ? '2px solid white' : '2px solid transparent', opacity: i === activeIndex ? 1 : 0.45, cursor: 'pointer', padding: 0, background: 'none' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </div>
  );
}





const REALTIME_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  available: { label: '空きあり', dot: '#10B981', bg: '#D1FAE5', text: '#065F46' },
  normal: { label: '普通', dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
  busy: { label: '混雑', dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
};

// ── Main Page ──────────────────────────────────────────────────────
function CafeDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdminView = searchParams.get('view') === 'admin';
  const [cafe, setCafe] = useState<any>(null);

  const handleWriteReview = (e: MouseEvent<HTMLAnchorElement>) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    if (!token) {
      e.preventDefault();
      router.push('/login');
    }
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [reviewModalImages, setReviewModalImages] = useState<string[]>([]);
  const [reviewModalIndex, setReviewModalIndex] = useState(0);

  const openModal = (index: number) => {
    setModalStartIndex(index);
    setModalOpen(true);
  };

  const openReviewModal = (images: string[], index: number) => {
    setReviewModalImages(images.map(img =>
      img.startsWith('blob:') || img.startsWith('http') ? img : `${API_URL}${img}`
    ));
    setReviewModalIndex(index);
  };

  const fetchCafe = () => {
    if (!id) return;
    CafeService.getCafeById(id)
      .then(setCafe)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCafe(); }, [id]);

  // ── Loading ──
  if (loading) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#737770', fontFamily: 'Manrope, sans-serif' }}>
        読み込み中...
      </div>
    </>
  );

  // ── Error ──
  if (error || !cafe) return (
    <>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 16 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', color: '#737770' }}>カフェが見つかりませんでした</p>
        <Link href="/" style={{ color: '#14422D', fontFamily: 'Manrope, sans-serif' }}>← トップに戻る</Link>
      </div>
    </>
  );

  const { metadata, reviews = [], operatingHours = [], facilities = [], images = [] } = cafe;
  const sortedReviews = [...reviews].sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);
  const hasHiddenReviews = sortedReviews.length > visibleReviews.length;

  // Tính giờ đóng cửa hôm nay (0=Sun, 1=Mon, ...)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayHours = operatingHours.find((h: any) => h.dayOfWeek === todayName);
  const closingLabel = !todayHours ? '--'
    : todayHours.isDayOff ? '定休日'
      : `${todayHours.closeTime}まで営業`;

  return (
    <>
      {!modalOpen && reviewModalImages.length === 0 && <Navbar />}
      {modalOpen && images.length > 0 && (
        <PhotoGalleryModal
          images={images}
          initialIndex={modalStartIndex}
          onClose={() => setModalOpen(false)}
        />
      )}
      {reviewModalImages.length > 0 && (
        <PhotoGalleryModal
          images={reviewModalImages}
          initialIndex={reviewModalIndex}
          onClose={() => setReviewModalImages([])}
        />
      )}


      <div style={{
        background: '#FAFAF5',
        minHeight: '100vh',
        fontFamily: 'Manrope, sans-serif',
      }}>
        <main style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: '40px 48px 128px',
        }}>

          {/* ════════════════════════════════════
              1. PHOTO GALLERY
          ════════════════════════════════════ */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '263px 263px',
            gap: 16,
            marginBottom: 32,
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Ảnh lớn bên trái – chiếm 2 hàng */}
            <div style={{ gridRow: '1 / 3', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openModal(0)}>
              <img
                src={images[0] || '/placeholder.jpg'}
                alt={cafe.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Ảnh nhỏ trên phải */}
            <div style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => openModal(1)}>
              <img
                src={images[1] || '/placeholder.jpg'}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Ảnh nhỏ dưới phải + overlay button */}
            <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => openModal(2)}>
              <img
                src={images[2] || '/placeholder.jpg'}
                alt=""
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: images.length > 2 ? 'brightness(0.5)' : 'none'
                }}
              />
              {images.length > 2 && (
                <button
                  onClick={() => openModal(0)}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: 16, fontWeight: 600,
                    padding: '10px 22px', borderRadius: 9999,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'Manrope, sans-serif',
                  }}>
                  全{images.length}枚の写真を見る
                </button>
              )}
            </div>
          </section>

          {/* ════════════════════════════════════
              2. CAFE HEADER
          ════════════════════════════════════ */}
          <section style={{ marginBottom: 48 }}>
            {/* Tên + badge trạng thái */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <h1 style={{
                fontSize: 52, fontWeight: 800, color: '#14422D',
                letterSpacing: -2.5, lineHeight: 1.1, margin: 0,
                fontFamily: 'Manrope, sans-serif',
              }}>
                {cafe.name}
              </h1>
              {(() => {
                const rt = REALTIME_CONFIG[cafe.realtimeStatus] ?? REALTIME_CONFIG['normal'];
                return (
                  <span style={{
                    background: rt.bg,
                    border: `1px solid ${rt.dot}33`,
                    borderRadius: 9999,
                    padding: '5px 14px',
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: 0.8, color: rt.text,
                    display: 'flex', alignItems: 'center', gap: 6,
                    flexShrink: 0,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: rt.dot, display: 'inline-block', flexShrink: 0 }} />
                    {rt.label}
                  </span>
                );
              })()}
            </div>

            {/* Meta: rating · địa chỉ · giờ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#D97706', fontSize: 20 }}>★</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: '#1a1c19' }}>{metadata.averageRating}</span>
                <span style={{ fontSize: 16, color: '#737770' }}>({metadata.reviewCount}件のレビュー)</span>
              </div>

              {/* Địa chỉ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="#737770" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: 17, fontWeight: 500, color: '#737770' }}>{cafe.address}</span>
              </div>

              {/* Giờ mở cửa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#737770" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: 17, fontWeight: 500, color: '#737770' }}>{closingLabel}</span>
              </div>
            </div>

            {/* 地図で表示 button */}
            {!isAdminView && cafe.latitude && cafe.longitude && (
              <div style={{ marginTop: 24 }}>
                <Link
                  href={`/cafes/search?lat=${cafe.latitude}&lng=${cafe.longitude}&selectedId=${id}&showRoute=1`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '12px 24px',
                    background: 'white',
                    border: '1.5px solid #C0C9C1',
                    borderRadius: 9999,
                    fontSize: 16, fontWeight: 700, color: '#14422D',
                    textDecoration: 'none',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14422D" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  地図で表示
                </Link>
              </div>
            )}
          </section>

          {/* ════════════════════════════════════
              3. MÔ TẢ
          ════════════════════════════════════ */}
          <section style={{
            background: '#F4F4EF',
            borderRadius: 20,
            padding: '40px 48px',
            marginBottom: 64,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 2, background: '#14422D', borderRadius: 2 }} />
              <h2 style={{ fontSize: 26, fontWeight: 600, color: '#14422D', margin: 0, fontFamily: 'Manrope, sans-serif' }}>
                カフェ詳細
              </h2>
            </div>
            <p style={{
              fontSize: 19, lineHeight: 1.75, color: '#57736A',
              margin: 0, maxWidth: 680,
              fontFamily: 'Manrope, sans-serif',
            }}>
              {cafe.description || 'No description available.'}
            </p>
          </section>

          {/* ════════════════════════════════════
              4. FACILITIES
          ════════════════════════════════════ */}
          <section style={{ marginBottom: 80 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 600, color: '#14422D',
              marginBottom: 28, fontFamily: 'Manrope, sans-serif',
            }}>
              提供サービス・設備
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}>
              {facilities.map((f: string) => {
                const cfg = facilityConfig[f];
                if (!cfg) return null;
                return (
                  <article key={f} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '20px 24px',
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid rgba(192,201,193,0.15)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 44, height: 44, flexShrink: 0,
                      background: 'rgba(20,66,45,0.08)',
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#14422D',
                    }}>
                      {icons[cfg.icon] || icons['clock']}
                    </div>
                    {/* Text */}
                    <div>
                      <h3 style={{
                        fontSize: 17, fontWeight: 700,
                        color: '#1a1c19', margin: '0 0 4px',
                        fontFamily: 'Manrope, sans-serif',
                      }}>
                        {cfg.label}
                      </h3>
                      <p style={{
                        fontSize: 15, color: '#737770',
                        margin: 0, lineHeight: 1.6,
                        fontFamily: 'Manrope, sans-serif',
                      }}>
                        {cfg.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ════════════════════════════════════
              5. REVIEWS
          ════════════════════════════════════ */}
          <section style={{
            borderTop: '1px solid rgba(192,201,193,0.15)',
            paddingTop: 64,
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 48,
            }}>
              <h2 style={{
                fontSize: 28, fontWeight: 500, color: '#14422D',
                margin: 0, fontFamily: 'Manrope, sans-serif',
              }}>
                ユーザーレビュー
              </h2>
              {!isAdminView && (
                <Link
                  href={`/cafes/${id}/reviews`} // Đường dẫn tới trang review mới của bạn
                  onClick={handleWriteReview}
                  style={{
                    background: 'linear-gradient(135deg, #14422D 0%, #2D5A43 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '12px 28px',
                    fontSize: 17,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif',
                    boxShadow: '0 4px 12px rgba(20,66,45,0.25)',
                    textDecoration: 'none',       // Xóa gạch chân mặc định của thẻ a
                    display: 'inline-flex',       // Căn giữa text trong thẻ Link
                    alignItems: 'center',
                  }}>
                  レビューを書く
                </Link>
              )}
            </div>

            {/* Review list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {visibleReviews.map((review: any) => (
                <article key={review.id} style={{
                  paddingBottom: 48, marginBottom: 48,
                  borderBottom: '1px solid rgba(192,201,193,0.1)',
                }}>
                  {/* User info row */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {/* Avatar */}
                      {toAbsoluteUrl(review.user?.avatar) ? (
                        <img src={toAbsoluteUrl(review.user?.avatar)!} alt="" style={{
                          width: 52, height: 52, borderRadius: 9999,
                          objectFit: 'cover',
                          border: '2px solid rgba(20,66,45,0.1)',
                        }} />
                      ) : (
                        <div style={{
                          width: 52, height: 52, borderRadius: 9999,
                          background: 'linear-gradient(135deg, #14422D, #2D5A43)',
                          color: 'white', fontWeight: 700, fontSize: 18,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Manrope, sans-serif',
                          flexShrink: 0,
                        }}>
                          {review.user?.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      {/* Name & job */}
                      <div>
                        <p style={{ margin: '0 0 3px', fontSize: 18, fontWeight: 600, color: '#1a1c19', fontFamily: 'Manrope, sans-serif' }}>
                          {review.user?.fullName ?? '匿名'}
                        </p>
                        <p style={{ margin: 0, fontSize: 15, color: '#7A817E', fontFamily: 'Manrope, sans-serif' }}>
                          {review.user?.jobTitle ?? 'ユーザー'} · {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    {/* Stars */}
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p style={{
                      fontSize: 19, color: '#57736A', lineHeight: 1.75,
                      margin: '0 0 20px', fontFamily: 'Manrope, sans-serif',
                    }}>
                      {review.comment}
                    </p>
                  )}

                  {/* Review images */}
                  {review.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {review.images.slice(0, 4).map((img: string, i: number) => (
                        <img
                          key={i}
                          src={toAbsoluteUrl(img)!}
                          alt=""
                          onClick={() => openReviewModal(review.images, i)}
                          style={{
                            width: 148, height: 148,
                            borderRadius: 12, objectFit: 'cover',
                            border: '1px solid rgba(192,201,193,0.2)',
                            cursor: 'pointer',
                            transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        />
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {hasHiddenReviews && (
              <button
                onClick={() => setShowAllReviews(true)}
                style={{
                  width: '100%', padding: '20px 0',
                  background: '#E8E8E3', border: 'none', borderRadius: 14,
                  fontSize: 18, fontWeight: 600, color: '#14422D',
                  cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                すべてのレビューを見る ({metadata.reviewCount}件)
              </button>
            )}
          </section>

        </main>
      </div>
    </>
  );
}

export default function CafeDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#737770', fontFamily: 'Manrope, sans-serif' }}>
        読み込み中...
      </div>
    }>
      <CafeDetailContent />
    </Suspense>
  );
}
