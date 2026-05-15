'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import OwnerSidebar from '@/components/OwnerSidebar';
import { ListFilter, Pen, ChevronDown, Star, Store, Plus, Loader2, CheckCircle2, XCircle, X, AlertCircle } from 'lucide-react';

// Cấu hình Trạng thái Quán (Duyệt)
const CAFE_STATUS_CONFIG: Record<string, { label: string, badgeBg: string, badgeText: string, reasonBtnBorder: string }> = {
  pending: { label: 'CHỜ DUYỆT', badgeBg: 'bg-[#FFF3E0]', badgeText: 'text-[#E65100]', reasonBtnBorder: '' },
  approved: { label: 'ĐANG HIỂN THỊ', badgeBg: 'bg-[#E8F0EB]', badgeText: 'text-[#14422D]', reasonBtnBorder: '' },
  rejected: { label: 'BỊ TỪ CHỐI', badgeBg: 'bg-[#FEE2E2]', badgeText: 'text-[#DC2626]', reasonBtnBorder: 'border-[#DC2626] text-[#DC2626]' },
  hidden: { label: 'BỊ ẨN', badgeBg: 'bg-[#F5F5F0]', badgeText: 'text-[#57534E]', reasonBtnBorder: 'border-[#D6D3D1] text-[#57534E]' },
};

const REALTIME_CONFIG: Record<string, { label: string, color: string }> = {
  available: { label: 'Còn chỗ', color: 'bg-[#10B981]' },
  normal: { label: 'Bình thường', color: 'bg-[#F59E0B]' },
  busy: { label: 'Đông đúc', color: 'bg-[#EF4444]' },
};

export default function DashboardOwnerPage() {
  const router = useRouter();
  const params = useParams();
  const ownerId = params.ownerId as string;

  const [cafes, setCafes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [reasonModalCafe, setReasonModalCafe] = useState<any | null>(null);

  // STATE CHO CHỨC NĂNG LỌC
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!ownerId) return;

    const fetchMyCafes = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`http://localhost:3001/cafes/owner/me?ownerId=${ownerId}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const formattedData = data
          .map((c: any) => ({ ...c, realtimeStatus: c.realtimeStatus || 'normal' }))
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        
        setCafes(formattedData);
      } catch (error: any) {
        console.error('Fetch error:', error);
        if (error.name === 'AbortError') {
          showToast('Không thể kết nối (Vượt quá 5 giây)', 'error');
        } else {
          showToast('Không thể kết nối', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCafes();
  }, [ownerId]);

  const handleUpdateStatus = async (cafeId: string, newStatus: string) => {
    if (updatingId) return;
    setOpenDropdownId(null);
    
    const targetCafe = cafes.find(c => c.id === cafeId);
    if (!targetCafe || targetCafe.realtimeStatus === newStatus) return;

    const previousStatus = targetCafe.realtimeStatus;
    setUpdatingId(cafeId);

    setCafes(prev => prev.map(cafe => cafe.id === cafeId ? { ...cafe, realtimeStatus: newStatus } : cafe));

    try {
      const res = await fetch(`http://localhost:3001/cafes/${cafeId}/realtime-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realtimeStatus: newStatus, ownerId }),
      });

      if (!res.ok) throw new Error('Server Error');
      showToast('Đã cập nhật trạng thái', 'success');

    } catch (error) {
      setCafes(prev => prev.map(cafe => cafe.id === cafeId ? { ...cafe, realtimeStatus: previousStatus } : cafe));
      showToast('Cập nhật thất bại', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCardClick = (cafe: any) => {
    if (cafe.status === 'approved') {
      router.push(`/cafes/${cafe.id}`);
    } else {
      router.push(`/owner/cafes/${cafe.id}/edit`);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `Cập nhật ${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // MẢNG DỮ LIỆU ĐÃ ĐƯỢC LỌC
  const filteredCafes = cafes.filter(cafe => {
    if (filterStatus === 'all') return true;
    return cafe.status === filterStatus;
  });

  return (
    <div className="flex h-screen bg-[#FAFAF5] w-full min-w-[1280px] overflow-hidden relative">
      
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border font-['Be_Vietnam_Pro'] animate-in slide-in-from-bottom-5 fade-in duration-300 ${
          toast.type === 'success' ? 'bg-[#E8F0EB] border-[#A7F3D0] text-[#14422D]' : 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {reasonModalCafe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-['Be_Vietnam_Pro']">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#F5F5F0]">
              <h3 className="text-xl font-bold text-[#14422D] font-['Manrope']">Lý do từ chối / ẩn quán</h3>
              <button onClick={() => setReasonModalCafe(null)} className="text-[#A8A29E] hover:text-[#1A1C19] transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <span className={`self-start px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${CAFE_STATUS_CONFIG[reasonModalCafe.status]?.badgeBg} ${CAFE_STATUS_CONFIG[reasonModalCafe.status]?.badgeText}`}>
                {CAFE_STATUS_CONFIG[reasonModalCafe.status]?.label}
              </span>
              
              <div className="bg-[#F5F5F0] p-4 rounded-xl text-sm text-[#57534E] leading-relaxed">
                <span className="font-bold">Lý do: </span> 
                {reasonModalCafe.rejectionReason || 'Không có lý do cụ thể được cung cấp.'}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FAFAF5] flex justify-end border-t border-[#F5F5F0]">
              <button 
                onClick={() => setReasonModalCafe(null)}
                className="bg-[#14422D] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#0d2e1f] transition-colors text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <OwnerSidebar />

      <main className="flex-1 h-full overflow-y-auto px-12 py-10 font-['Be_Vietnam_Pro'] z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-[40px] font-bold text-[#14422D] font-['Manrope'] mb-2 leading-tight">
              Dashboard Owner
            </h2>
            <p className="text-[#57534E] text-base">
              Quản lý thông tin đăng tải và theo dõi hoạt động các cơ sở của bạn.
            </p>
          </div>
          
          {/* NÚT LỌC TRẠNG THÁI */}
          <div className="relative z-40">
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 bg-[#E7E5E4] px-5 py-2.5 rounded-full text-sm font-bold text-[#1A1C19] hover:bg-[#D6D3D1] transition-colors"
            >
              <ListFilter size={18} /> 
              {filterStatus === 'all' ? 'Lọc trạng thái' : `Lọc: ${CAFE_STATUS_CONFIG[filterStatus]?.label}`}
            </button>

            {isFilterDropdownOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsFilterDropdownOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-[#E7E5E4] rounded-xl shadow-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 z-50">
                  <button 
                    onClick={() => { setFilterStatus('all'); setIsFilterDropdownOpen(false); }}
                    className={`px-4 py-3 text-left hover:bg-stone-50 text-sm font-bold border-b border-[#F5F5F0] ${filterStatus === 'all' ? 'text-[#14422D] bg-[#E8F0EB]' : 'text-[#1A1C19]'}`}
                  >
                    Tất cả quán
                  </button>
                  {Object.entries(CAFE_STATUS_CONFIG).map(([key, config]) => (
                    <button 
                      key={key}
                      onClick={() => { setFilterStatus(key); setIsFilterDropdownOpen(false); }}
                      className={`px-4 py-3 text-left hover:bg-stone-50 text-sm font-bold border-b border-[#F5F5F0] last:border-0 ${filterStatus === key ? 'text-[#14422D] bg-[#E8F0EB]' : 'text-[#1A1C19]'}`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
          
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#14422D]">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Đang tải dữ liệu...</p>
            </div>
          ) : cafes.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#E7E5E4] rounded-[24px] bg-white/50">
              <Store size={48} className="text-[#A8A29E] mb-4" />
              <h3 className="text-xl font-bold text-[#1A1C19] mb-2 font-['Manrope']">Chưa có quán nào được đăng ký</h3>
              <p className="text-[#78716C] mb-6">Hãy bắt đầu thêm địa điểm kinh doanh của bạn lên hệ thống.</p>
              <Link href="/owner/cafes/new" className="bg-[#14422D] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0d2e1f] transition-colors flex items-center gap-2">
                <Plus size={18} strokeWidth={3} /> Đăng ký quán mới
              </Link>
            </div>
          ) : filteredCafes.length === 0 ? (
            // TRƯỜNG HỢP LỌC KHÔNG CÓ KẾT QUẢ
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#E7E5E4] rounded-[24px] bg-white/50">
              <ListFilter size={48} className="text-[#A8A29E] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#1A1C19] mb-2 font-['Manrope']">Không tìm thấy kết quả</h3>
              <p className="text-[#78716C]">Không có quán nào khớp với trạng thái bạn đang lọc.</p>
              <button 
                onClick={() => setFilterStatus('all')}
                className="mt-4 text-[#14422D] font-bold hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            filteredCafes.map((cafe) => {
              const isApproved = cafe.status === 'approved';
              const isRejectedOrHidden = cafe.status === 'rejected' || cafe.status === 'hidden';
              const isDropdownOpen = openDropdownId === cafe.id;
              const isUpdating = updatingId === cafe.id;
              
              const statusConfig = CAFE_STATUS_CONFIG[cafe.status] || CAFE_STATUS_CONFIG['pending'];
              const realtimeInfo = REALTIME_CONFIG[cafe.realtimeStatus] || REALTIME_CONFIG['normal'];

              return (
                <div 
                  key={cafe.id} 
                  onClick={() => handleCardClick(cafe)}
                  className="bg-white rounded-[24px] p-8 flex flex-col border border-transparent shadow-[0px_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)] hover:border-[#E7E5E4] transition-all cursor-pointer group"
                >
                  <div className="flex gap-6">
                    <img src={cafe.image} alt={cafe.name} className={`w-28 h-28 rounded-2xl object-cover shrink-0 transition-all ${!isApproved ? 'opacity-50 grayscale' : ''}`} />
                    
                    <div className="flex flex-col items-start justify-center flex-1">
                      <h3 className={`text-2xl font-bold mb-1 font-['Manrope'] group-hover:text-[#14422D] transition-colors ${!isApproved ? 'text-[#A8A29E]' : 'text-[#1A1C19]'}`}>
                        {cafe.name}
                      </h3>
                      <p className={`text-sm mb-3 line-clamp-1 ${!isApproved ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>
                        {cafe.address}
                      </p>
                      
                      <span className={`${statusConfig.badgeBg} ${statusConfig.badgeText} px-3 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider mb-3`}>
                        {statusConfig.label}
                      </span>

                      {isRejectedOrHidden && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setReasonModalCafe(cafe);
                          }}
                          className={`mb-3 px-3 py-1 text-[10px] font-bold rounded-md bg-white border uppercase tracking-wider ${statusConfig.reasonBtnBorder} hover:opacity-70 transition-opacity`}
                        >
                          Xem lý do
                        </button>
                      )}

                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/owner/cafes/${cafe.id}/edit`); }}
                        className="flex items-center gap-1.5 text-xs font-bold hover:underline text-[#14422D]"
                      >
                        <Pen size={12} strokeWidth={3} /> Chỉnh sửa thông tin quán
                      </button>
                    </div>
                  </div>

                  <hr className="border-[#F5F5F0] my-6" />

                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-[10px] font-bold tracking-wider uppercase mb-2 ${!isApproved ? 'text-[#D6D3D1]' : 'text-[#A8A29E]'}`}>TRẠNG THÁI HIỆN TẠI</p>
                      
                      <div className="relative z-30">
                        {!isApproved ? (
                          <button 
                            className="flex items-center justify-between min-w-[150px] px-4 py-2 rounded-xl border bg-[#FAFAF5] border-[#F5F5F0] cursor-not-allowed"
                            disabled
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#D6D3D1]" />
                              <span className="text-sm font-bold text-[#A8A29E]">
                                Không áp dụng
                              </span>
                            </div>
                            <ChevronDown size={16} className="text-[#D6D3D1]" />
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(isDropdownOpen ? null : cafe.id); }}
                            className={`flex items-center justify-between min-w-[150px] px-4 py-2 rounded-xl border transition-colors ${
                              isUpdating ? 'bg-[#FAFAF5] border-[#F5F5F0] cursor-not-allowed' : isDropdownOpen ? 'bg-stone-100 border-[#D6D3D1]' : 'bg-[#FAFAF5] border-[#E7E5E4] hover:bg-stone-100'
                            }`}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <div className="flex items-center gap-2 w-full justify-center text-[#78716C]">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm font-bold">Đang lưu...</span>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${realtimeInfo.color}`} />
                                  <span className="text-sm font-bold text-[#1A1C19]">
                                    {realtimeInfo.label}
                                  </span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform duration-200 text-[#78716C] ${isDropdownOpen ? 'rotate-180' : ''}`} />
                              </>
                            )}
                          </button>
                        )}

                        {isDropdownOpen && isApproved && (
                          <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); }} />
                            <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#E7E5E4] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 z-50">
                              {Object.entries(REALTIME_CONFIG).map(([key, config]) => (
                                <button 
                                  key={key}
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(cafe.id, key); }}
                                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-stone-50 text-sm font-bold text-[#1A1C19] border-b border-[#F5F5F0] last:border-0"
                                >
                                  <div className={`w-2 h-2 rounded-full ${config.color}`} /> {config.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <p className="text-[11px] text-[#A8A29E] italic mt-2 ml-1">{formatDate(cafe.updatedAt)}</p>
                    </div>

                    {!isApproved ? (
                      <p className="text-[11px] text-[#A8A29E] italic mb-2">Thông tin chưa được xuất bản công khai</p>
                    ) : (
                      <div className="flex items-center gap-1 text-[#904C18] text-xl font-bold font-['Manrope'] mb-2">
                        {cafe.rating || 'Mới'} <Star size={18} fill="#904C18" className="mb-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {!isLoading && cafes.length > 0 && (
            <Link href="/owner/cafes/new" className="block">
              <div className="h-full min-h-[320px] rounded-[24px] border-2 border-dashed border-[#E7E5E4] bg-transparent hover:bg-white/50 transition-all flex flex-col items-center justify-center p-8 group cursor-pointer">
                <div className="w-16 h-16 bg-[#E8F0EB] rounded-full flex items-center justify-center text-[#14422D] mb-5 relative group-hover:scale-110 transition-transform">
                  <Store size={28} />
                  <div className="absolute bottom-0 right-0 bg-[#14422D] text-white rounded-full p-0.5 border-2 border-[#FAFAF5]">
                    <Plus size={12} strokeWidth={4} />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-[#1A1C19] font-['Manrope'] mb-2">Đăng ký quán mới</h3>
                <p className="text-sm text-[#78716C] text-center">Mở rộng mạng lưới của bạn tại Hà Nội</p>
              </div>
            </Link>
          )}

        </div>
      </main>
    </div>
  );
}