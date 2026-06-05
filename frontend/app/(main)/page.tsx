"use client";

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CafeService } from '@/services/cafe.service';
import Navbar from '@/components/Navbar';
import { resolveCafeImage } from '@/lib/cafeImages';

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.23125 11.0833L3.17917 6.98542L0 4.22917L4.2 3.86458L5.83333 0L7.46667 3.86458L11.6667 4.22917L8.4875 6.98542L9.43542 11.0833L5.83333 8.91042L2.23125 11.0833Z" fill="#EAB308" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.775 10.5L4.1125 6.3875L0 4.725V3.90833L10.5 0L6.59167 10.5H5.775ZM6.15417 8.34167L8.51667 1.98333L2.15833 4.34583L5.01667 5.48333L6.15417 8.34167Z" fill="#414943" />
    </svg>
  );
}

export interface CafeType {
  id: number | string;
  name: string;
  img: string;
  rating: number | string;
  distance: string;
  area: string;
  tags: { label: string; style?: React.CSSProperties }[];
}

function CafeCard({ cafe }: { cafe: CafeType }) {
  return (
    <Link href={`/cafes/${cafe.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        width: 320,
        height: 355,
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
        cursor: "pointer",
      }}>
        {/* Image */}
        <div style={{ position: "relative", height: 224, flexShrink: 0, overflow: "hidden" }}>
          <img
            src={cafe.img}
            alt={cafe.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Rating badge */}
          <div style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 12px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(4px)",
          }}>
            <StarIcon />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#1A1C19" }}>{cafe.rating}</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "#14422D",
            lineHeight: "28px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {cafe.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
            <div style={{ flexShrink: 0, display: "flex" }}>
              <LocationIcon />
            </div>
            <span style={{
              fontSize: 14,
              color: "#414943",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {cafe.distance} • {cafe.area}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12 }}>
            {cafe.tags.map((tag) => (
              <span key={tag.label} style={{
                padding: "4px 12px",
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "-0.5px",
                ...tag.style,
              }}>
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function WorkSpotPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedCafes, setRecommendedCafes] = useState<CafeType[]>([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(true);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const SCROLL_SPEED = 0.3; // px per frame (chậm hơn trước 50%)

  // Auto-scroll: move right slowly; pause on hover; loop seamlessly
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const step = () => {
      if (!isPausedRef.current && el) {
        el.scrollLeft += SCROLL_SPEED;
        // When we've scrolled past the first copy, jump back to start seamlessly
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    const pause  = () => { isPausedRef.current = true; };
    const resume = () => { isPausedRef.current = false; };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, [recommendedCafes]);

  const CARD_WIDTH = 320 + 24; // card width + gap
  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = direction === 'left' ? -CARD_WIDTH : CARD_WIDTH;
    el.scrollLeft += delta;
    // Wrap around
    if (el.scrollLeft < 0) el.scrollLeft += el.scrollWidth / 2;
    if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft -= el.scrollWidth / 2;
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async (lat: number, lng: number) => {
      try {
        setIsLoadingRecommend(true);
        const data = await CafeService.getTopRecommended(lat, lng);

        const facilityLabelMap: Record<string, string> = {
          wifi: '高速Wi-Fi',
          socket: '電源あり',
          workspace: 'ワークスペース',
          desk: '専用デスク',
          snack: '軽食',
          flexible_hours: '柔軟な時間',
          cleanliness: '清潔感',
          smoking_rule: '禁煙',
        };
        const tagColors = [
          { background: '#D4E8DC', color: '#14422D' },
          { background: '#FFF0E6', color: '#904C18' },
          { background: '#E8F4FF', color: '#1A5FA6' },
        ];

        const formatAddress = (address: string) => {
          if (!address) return '';
          const parts = address.split(',');
          if (parts.length < 2) return removeVietnameseTones(address);
          let district = parts[parts.length - 2].trim();
          district = district.replace(/^(Quận|Huyện|Thị xã|Thành phố)\s+/i, '');
          return removeVietnameseTones(district);
        };

        const removeVietnameseTones = (str: string) => {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        };

        const mapped: CafeType[] = (data as any[]).map((item: any) => ({
          id: item.id,
          name: item.name,
          img: resolveCafeImage(item.name, item.avatar),
          rating: item.rating ?? 0,
          distance: `${item.distance ?? '?'} km`,
          area: formatAddress(item.address ?? ''),
          tags: (item.facilities as string[] ?? []).slice(0, 3).map((f, i) => ({
            label: facilityLabelMap[f] ?? f,
            style: tagColors[i % tagColors.length],
          })),
        }));

        if (isMounted) setRecommendedCafes(mapped);
      } catch (error) {
        // Hiển thị thông báo lỗi khi không tải được dữ liệu từ API
        if (isMounted) setRecommendError("データの読み込みに失敗しました。"); // "Không thể tải dữ liệu"  
      } finally {
        if (isMounted) setIsLoadingRecommend(false);
      }
    };

    const fallbackToHanoi = () => loadData(21.0285, 105.8542);

    if (!navigator.geolocation) {
      fallbackToHanoi();
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => loadData(position.coords.latitude, position.coords.longitude),
        () => fallbackToHanoi(),
        { timeout: 5000 }
      );
    }

    return () => { isMounted = false; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (keyword.trim()) {
      router.push(`/cafes/search?q=${encodeURIComponent(keyword)}`);
      return;
    }

    const fallbackToHanoi = () => {
      setIsSearching(false);
      router.push(`/cafes/search?lat=21.0285&lng=105.8542&radius=5`);
    };

    if (!navigator.geolocation) {
      fallbackToHanoi();
      return;
    }

    setIsSearching(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setIsSearching(false);
        router.push(`/cafes/search?lat=${lat}&lng=${lng}&radius=5`);
      },
      () => {
        fallbackToHanoi();
      },
      { timeout: 5000 }
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF5", fontFamily: "Manrope, sans-serif" }}>

      <Navbar />

      {/* ── Hero ── */}
      <section style={{ padding: "96px 32px", maxWidth: 1536, margin: "0 auto" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 48,
          minHeight: 730,
        }}>
          {/* Left */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 576, display: "flex", flexDirection: "column", gap: 24 }}>
              <h1 style={{ margin: 0, fontSize: 60, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-1.5px" }}>
                <span style={{ color: "#14422D" }}>インスピレーション<br />を感じる場所で、<br /></span>
                <span style={{ color: "#904C18" }}>働こう。</span>
              </h1>

              <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "#414943", lineHeight: "28px", maxWidth: 448 }}>
                リモートワークに最適な、ハノイで最も静かで集中できるカフェを厳選しました。
              </p>

              <form
                onSubmit={handleSearch}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: "#fff",
                  borderRadius: 9999, padding: "8px 8px 8px 20px",
                  boxShadow: "0 12px 40px 0 rgba(26,28,25,0.06)", maxWidth: 576,
                }}
              >
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M8 10C8.55 10 9.02083 9.80417 9.4125 9.4125C9.80417 9.02083 10 8.55 10 8C10 7.45 9.80417 6.97917 9.4125 6.5875C9.02083 6.19583 8.55 6 8 6C7.45 6 6.97917 6.19583 6.5875 6.5875C6.19583 6.97917 6 7.45 6 8C6 8.55 6.19583 9.02083 6.5875 9.4125C6.97917 9.80417 7.45 10 8 10ZM8 17.35C10.0333 15.4833 11.5417 13.7875 12.525 12.2625C13.5083 10.7375 14 9.38333 14 8.2C14 6.38333 13.4208 4.89583 12.2625 3.7375C11.1042 2.57917 9.68333 2 8 2C6.31667 2 4.89583 2.57917 3.7375 3.7375C2.57917 4.89583 2 6.38333 2 8.2C2 9.38333 2.49167 10.7375 3.475 12.2625C4.45833 13.7875 5.96667 15.4833 8 17.35ZM8 20C5.31667 17.7167 3.3125 15.5958 1.9875 13.6375C0.6625 11.6792 0 9.86667 0 8.2C0 5.7 0.804167 3.70833 2.4125 2.225C4.02083 0.741667 5.88333 0 8 0C10.1167 0 11.9792 0.741667 13.5875 2.225C15.1958 3.70833 16 5.7 16 8.2C16 9.86667 15.3375 11.6792 14.0125 13.6375C12.6875 15.5958 10.6833 17.7167 8 20Z" fill="#717973" />
                </svg>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="エリア名やカフェ名で検索..."
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 16, color: "#414943", padding: "10px 0", fontFamily: "Manrope, sans-serif" }}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  style={{
                    flexShrink: 0, padding: "16px 32px", borderRadius: 9999, border: "none",
                    background: isSearching ? "#9FCFB2" : "linear-gradient(135deg, #14422D 0%, #2D5A43 100%)",
                    color: "#fff", fontSize: 14, fontWeight: 500,
                    cursor: isSearching ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {isSearching ? "現在地を取得中..." : "スポットを探す"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: image */}
          <div style={{ position: "relative", width: "100%", maxWidth: 584, flexShrink: 0 }}>
            <div style={{
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              aspectRatio: "4/5",
            }}>
              <img
                src="./images/hero-cafe.png"
                alt="Professional Cafe"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            {/* Floating badge */}
            <div style={{
              position: "absolute",
              bottom: -24,
              left: -24,
              background: "#FFDBC7",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)",
              maxWidth: 200,
            }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "#311300", lineHeight: "28px" }}>
                アップデート
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 500, color: "rgba(49,19,0,0.80)", lineHeight: "16px" }}>
                安定したWiFiと快適さを実地確認済み
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommended Cafes ── */}
      <section style={{ background: "#F4F4EF", padding: "48px 0" }}>
        <div style={{ maxWidth: 1536, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, padding: "0 32px" }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "#904C18", textTransform: "uppercase", letterSpacing: "1.2px", lineHeight: "16px" }}>
                あなたへの一押し
              </p>
              <h2 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 500, color: "#14422D", lineHeight: "36px" }}>
                おすすめのカフェ
              </h2>
            </div>
          </div>

          {isLoadingRecommend ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#414943" }}>
              おすすめのカフェを探しています...
            </div>
          ) : recommendError ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#BA1A1A", fontWeight: 500 }}>
              {recommendError}
            </div>
          ) : recommendedCafes.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#414943" }}>
              近くにカフェが見つかりませんでした。
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Scrollable track — driven by JS auto-scroll */}
              <div
                ref={scrollRef}
                className="carousel-scroll"
                style={{
                  display: "flex",
                  gap: 24,
                  overflowX: "auto",
                  paddingBottom: 32,
                  paddingLeft: 32,
                  paddingRight: 32,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                } as React.CSSProperties}
              >
                {[...recommendedCafes, ...recommendedCafes].map((cafe, idx) => (
                  <CafeCard key={`${cafe.id}-${idx}`} cafe={cafe} />
                ))}
              </div>

              {/* Left arrow */}
              <button
                onClick={() => scrollBy('left')}
                style={{
                  position: "absolute",
                  left: 16,
                  top: 177.5,
                  transform: "translateY(-50%)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "3px solid #fff",
                  boxShadow: "0 0 0 5px rgba(0, 0, 0, 0.4)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  backgroundClip: "padding-box",
                }}
                aria-label="Scroll left"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>

              {/* Right arrow */}
              <button
                onClick={() => scrollBy('right')}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 177.5,
                  transform: "translateY(-50%)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "3px solid #fff",
                  boxShadow: "0 0 0 5px rgba(0, 0, 0, 0.4)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  backgroundClip: "padding-box",
                }}
                aria-label="Scroll right"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section style={{ maxWidth: 1536, margin: "0 auto", padding: "80px 32px" }}>
        <h2 style={{
          margin: "0 0 48px",
          fontSize: 36,
          fontWeight: 700,
          color: "#14422D",
          textAlign: "center",
          lineHeight: "40px",
        }}>
          WorkSpotが選ばれる理由
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "280px 280px",
          gap: 24,
        }}>

          {/* Row 1 Col 1-2: Availability */}
          <div style={{
            gridColumn: "1 / span 2",
            gridRow: "1",
            background: "#EEEEE9",
            borderRadius: 32,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 32, right: 32, opacity: 0.2 }}>
              <svg width="96" height="96" viewBox="0 0 136 136" fill="none">
                <path d="M36 104V80H100V104H92V88H44V104H36ZM38 76C36.3333 76 34.9167 75.4167 33.75 74.25C32.5833 73.0833 32 71.6667 32 70C32 68.3333 32.5833 66.9167 33.75 65.75C34.9167 64.5833 36.3333 64 38 64C39.6667 64 41.0833 64.5833 42.25 65.75C43.4167 66.9167 44 68.3333 44 70C44 71.6667 43.4167 73.0833 42.25 74.25C41.0833 75.4167 39.6667 76 38 76ZM48 76V40C48 37.8 48.7833 35.9167 50.35 34.35C51.9167 32.7833 53.8 32 56 32H80C82.2 32 84.0833 32.7833 85.65 34.35C87.2167 35.9167 88 37.8 88 40V76H48ZM98 76C96.3333 76 94.9167 75.4167 93.75 74.25C92.5833 73.0833 92 71.6667 92 70C92 68.3333 92.5833 66.9167 93.75 65.75C94.9167 64.5833 96.3333 64 98 64C99.6667 64 101.083 64.5833 102.25 65.75C103.417 66.9167 104 68.3333 104 70C104 71.6667 103.417 73.0833 102.25 74.25C101.083 75.4167 99.6667 76 98 76ZM56 68H80V40H56V68Z" fill="#904C18" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 16px", fontSize: 30, fontWeight: 400, color: "#14422D", lineHeight: "36px" }}>
              空席確認
            </h3>
            <p style={{ margin: 0, fontSize: 16, color: "#414943", lineHeight: "24px", maxWidth: 384 }}>
              満席のカフェに足を運ぶ必要はもうありません。出発前に空き状況を確認できます。
            </p>
          </div>

          {/* Row 1 Col 3: Verified Speed */}
          <div style={{
            gridColumn: "3",
            gridRow: "1",
            background: "#14422D",
            borderRadius: 32,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <svg width="32" height="32" viewBox="0 0 32 40" fill="none">
              <path d="M13.1 32.4L23.45 20H15.45L16.9 8.65L7.65 22H14.6L13.1 32.4ZM8 40L10 26H0L18 0H22L20 16H32L12 40H8Z" fill="white" />
            </svg>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 500, color: "#fff", lineHeight: "32px" }}>
                検証済みの速度
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "#9FCFB2", lineHeight: "20px" }}>
                掲載されているすべてのスポットで50Mbps以上の速度をテスト済みです。
              </p>
            </div>
          </div>

          {/* Row 2 Col 1: Coupons */}
          <div style={{
            gridColumn: "1",
            gridRow: "2",
            background: "#FFA76B",
            borderRadius: 32,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
              <path d="M20 26C20.5667 26 21.0417 25.8083 21.425 25.425C21.8083 25.0417 22 24.5667 22 24C22 23.4333 21.8083 22.9583 21.425 22.575C21.0417 22.1917 20.5667 22 20 22C19.4333 22 18.9583 22.1917 18.575 22.575C18.1917 22.9583 18 23.4333 18 24C18 24.5667 18.1917 25.0417 18.575 25.425C18.9583 25.8083 19.4333 26 20 26ZM20 18C20.5667 18 21.0417 17.8083 21.425 17.425C21.8083 17.0417 22 16.5667 22 16C22 15.4333 21.8083 14.9583 21.425 14.575C21.0417 14.1917 20.5667 14 20 14C19.4333 14 18.9583 14.1917 18.575 14.575C18.1917 14.9583 18 15.4333 18 16C18 16.5667 18.1917 17.0417 18.575 17.425C18.9583 17.8083 19.4333 18 20 18ZM20 10C20.5667 10 21.0417 9.80833 21.425 9.425C21.8083 9.04167 22 8.56667 22 8C22 7.43333 21.8083 6.95833 21.425 6.575C21.0417 6.19167 20.5667 6 20 6C19.4333 6 18.9583 6.19167 18.575 6.575C18.1917 6.95833 18 7.43333 18 8C18 8.56667 18.1917 9.04167 18.575 9.425C18.9583 9.80833 19.4333 10 20 10ZM36 32H4C2.9 32 1.95833 31.6083 1.175 30.825C0.391667 30.0417 0 29.1 0 28V20C1.1 20 2.04167 19.6083 2.825 18.825C3.60833 18.0417 4 17.1 4 16C4 14.9 3.60833 13.9583 2.825 13.175C2.04167 12.3917 1.1 12 0 12V4C0 2.9 0.391667 1.95833 1.175 1.175C1.95833 0.391667 2.9 0 4 0H36C37.1 0 38.0417 0.391667 38.825 1.175C39.6083 1.95833 40 2.9 40 4V12C38.9 12 37.9583 12.3917 37.175 13.175C36.3917 13.9583 36 14.9 36 16C36 17.1 36.3917 18.0417 37.175 18.825C37.9583 19.6083 38.9 20 40 20V28C40 29.1 39.6083 30.0417 38.825 30.825C38.0417 31.6083 37.1 32 36 32Z" fill="#783A04" />
            </svg>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 500, color: "#783A04", lineHeight: "32px" }}>
                限定クーポン
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(120,58,4,0.80)", lineHeight: "20px" }}>
                WorkSpotユーザー限定のお得な割引やドリンクサービスを利用しましょう。
              </p>
            </div>
          </div>

          {/* Row 2 Col 2-3: Special Offers */}
          <div style={{
            gridColumn: "2 / span 2",
            gridRow: "2",
            background: "#E8E8E3",
            borderRadius: 32,
            padding: 40,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 30, fontWeight: 500, color: "#14422D", lineHeight: "36px" }}>
                特別オファーでお得にワーク
              </h3>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "#414943", lineHeight: "24px" }}>
                提携カフェで使えるデジタルクーポンを多数ご用意。集中して作業をしながら、お気に入りの一杯をお得に楽しめます。最新のセール情報をチェックしてください。
              </p>
            </div>
            <div style={{
              width: 241,
              height: 241,
              borderRadius: 16,
              overflow: "hidden",
              flexShrink: 0,
              background: "#E3E3DE",
            }}>
              <img
                src="./images/hero-cafe.png"
                alt="Hero Cafe"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}