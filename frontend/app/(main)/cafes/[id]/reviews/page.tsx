'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, MapPin, Clock, Upload, X, Check, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { CafeService } from '@/services/cafe.service';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const toAbsoluteUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${API_URL}${path}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface OperatingHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isDayOff: boolean;
}

interface CafeDetail {
  id: string;
  name: string;
  address: string;
  images?: string[];
  operatingHours?: OperatingHour[];
  metadata?: {
    averageRating: number;
    reviewCount: number;
  };
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function getTodayHours(operatingHours: OperatingHour[] | undefined): string {
  if (!operatingHours || operatingHours.length === 0) return '--';

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayHours = operatingHours.find((h) => h.dayOfWeek === todayName);

  if (!todayHours) return '--';
  if (todayHours.isDayOff) return '定休日';
  return `${todayHours.openTime}～${todayHours.closeTime}`;
}

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (v: number) => void;
  error: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            aria-label={`${star}星`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.15s ease',
              transform: hovered === star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Star
              size={32}
              fill={star <= (hovered || value) ? '#904C18' : 'none'}
              color={
                star <= (hovered || value)
                  ? '#904C18'
                  : error
                    ? '#DC2626'
                    : '#D6D3D1'
              }
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 18, color: '#414943', paddingLeft: 8 }}>
          {value}.0 / 5.0
        </span>
      )}
      {error && value === 0 && (
        <span style={{ color: '#DC2626', fontSize: 13, fontFamily: 'Manrope, sans-serif' }}>
          評価を選択してください
        </span>
      )}
    </div>
  );
}

// ─── Discard Modal Component ──────────────────────────────────────────────────
function DiscardModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '40px 32px', width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F4F4EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={28} color="#904C18" strokeWidth={1.8} />
        </div>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1C19', margin: 0, textAlign: 'center' }}>
          入力内容を破棄しますか？
        </h2>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: '#414943', margin: 0, textAlign: 'center', lineHeight: '22px' }}>
          この操作は取り消せません。<br />作成中のレビューは完全に削除されます。
        </p>
        <button onClick={onConfirm} style={{ width: '100%', padding: '14px 0', borderRadius: 9999, background: '#14422D', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 8 }}>
          破棄する
        </button>
        <button onClick={onCancel} style={{ width: '100%', padding: '14px 0', borderRadius: 9999, background: '#E8E8E3', color: '#1A1C19', fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}>
          キャンセル
        </button>
      </div>
    </div>
  );
}

// ─── Success Modal Component ──────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '40px 32px', width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#BCEECF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={28} color="#14422D" strokeWidth={2.5} />
        </div>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 18, color: '#1A1C19', margin: 0, textAlign: 'center' }}>
          レビューを投稿しました
        </h2>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: '#414943', margin: 0, textAlign: 'center' }}>
          共有ありがとうございます！
        </p>
        <button onClick={onClose} style={{ width: '100%', padding: '14px 0', borderRadius: 9999, background: '#14422D', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', marginTop: 8 }}>
          閉じる
        </button>
      </div>
    </div>
  );
}

// ─── Main Review Page Component ───────────────────────────────────────────────
export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const cafeId = params?.id as string;

  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loadingCafe, setLoadingCafe] = useState(true);

  // Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  // Validation State
  const [ratingError, setRatingError] = useState(false);
  const [commentError, setCommentError] = useState(false);

  // Modal Status
  const [showDiscard, setShowDiscard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch cafe detail data
  useEffect(() => {
    if (!cafeId) return;
    CafeService.getCafeById(cafeId)
      .then(setCafe)
      .catch(console.error)
      .finally(() => setLoadingCafe(false));
  }, [cafeId]);

  // Handle local image file previews
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const toAdd = files
        .slice(0, 10 - photos.length)
        .map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        }));
      setPhotos((prev) => [...prev, ...toAdd]);
      e.target.value = '';
    },
    [photos.length],
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  // Form Submission handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rErr = rating === 0;
    const cErr = comment.trim().length < 20;
    setRatingError(rErr);
    setCommentError(cErr);
    if (rErr || cErr) return;

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (photos.length > 0) {
        imageUrls = await CafeService.uploadReviewImages(
          cafeId,
          photos.map((p) => p.file),
        );
      }

      const reviewPayload: any = {
        rating: Number(rating),
        comment: comment.trim(),
        ...(imageUrls.length > 0 && { images: imageUrls }),
      };
      await CafeService.createReview(cafeId, reviewPayload);

      setShowSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'UNAUTHORIZED') {
          router.push('/login');
          return;
        }
        if (err.message === 'FORBIDDEN') {
          alert('レビューを投稿するにはCUSTOMERアカウントが必要です。');
          return;
        }
      }
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscardConfirm = () => {
    setRating(0);
    setComment('');
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setShowDiscard(false);
    router.back();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push(`/cafes/${cafeId}`);
  };

  const todayHours = cafe ? getTodayHours(cafe.operatingHours) : null;
  const displayRating = cafe?.metadata?.averageRating ?? 0;
  const displayReviewCount = cafe?.metadata?.reviewCount ?? 0;

  return (
    <>
      <Navbar />

      <div style={{ background: '#FAFAF5', minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
        <main style={{ maxWidth: 896, margin: '0 auto', padding: '48px 24px 80px' }}>

          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 48, color: '#14422D', letterSpacing: '-1.2px', lineHeight: '56px', marginBottom: 48 }}>
            レビュー投稿
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* ── Cafe Info Card ── */}
            <section style={{ display: 'flex', gap: 32, padding: 32, background: '#F4F4EF', borderRadius: 12 }}>

              {/* Thumbnail Area */}
              <div style={{ width: 261, flexShrink: 0, borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3', background: '#E8E8E3' }}>
                {cafe?.images && cafe.images.length > 0 && toAbsoluteUrl(cafe.images[0]) ? (
                  <img
                    src={toAbsoluteUrl(cafe.images[0])!}
                    alt={cafe.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#D5D5CF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#727972', fontSize: 14 }}>
                    No Image Available
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <h2 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 22, color: '#14422D', margin: 0 }}>
                  {loadingCafe ? '読み込み中...' : (cafe?.name ?? 'カフェ情報なし')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cafe?.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={16} color="#414943" strokeWidth={1.8} />
                      <span style={{ fontSize: 14, color: '#414943' }}>{cafe.address}</span>
                    </div>
                  )}

                  {!loadingCafe && cafe && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={16} fill="#904C18" color="#904C18" strokeWidth={1.5} />
                      <span style={{ fontSize: 14, color: '#414943' }}>
                        {displayRating.toFixed(1)}
                        <span style={{ fontSize: 12, marginLeft: 4 }}>
                          ({displayReviewCount}件のレビュー)
                        </span>
                      </span>
                    </div>
                  )}

                  {todayHours && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={16} color="#414943" strokeWidth={1.8} />
                      <span style={{ fontSize: 14, color: '#414943' }}>{todayHours}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Star Rating ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 20, color: '#14422D', margin: 0 }}>
                総合評価
              </h3>
              <StarRating
                value={rating}
                onChange={(v) => {
                  setRating(v);
                  setRatingError(false);
                }}
                error={ratingError}
              />
            </section>

            {/* ── Review Comment ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <label htmlFor="review-comment" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 20, color: '#14422D' }}>
                  レビュー内容
                </label>
                <span style={{ fontSize: 13, color: commentError ? '#DC2626' : '#414943', fontFamily: 'Manrope, sans-serif' }}>
                  {comment.length} / 500文字（最低20文字以上）
                </span>
              </div>

              <div style={{ borderRadius: 10, overflow: 'hidden', border: commentError ? '2px solid #DC2626' : '2px solid transparent', transition: 'border-color 0.2s' }}>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setComment(e.target.value);
                    setCommentError(false);
                  }}
                  placeholder="Wi-Fiの速度、コンセントの有無、コーヒーの味、雰囲気など、具体的に教えてください..."
                  rows={8}
                  style={{ width: '100%', resize: 'none', padding: '24px', background: '#E3E3DE', border: 'none', outline: 'none', fontFamily: 'Manrope, sans-serif', fontSize: 15, color: '#1A1C19', lineHeight: '24px', boxSizing: 'border-box' }}
                />
              </div>

              {commentError && (
                <p style={{ color: '#DC2626', fontSize: 13, margin: 0, fontFamily: 'Manrope, sans-serif' }}>
                  レビューは20文字以上で入力してください。
                </p>
              )}
            </section>

            {/* ── Photo Upload ── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 20, color: '#14422D', margin: 0 }}>
                写真を追加
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {photos.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ aspectRatio: '1', background: '#E8E8E3', border: '2px dashed #C0C9C1', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#DDDDD8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#E8E8E3')}
                  >
                    <Upload size={22} color="#14422D" strokeWidth={1.8} />
                    <span style={{ fontSize: 12, color: '#14422D', fontFamily: 'Manrope, sans-serif', fontWeight: 500 }}>
                      アップロード
                    </span>
                  </button>
                )}

                {photos.map((photo) => (
                  <div key={photo.id} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                    <img src={photo.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      aria-label="写真を削除"
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(26,28,25,0.75)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} color="#fff" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <p style={{ fontSize: 12, color: '#727972', margin: 0, fontFamily: 'Manrope, sans-serif' }}>
                JPG・PNG形式、最大10枚まで
              </p>
            </section>

            {/* ── Action Buttons ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, paddingTop: 32, borderTop: '1px solid rgba(192,201,193,0.2)' }}>
              <button
                type="button"
                onClick={() => setShowDiscard(true)}
                style={{ padding: '16px 32px', borderRadius: 9999, background: '#E8E8E3', color: '#1A1C19', fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 15, border: 'none', cursor: 'pointer' }}
              >
                キャンセル
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '16px 40px', borderRadius: 9999, background: submitting ? '#8DB09B' : 'linear-gradient(173deg, #14422D 0%, #2D5A43 100%)', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: 15, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 10px 15px -3px rgba(20,66,45,0.2), 0 4px 6px -4px rgba(20,66,45,0.2)', transition: 'opacity 0.2s' }}
              >
                {submitting ? '投稿中...' : 'レビューを投稿する'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {showDiscard && (
        <DiscardModal
          onConfirm={handleDiscardConfirm}
          onCancel={() => setShowDiscard(false)}
        />
      )}
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}
    </>
  );
}