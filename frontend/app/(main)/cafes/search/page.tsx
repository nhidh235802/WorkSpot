'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Cigarette,
  Star
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { CafeService } from '@/services/cafe.service';

const translateFacility = (facility: string) => {
  const mapping: Record<string, string> = {
    'wifi': 'Wi-Fiあり',
    'socket': '電源・コンセント',
    'workspace': '作業スペース',
    'desk': '広いデスク',
    'snack': '軽食メニュー',
    'cleanliness': '清潔感',
    'smoking_rule': '禁煙・喫煙'
  };
  return mapping[facility] || facility;
};

const FILTERS = [
  { id: 'hasWifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'hasPower', label: '電源・コンセント', icon: Plug },
  { id: 'hasDesk', label: 'ワークデスク', icon: Monitor },
  { id: 'hasSnacks', label: '軽食', icon: Coffee },
  { id: 'hasFlexibleHours', label: '営業時間', icon: Clock },
  { id: 'isClean', label: '清潔さ', icon: Sparkles },
  { id: 'isFocusFriendly', label: '作業環境', icon: Headphones },
  { id: 'allowsSmoking', label: '禁煙・喫煙', icon: Cigarette },
];

export default function CafesSearchPage() {
  const searchParams = useSearchParams();
  
  // 1. Khởi tạo state bằng cách ƯU TIÊN lấy dữ liệu từ URL (nếu có)
  const initialKeyword = searchParams.get("q") || "";
  const [keyword, setKeyword] = useState<string>(initialKeyword); 
  
  const [cafes, setCafes] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [radius, setRadius] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const isExist = prev.includes(id);
      return isExist ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setKeyword("");
    setRadius(10);
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); 
    
    const fetchRealData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 2. Lấy tọa độ từ URL (Nếu người dùng dùng GPS), nếu không có thì mới dùng mặc định
        const lat = searchParams.get("lat") || '21.0285';
        const lng = searchParams.get("lng") || '105.8542';

        // 3. Gọi qua Service
        const data = await CafeService.searchCafes({
          lat,
          lng,
          radius,
          keyword,
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

  return (
    <main className="relative flex flex-col h-screen w-full bg-[#fafaf5] overflow-hidden">
      
      {/* HEADER */}
      <header className="flex w-full items-center justify-between px-8 h-20 bg-[#fafaf5cc] shadow-[0px_8px_30px_#0000000a] backdrop-blur-md z-50 shrink-0">
        <Link href="/" className="font-extrabold text-[#14422d] text-2xl tracking-[-1.20px]">
          WorkSpot
        </Link>
        <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[#e3e3de] rounded-full transition-colors">
          <div className="w-10 h-10 bg-[#14422d] rounded-full flex justify-center items-center text-white font-bold">
            U
          </div>
          <span className="text-[#14422d] font-medium hidden sm:block">マイページ</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* CỘT TRÁI: TÌM KIẾM & DANH SÁCH */}
        <section className="relative flex flex-col w-170 h-full bg-[#fafaf5] border-r border-[#e3e3de] shadow-lg z-10 overflow-y-auto">
          
          {/* THANH TÌM KIẾM VÀ BỘ LỌC CỐ ĐỊNH */}
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
                     onClick={() => toggleFilter(filter.id)}
                     className={`px-4 py-2 flex items-center gap-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                       isActive 
                          ? 'bg-[#ffdbc7] text-[#311300] border-[#ffdbc7] shadow-sm' 
                          : 'bg-[#e8e8e3] text-[#1a1c19] border-transparent hover:bg-gray-300'
                     }`}
                   >
                     <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#904c18]' : 'text-gray-600'}`} />
                     <span>{filter.label}</span>
                   </button>
                 )
               })}
             </div>
          </div>

          {/* DANH SÁCH KẾT QUẢ */}
          <div className="p-6 flex flex-col gap-6">
            <div className="flex justify-between items-end w-full">
              <h1 className="text-[#14422d] text-2xl font-bold">
                ハノイで見つかった {cafes.length} 件のスポット
              </h1>
              <button onClick={resetFilters} className="text-[#717973] text-sm font-medium flex items-center gap-1 hover:text-black">
                <RefreshCw className="w-4 h-4" /> リセット
              </button>
            </div>

            {/* HIỂN THỊ TRẠNG THÁI TẢI DỮ LIỆU */}
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
              // RENDER THẺ QUÁN CAFE TỪ DATABASE
              cafes.map((cafe: any) => (
                <article key={cafe.id} className="w-full bg-white rounded-xl overflow-hidden flex shadow-sm border border-[#e3e3de]/30 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-56 h-48 bg-gray-200 shrink-0">
                    <img 
                      src={cafe.avatar || "https://placehold.co/224x192"} 
                      alt={cafe.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-[#14422d] text-xl font-bold leading-tight">{cafe.name}</h2>
                        
                        {/* PHẦN RATING ĐÃ CẬP NHẬT ICON VÀ MÀU SẮC */}
                        <div className="flex items-center gap-1">
                          <Star size={18} fill="#904C18" color="#904C18" /> 
                          <span className="text-[#904C18] text-lg font-bold font-serif">
                            {cafe.rating || '4.5'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[#414943] text-sm leading-relaxed line-clamp-2">
                        {cafe.description || "説明はありません。"}
                      </p>
                      
                      {/* HIỂN THỊ CÁC TAG TIỆN ÍCH LẤY TỪ CỘT FACILITIES (ENUM ARRAY) */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {cafe.facilities && cafe.facilities.map((f: string, index: number) => {
                          // 1. Mapping ngược để kiểm tra khớp với activeFilters
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

                          // 2. Kiểm tra xem tiện ích này có đang được chọn ở bộ lọc phía trên không
                          const filterId = facilityToFilterId[f];
                          const isMatched = filterId && activeFilters.includes(filterId);

                          return (
                            <span 
                              key={index} 
                              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors duration-200 ${
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
                    <div className="pt-4 mt-4 border-t border-[#c0c9c1]/20 text-[#14422d] text-sm">
                      {cafe.address}

                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* CỘT PHẢI: BẢN ĐỒ (STATIC PLACEHOLDER) */}
        <section className="flex-1 relative bg-[#E5E7EB] overflow-hidden">
          <img src="https://placehold.co/800x1024" alt="Map" className="w-full h-full object-cover mix-blend-multiply opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-126.5 h-126.5 bg-[#135899]/10 rounded-full border-2 border-[#135899]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#135899] rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#135899] rounded-full" />
          </div>
          <div className="absolute top-10 left-10 px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[#14422d] font-medium text-sm">リアルタイムで同期中</span>
          </div>
        </section>

      </div>
    </main>
  );
}