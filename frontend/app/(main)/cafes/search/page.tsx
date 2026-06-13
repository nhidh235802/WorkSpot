'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { resolveCafeImage } from '@/lib/cafeImages';
import {
  Search,
  Loader2,
  MapPin,
  RefreshCw,
  Wifi,
  Plug,
  Monitor,
  Coffee,
  Clock,
  Sparkles,
  Headphones,
  CigaretteOff,
  Star,
  Phone,
  Navigation,
  ChevronUp
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { CafeService } from '@/services/cafe.service';
import type { CafeMapItem } from '@/components/CafeMap';

// Dynamic import to avoid SSR issues with Leaflet
const CafeMap = dynamic(() => import('@/components/CafeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB]">
      <Loader2 className="w-8 h-8 animate-spin text-[#14422d]" />
    </div>
  ),
});

const translateFacility = (facility: string) => {
  const mapping: Record<string, string> = {
    'wifi': 'Wi-Fi完備',
    'socket': '電源コンセントあり',
    'workspace': '作業スペース',
    'desk': '作業用デスク',
    'snack': '軽食あり',
    'cleanliness': '清潔な空間',
    'smoking_rule': '禁煙',
    'flexible_hours': '営業時間が柔軟',
  };
  return mapping[facility] || facility;
};

const FILTERS = [
  { id: 'hasWifi', label: 'Wi-Fi完備', icon: Wifi },
  { id: 'hasPower', label: '電源コンセントあり', icon: Plug },
  { id: 'hasDesk', label: '作業用デスク', icon: Monitor },
  { id: 'hasSnacks', label: '軽食あり', icon: Coffee },
  { id: 'hasFlexibleHours', label: '営業時間が柔軟', icon: Clock },
  { id: 'isClean', label: '清潔な空間', icon: Sparkles },
  { id: 'isFocusFriendly', label: '作業スペース', icon: Headphones },
  { id: 'allowsSmoking', label: '禁煙', icon: CigaretteOff },
];

const DEFAULT_LAT = 21.0285;
const DEFAULT_LNG = 105.8542;

const REALTIME_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  available: { label: '空きあり', dot: '#10B981', bg: '#D1FAE5', text: '#065F46' },
  normal:    { label: '普通',     dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
  busy:      { label: '混雑',     dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
};

const formatRating = (rating: unknown) => {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1).replace(/\.0$/, '') : '0';
};

function PhotoGalleryModal({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const goToPrev = () => setActiveIndex((index) => index === 0 ? images.length - 1 : index - 1);
  const goToNext = () => setActiveIndex((index) => index === images.length - 1 ? 0 : index + 1);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToPrev();
      if (event.key === 'ArrowRight') goToNext();
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#1a1a1a]"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white"
      >
        ×
      </button>

      <div className="absolute left-1/2 top-7 -translate-x-1/2 text-sm text-white/70">
        {activeIndex + 1} / {images.length}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center w-full px-20 pt-16 pb-5">
        {images.length > 1 && (
          <button
            type="button"
            aria-label="前の画像"
            onClick={(event) => {
              event.stopPropagation();
              goToPrev();
            }}
            className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-3xl text-white"
          >
            ‹
          </button>
        )}

        <img
          src={images[activeIndex]}
          alt={`Photo ${activeIndex + 1}`}
          onClick={(event) => event.stopPropagation()}
          className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
        />

        {images.length > 1 && (
          <button
            type="button"
            aria-label="次の画像"
            onClick={(event) => {
              event.stopPropagation();
              goToNext();
            }}
            className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-3xl text-white"
          >
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex w-full justify-center gap-2.5 overflow-x-auto px-6 pb-7 pt-3">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(index);
              }}
              className={`h-[50px] w-[70px] shrink-0 overflow-hidden rounded-md border-2 p-0 ${
                index === activeIndex ? 'border-white opacity-100' : 'border-transparent opacity-50'
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const removeVietnameseTones = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D');

function RealtimeBadge({ status, className = '' }: { status?: string; className?: string }) {
  const rt = REALTIME_CONFIG[status ?? ''] ?? REALTIME_CONFIG['normal'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${className}`}
      style={{ background: rt.bg, color: rt.text, border: `1px solid ${rt.dot}33` }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: rt.dot, display: 'inline-block', flexShrink: 0 }} />
      {rt.label}
    </span>
  );
}

export default function CafesSearchPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchParams = useSearchParams();

  const initialKeyword = searchParams.get("q") || "";
  const [keyword, setKeyword] = useState<string>(initialKeyword);

  // Sync keyword from URL when navigating from homepage with ?q=
  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    setKeyword(qParam);
  }, [searchParams]);

  const [cafes, setCafes] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [radius, setRadius] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSelectedId = searchParams.get("selectedId") || null;
  const [selectedCafeId, setSelectedCafeId] = useState<string | number | null>(initialSelectedId);
  const [fitRouteTrigger, setFitRouteTrigger] = useState(0);
  const [showRoute, setShowRoute] = useState(searchParams.get("showRoute") === "1");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const openGallery = (images: string[], index: number) => {
    setGalleryImages(images);
    setGalleryStartIndex(index);
  };

  // Determine if we have a keyword (either from state or URL param)
  const hasKeyword = keyword.trim().length > 0;

  const centerLat = parseFloat(searchParams.get("lat") || String(DEFAULT_LAT));
  const centerLng = parseFloat(searchParams.get("lng") || String(DEFAULT_LNG));
  const mapCenter: [number, number] = [centerLat, centerLng];

  // userPosition tracks where the blue dot actually is — can move independently
  // of mapCenter when the user clicks "locate me"
  const [userPosition, setUserPosition] = useState<[number, number]>(mapCenter);

  // Keep userPosition in sync when URL params change (e.g. new GPS search)
  useEffect(() => {
    setUserPosition(mapCenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLat, centerLng]);

  // On mount: try to get real GPS so the dot shows the user's actual location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {}, // silently fall back to mapCenter
      { timeout: 6000, maximumAge: 10000 },
    );
  }, []);

  const toggleFilter = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveFilters((prev) => {
      const isExist = prev.includes(id);
      return isExist ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setKeyword("");
    setRadius(5);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const fetchRealData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const lat = searchParams.get("lat") || String(DEFAULT_LAT);
        const lng = searchParams.get("lng") || String(DEFAULT_LNG);

        const data = await CafeService.searchCafes({
          lat,
          lng,
          radius,
          keyword: removeVietnameseTones(keyword),
          filters: activeFilters
        }, controller.signal);

        setCafes(data);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError("接続時間が超過しました(5秒)。ネットワークを確認してください。");
        } else {
          setError("データの取得に失敗しました。サーバーの状態を確認してください。");
        }
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    const debounceId = setTimeout(() => {
      fetchRealData();
    }, 500);

    return () => {
      clearTimeout(debounceId);
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeFilters, keyword, radius, searchParams]);

  // Map cafe data → CafeMapItem (only cafes with valid coordinates)
  const mapCafes = useMemo<CafeMapItem[]>(() =>
    cafes
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => ({
        id: c.id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        rating: c.rating,
        address: c.address,
        avatar: resolveCafeImage(c.name, c.avatar),
      })),
    [cafes]
  );

  // When navigated from detail page with selectedId in URL, scroll + zoom after cafes load
  useEffect(() => {
    if (!initialSelectedId || !cafes.length) return;
    const exists = cafes.some((c) => c.id === initialSelectedId);
    if (!exists) return;
    const el = document.getElementById(`cafe-card-${initialSelectedId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // If showRoute=1 in URL, trigger fitBounds so map zooms to fit the route
    if (searchParams.get("showRoute") === "1") {
      setFitRouteTrigger((n) => n + 1);
    }
  }, [cafes, initialSelectedId]);

  const handleSelectCafe = (id: string | number) => {
    setSelectedCafeId((prev) => (prev === id ? null : id));
    setIsExpanded(false);
    setShowRoute(false);
    const el = document.getElementById(`cafe-card-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <main className="relative flex flex-col h-screen w-full bg-[#fafaf5] overflow-hidden">
      {galleryImages.length > 0 && (
        <PhotoGalleryModal
          images={galleryImages}
          initialIndex={galleryStartIndex}
          onClose={() => setGalleryImages([])}
        />
      )}

      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: SEARCH & LIST */}
        <section className="relative flex flex-col w-170 h-full bg-[#fafaf5] border-r border-[#e3e3de] shadow-lg z-10 overflow-y-auto">

          {/* SEARCH + FILTERS */}
          <div className="p-6 sticky top-0 bg-[#fafaf5] z-20 border-b border-[#e3e3de]/50 flex flex-col gap-4 shadow-sm">
             <div className="relative flex items-center bg-[#E3E3DE] rounded-xl px-4 py-3 focus-within:ring-2 ring-[#904c18] transition-all">
                <Search className="w-5 h-5 text-[#717973] absolute left-4" />
                <input
                  type="text"
                  placeholder="店名、住所、キーワードで検索..."
                  className="w-full bg-transparent border-none outline-none pl-8 text-[#1a1c19] font-medium placeholder-[#6B7280]"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
             </div>

             <div className="flex gap-2 flex-wrap">
               {FILTERS.map(filter => {
                 const isActive = activeFilters.includes(filter.id);
                 const IconComponent = filter.icon;

                 return (
                   <button
                     key={filter.id}
                     onClick={(e) => toggleFilter(e, filter.id)}
                     className={`px-4 py-2.5 flex items-center gap-2 rounded-full text-base font-medium transition-all duration-200 border ${
                       isActive
                         ? 'bg-[#ffdbc7] text-[#311300] border-[#ffdbc7] shadow-sm'
                         : 'bg-[#e8e8e3] text-[#1a1c19] border-transparent hover:bg-gray-300'
                     }`}
                   >
                     <IconComponent className={`w-[18px] h-[18px] ${isActive ? 'text-[#904c18]' : 'text-gray-600'}`} />
                     <span>{filter.label}</span>
                   </button>
                 )
               })}
             </div>
          </div>

          {/* CAFE LIST */}
          <div className="p-6 flex flex-col gap-6">
            <div className="flex justify-between items-end w-full">
              <h1 className="text-[#14422d] text-2xl font-bold">
                {cafes.length} 件のスポットが見つかりました
              </h1>
              <button onClick={resetFilters} className="text-[#717973] text-sm font-medium flex items-center gap-1 hover:text-black">
                <RefreshCw className="w-4 h-4" /> リセット
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#14422d] mb-4" />
                <p className="text-[#14422d] font-bold">読み込み中...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500">
                <p className="font-bold">{error}</p>
              </div>
            ) : cafes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <MapPin className="w-12 h-12 mb-4 opacity-50" />
                <p>条件に一致するカフェが見つかりませんでした。</p>
              </div>
            ) : (
              cafes.map((cafe: any) => {
                const isSelected = selectedCafeId === cafe.id;
                return (
                  <article
                    id={`cafe-card-${cafe.id}`}
                    key={cafe.id}
                    onClick={() => handleSelectCafe(cafe.id)}
                    className={`w-full bg-white rounded-xl overflow-hidden flex shadow-sm border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#14422d] shadow-[0_0_0_2px_rgba(20,66,45,0.25)]'
                        : 'border-[#e3e3de]/30 hover:shadow-md hover:border-[#c0c9c1]'
                    }`}
                  >
                    <div className="w-56 h-48 bg-gray-200 shrink-0">
                      <img
                        src={resolveCafeImage(cafe.name, cafe.avatar)}
                        alt={cafe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-[#14422d] text-xl font-bold leading-tight">{cafe.name}</h2>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1">
                              <Star size={18} fill="#904C18" color="#904C18" />
                              <span className="text-[#904C18] text-lg font-bold font-serif">
                                {formatRating(cafe.rating)}
                              </span>
                            </div>
                            <RealtimeBadge status={cafe.realtimeStatus} />
                          </div>
                        </div>
                        <p className="text-[#414943] text-base leading-relaxed line-clamp-2">
                          {cafe.description || "説明はありません。"}
                        </p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {cafe.facilities && cafe.facilities.map((f: string, index: number) => {
                            const facilityToFilterId: Record<string, string> = {
                              'wifi': 'hasWifi',
                              'socket': 'hasPower',
                              'desk': 'hasDesk',
                              'snack': 'hasSnacks',
                              'cleanliness': 'isClean',
                              'workspace': 'isFocusFriendly',
                              'smoking_rule': 'allowsSmoking',
                              'flexible_hours': 'hasFlexibleHours'
                            };
                            const filterId = facilityToFilterId[f];
                            const isMatched = filterId && activeFilters.includes(filterId);

                            return (
                              <span
                                key={index}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                                  isMatched
                                    ? 'bg-[#ffdbc7] text-[#311300]'
                                    : 'bg-[#e8e8e3] text-[#414943]'
                                }`}
                              >
                                {translateFacility(f)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-[#c0c9c1]/20 text-[#14422d] text-base flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0" />
                        {cafe.address}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT: REAL MAP */}
        <section className="flex-1 relative overflow-hidden">
          <CafeMap
            cafes={mapCafes}
            center={mapCenter}
            userPosition={userPosition}
            radius={hasKeyword ? 0 : radius} // Ẩn vòng tròn trên map khi có từ khóa
            onSelectCafe={handleSelectCafe}
            selectedId={selectedCafeId}
            onLocate={(pos) => setUserPosition(pos)}
            fitRouteTrigger={fitRouteTrigger}
            showRoute={showRoute}
          />

          {/* Status badge – top left */}
          <div className="absolute top-4 left-4 z-[1000] px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white flex items-center gap-3 pointer-events-none">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[#14422d] font-medium text-sm">
              {isLoading ? '読み込み中...' : `${mapCafes.length} 件表示中`}
            </span>
          </div>

          {/* Radius selector – top right (Ẩn đi khi có keyword) */}
          {!hasKeyword && (
            <div className="absolute top-4 right-4 z-[1000] px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#e3e3de] flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#14422d] shrink-0" />
              <span className="text-[#14422d] text-sm font-medium whitespace-nowrap">検索範囲</span>
              <input
                type="range"
                min={5}
                max={10}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-24 accent-[#14422d]"
              />
              <span className="text-[#14422d] font-bold text-sm w-10 text-right">{radius} km</span>
            </div>
          )}

          {/* Selected cafe bottom panel */}
          {selectedCafeId && (() => {
            const cafe = cafes.find((c: any) => c.id === selectedCafeId);
            if (!cafe) return null;
            const fallbackImage = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200';
            const cafeGalleryImages = Array.from(new Set([
              resolveCafeImage(cafe.name, cafe.avatar),
              ...((cafe.images as string[] | undefined) ?? []),
            ].filter(Boolean)));
            const displayedImages = [
              cafeGalleryImages[0],
              cafeGalleryImages[1] ?? fallbackImage,
            ];
            const remainingImageCount = Math.max(cafeGalleryImages.length - displayedImages.length, 0);

            return (
              <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-[32px] shadow-2xl border border-[#e3e3de] transition-all duration-500 ease-in-out flex flex-col overflow-hidden`}
                style={{ 
                  width: 400, 
                  height: isExpanded ? '600px' : '290px',
                  maxWidth: 'calc(100% - 32px)',
                }}
              >
                {/* 1. THANH KÉO (Drag Handle) */}
                <div 
                  className="flex justify-center pt-3 pb-2 cursor-pointer shrink-0"
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                >
                  <div className="w-12 h-1.5 bg-[#d0d0c8] rounded-full" />
                </div>

                {/* 2. VÙNG NỘI DUNG (Cuộn được khi mở rộng) */}
                <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
                  {/* Header luôn hiện */}
                  <div 
                    className="flex gap-4 items-start mb-3 cursor-pointer" // <-- Giảm mb để vừa layout mới
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                      <button
                        type="button"
                        aria-label="画像を拡大"
                        className="h-full w-full cursor-zoom-in"
                        onClick={(event) => {
                          event.stopPropagation();
                          openGallery(cafeGalleryImages, 0);
                        }}
                      >
                        <img src={cafeGalleryImages[0]} alt={cafe.name} className="w-full h-full object-cover" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[#14422d] font-bold text-xl leading-tight">{cafe.name}</h2>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Star size={14} fill="#904C18" color="#904C18" />
                        <span className="text-[#904C18] font-bold text-sm">{formatRating(cafe.rating)}</span>
                        <span className="text-[#717973] text-sm ml-1">({cafe.reviewCount ?? 0} レビュー)</span>
                        <RealtimeBadge status={cafe.realtimeStatus} /></div>
                    </div>
                  </div>

                  {/* Tags nhỏ luôn hiện */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1.5 bg-[#FDF2F0] text-[#904C18] text-sm font-bold rounded-md whitespace-nowrap">サイレントゾーン</span>
                    <span className="px-3 py-1.5 bg-[#F4F4F1] text-[#717973] text-sm font-bold rounded-md whitespace-nowrap">ガーデンビュー</span>
                    <span className="px-3 py-1.5 bg-[#F4F4F1] text-[#717973] text-sm font-bold rounded-md whitespace-nowrap">居心地が良い</span>
                  </div>

                  {/* PHẦN CHI TIẾT (Ẩn khi thu nhỏ, Hiện khi mở rộng) */}
                  <div className={`transition-all duration-500 origin-top ${isExpanded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0'}`}>
                    <p className="text-[#414943] text-base leading-relaxed mb-4">
                      {cafe.description || "静かな路地裏に位置し, 図書館のような静寂が守られているスポット. 読書や執筆に理想的です."}
                    </p>

                    {/* Grid ảnh */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {displayedImages.map((image, index) => (
                        <button
                          type="button"
                          key={`${image}-${index}`}
                          aria-label={`画像 ${index + 1} を拡大`}
                          className="relative h-36 w-full cursor-zoom-in overflow-hidden rounded-2xl shadow-sm"
                          onClick={() => openGallery(cafeGalleryImages.length > 1 ? cafeGalleryImages : displayedImages, index)}
                        >
                          <img src={image} alt={`${cafe.name} ${index + 1}`} className="h-full w-full object-cover transition-transform hover:scale-105" />
                          {index === 1 && remainingImageCount > 0 && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-3xl font-bold text-white">
                              +{remainingImageCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Thông tin liên hệ */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-4 p-3 bg-[#F4F4F1] rounded-2xl">
                        <Clock className="w-5 h-5 text-[#14422d]" />
                        <span className="text-[#14422d] text-base font-medium">営業時間 10:00-22:30</span>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-[#F4F4F1] rounded-2xl">
                        <MapPin className="w-5 h-5 text-[#14422d]" />
                        <span className="text-[#14422d] text-base font-medium truncate">{cafe.address}</span>
                      </div>
                      <div className="flex items-center gap-4 p-3 bg-[#F4F4F1] rounded-2xl">
                        <Phone className="w-5 h-5 text-[#14422d]" />
                        <span className="text-[#14422d] text-base font-medium">1900 8888</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. NÚT BẤM (Cố định ở dưới cùng của Card) */}
                <div className="px-6 pb-4 pt-2 bg-white shrink-0"> {/* <-- Giảm pb-6 thành pb-4 */}
                  <div className="flex gap-3">
                    <Link
                      href={`/cafes/${cafe.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#14422d] text-[#14422d] font-bold text-lg hover:bg-gray-50 transition-all"
                    >
                      詳細を見る <span className="opacity-60 text-lg">ⓘ</span>
                    </Link>
                    <button
                      onClick={() => { setShowRoute(true); setFitRouteTrigger((n) => n + 1); }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#14422D] text-white font-bold text-lg shadow-lg hover:bg-[#0d2e1f] transition-all"
                    >
                      経路 <Navigation size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

      </div>
    </main>
  );
}
