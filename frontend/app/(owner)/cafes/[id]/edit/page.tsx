'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import CancelConfirmDialog from '@/components/CancelCreateDialog'
import { ArrowLeft, MapPin, ImagePlus, X, Check, Loader2, Plus } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
type Facility = 'wifi' | 'socket' | 'desk' | 'snack' | 'cleanliness' | 'workspace' | 'smoking_rule'

interface OperatingHour {
  label: string
  days: string[] // Chứa mảng các ngày (vd: ['monday', 'tuesday', ...])
  openTime: string
  closeTime: string
  isDayOff: boolean
}

interface CafeForm {
  name: string
  address: string
  description: string
  facilities: Facility[]
  images: string[]
  isClosedOnHolidays: boolean
  operatingHours: OperatingHour[]
}

// ─── Facility config ────────────────────────────────────────────────────────────
const FACILITIES: { key: Facility; label: string; icon: React.ReactNode }[] = [
  { key: 'wifi', label: 'Wi-Fi', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" /></svg> },
  { key: 'socket', label: 'Ổ cắm điện', icon: <svg width="10" height="14" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="1" x2="5" y2="5" /><line x1="9" y1="1" x2="9" y2="5" /><rect x="2" y="5" width="10" height="9" rx="4" /><line x1="7" y1="14" x2="7" y2="19" /></svg> },
  { key: 'desk', label: 'Bàn làm việc', icon: <svg width="14" height="10" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="18" height="5" rx="1" /><line x1="4" y1="6" x2="4" y2="13" /><line x1="16" y1="6" x2="16" y2="13" /><line x1="4" y1="10" x2="16" y2="10" /></svg> },
  { key: 'snack', label: 'Đồ ăn nhẹ', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="9" cy="9.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="10.5" cy="15" r="1" fill="currentColor" stroke="none" /></svg> },
  { key: 'cleanliness', label: 'Độ sạch sẽ', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="10" y="2" width="4" height="6" rx="2" /><rect x="3" y="8" width="18" height="10" rx="2" /><line x1="8" y1="11" x2="8" y2="16" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="16" y1="11" x2="16" y2="16" /></svg> },
  { key: 'workspace', label: 'Không gian làm việc', icon: <svg width="14" height="10" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="20" height="11" rx="2" /><line x1="7" y1="15" x2="15" y2="15" /><line x1="11" y1="12" x2="11" y2="15" /></svg> },
  { key: 'smoking_rule', label: 'Quy định hút thuốc', icon: <svg width="14" height="12" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="12" x2="14" y2="12" /><line x1="16" y1="12" x2="20" y2="12" /><path d="M14 9 c3 0 3 3 3 3" /><path d="M12 6 c3 0 4 2 4 6" /><line x1="2" y1="2" x2="20" y2="16" /></svg> },
]

// ─── Component Section Layout ───────────────────────────────────────────────────
const Section = ({ title, desc, children }: { title: string, desc: string, children: React.ReactNode }) => (
  <div className="flex flex-col xl:flex-row gap-10 lg:gap-16 items-start w-full">
    <div className="w-full xl:w-[280px] shrink-0 pt-2">
      <h2 className="text-[20px] font-bold text-[#14422D] font-['Manrope'] mb-3">{title}</h2>
      <p className="text-[14px] text-[#78716C] leading-relaxed font-['Be_Vietnam_Pro']">{desc}</p>
    </div>
    <div className="flex-1 w-full max-w-[800px]">{children}</div>
  </div>
)

// ─── Main page ──────────────────────────────────────────────────────────────────
export default function EditCafePage() {
  const router = useRouter()
  const params = useParams()
  const cafeId = params.id as string

  const [form, setForm] = useState<CafeForm>({
    name: '', address: '', description: '', facilities: [], images: [], isClosedOnHolidays: false,
    operatingHours: [
      { label: 'Thứ Hai - Thứ Sáu', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], openTime: '08:00', closeTime: '22:00', isDayOff: false },
      { label: 'Thứ Bảy', days: ['saturday'], openTime: '08:00', closeTime: '22:00', isDayOff: false },
      { label: 'Chủ Nhật', days: ['sunday'], openTime: '08:00', closeTime: '22:00', isDayOff: false },
    ]
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    async function fetchCafe() {
      try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        if (!user) return router.push('/login')

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const res = await fetch(`${apiUrl}/cafes/${cafeId}`)
        const rawData = await res.json()
        if (rawData.owner?.id !== user.id) return router.push('/dashboard')

        // Ưu tiên hiển thị dữ liệu đang chờ duyệt (nếu có) để chủ quán xem lại nội dung vừa sửa
        const data = rawData.pendingData ? { ...rawData, ...rawData.pendingData } : rawData;

        // Tái cấu trúc giờ hoạt động từ Backend thành 3 block
        const oh = data.operatingHours || []
        const getHoursForDay = (day: string) => oh.find((h: any) => h.dayOfWeek === day) || { openTime: '08:00', closeTime: '22:00', isDayOff: false }

        const mon = getHoursForDay('monday')
        const sat = getHoursForDay('saturday')
        const sun = getHoursForDay('sunday')

        setForm({
          name: data.name || '',
          address: data.address || '',
          description: data.description || '',
          facilities: data.facilities || [],
          images: data.images || [],
          isClosedOnHolidays: data.isClosedOnHolidays || false,
          operatingHours: [
            { label: 'Thứ Hai - Thứ Sáu', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], openTime: mon.openTime, closeTime: mon.closeTime, isDayOff: mon.isDayOff },
            { label: 'Thứ Bảy', days: ['saturday'], openTime: sat.openTime, closeTime: sat.closeTime, isDayOff: sat.isDayOff },
            { label: 'Chủ Nhật', days: ['sunday'], openTime: sun.openTime, closeTime: sun.closeTime, isDayOff: sun.isDayOff },
          ]
        })
      } catch (err) {
        alert('Không thể tải thông tin quán.')
      } finally {
        setLoading(false)
      }
    }
    fetchCafe()
  }, [cafeId, router])

  // Handlers
  const toggleFacility = (key: Facility) => setForm(f => ({
    ...f, facilities: f.facilities.includes(key) ? f.facilities.filter(k => k !== key) : [...f.facilities, key],
  }))

  const toggleDayOff = (idx: number) => setForm(f => {
    const hours = [...f.operatingHours]; hours[idx] = { ...hours[idx], isDayOff: !hours[idx].isDayOff }; return { ...f, operatingHours: hours }
  })

  const setTime = (idx: number, field: 'openTime' | 'closeTime', val: string) => setForm(f => {
    const hours = [...f.operatingHours]; hours[idx] = { ...hours[idx], [field]: val }; return { ...f, operatingHours: hours }
  })

  const handleAddNewPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalAfter = form.images.length + newPhotos.length + files.length;
    const errs: string[] = [];

    if (totalAfter > 5) {
      setFieldErrors(p => ({ ...p, photos: 'Tổng số ảnh không được vượt quá 5.' }));
      e.target.value = '';
      return;
    }
    const valid: { file: File; preview: string }[] = [];
    for (const f of files) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)) {
        errs.push(`"${f.name}" không hợp lệ.`);
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        errs.push(`"${f.name}" quá lớn (tối đa 10MB).`);
        continue;
      }
      valid.push({ file: f, preview: URL.createObjectURL(f) });
    }
    if (errs.length > 0) setFieldErrors(p => ({ ...p, photos: errs.join(' ') }));
    else setFieldErrors(p => { const n = { ...p }; delete n.photos; return n; });
    setNewPhotos(prev => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeExistingImage = (idx: number) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  const removeNewPhoto = (idx: number) => setNewPhotos(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });

  const handleSave = async () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = 'Vui lòng nhập tên quán.';
    else if (form.name.trim().length > 50) errors.name = 'Tên quán không được vượt quá 50 ký tự.';

    if (!form.address.trim()) errors.address = 'Vui lòng nhập địa chỉ.';
    else if (form.address.trim().length > 100) errors.address = 'Địa chỉ không được vượt quá 100 ký tự.';

    if (!form.description.trim()) errors.description = 'Vui lòng nhập mô tả.';
    else if (form.description.trim().length > 300) errors.description = 'Mô tả không được vượt quá 300 ký tự.';

    const totalImages = form.images.length + newPhotos.length;
    if (totalImages === 0) errors.photos = 'Vui lòng có ít nhất 1 hình ảnh.';
    else if (totalImages > 5) errors.photos = 'Tổng số ảnh không được vượt quá 5.';

    if (form.facilities.length === 0) errors.amenities = 'Vui lòng chọn ít nhất 1 tiện ích.';

    form.operatingHours.forEach((row, i) => {
      if (!row.isDayOff && row.openTime >= row.closeTime) {
        errors[`schedule_${i}`] = 'Giờ kết thúc phải sau giờ mở cửa.';
      }
    });

    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');

      // Mở rộng 3 block → 7 ngày cho backend
      const expandedHours: any[] = [];
      form.operatingHours.forEach(oh => {
        oh.days.forEach(day => {
          expandedHours.push({ dayOfWeek: day, openTime: oh.isDayOff ? null : oh.openTime, closeTime: oh.isDayOff ? null : oh.closeTime, isDayOff: oh.isDayOff });
        });
      });

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        facilities: form.facilities,
        isClosedOnHolidays: form.isClosedOnHolidays,
        operatingHours: expandedHours,
        images: form.images, // giữ lại ảnh cũ
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      newPhotos.forEach(p => formData.append('photos', p.file));

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/cafes/${cafeId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Có lỗi xảy ra khi lưu.');
      }

      showToast('Cập nhật thành công! Quán đang chờ Admin duyệt lại.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (e: any) {
      alert(e.message || 'Có lỗi xảy ra khi lưu.');
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAF5]">
        <Loader2 className="w-10 h-10 animate-spin text-[#14422D]" />
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: '#14422D', color: 'white', borderRadius: 12,
          padding: '14px 20px', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif',
          fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: 380,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="white" strokeWidth="2" strokeLinecap="round" /><polyline points="22 4 12 14.01 9 11.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {toast}
        </div>
      )}
      <CancelConfirmDialog isOpen={showCancelDialog} onClose={() => setShowCancelDialog(false)} title="Hủy chỉnh sửa?" />
      <main className="h-full overflow-y-auto px-12 py-10 font-['Be_Vietnam_Pro'] z-10" style={{ height: '100%' }}>

        {/* Nút Quay lại */}
        <button
          onClick={() => setShowCancelDialog(true)}
          className="flex items-center gap-2 text-[#14422D] hover:text-[#0d2e1f] font-bold text-[12px] uppercase tracking-widest mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại Dashboard
        </button>

        {/* Tiêu đề trang */}
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#14422D] font-['Manrope'] mb-2 leading-tight">
            Chỉnh sửa thông tin của quán
          </h1>
          <p className="text-[#57534E] text-base">
            Cập nhật thông tin chi tiết của quán để khách hàng có thông tin chính xác nhất.
          </p>
        </div>

        {/* Vùng Content (Trải rộng màn hình) */}
        <div className="flex flex-col gap-16 pb-24">

          {/* 1. THÔNG TIN CƠ BẢN */}
          <Section
            title="Thông tin cơ bản"
            desc="Tên quán và địa chỉ chính xác giúp khách hàng dễ dàng tìm thấy bạn trên bản đồ."
          >
            <div className="bg-white rounded-[16px] border border-[#E7E5E4] p-8 flex flex-col gap-6 shadow-sm">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#904C18] uppercase tracking-wider block">Tên quán</label>
                <input
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full bg-white border rounded-[8px] px-4 py-3 text-[15px] text-[#1A1C19] focus:outline-none transition-colors ${fieldErrors.name ? 'border-red-400' : 'border-[#E7E5E4] focus:border-[#14422D]'}`}
                />
                {fieldErrors.name && <p className="text-red-600 text-[12px] mt-1">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#904C18] uppercase tracking-wider block">Địa chỉ</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className={`w-full bg-white border rounded-[8px] pl-12 pr-4 py-3 text-[15px] text-[#1A1C19] focus:outline-none transition-colors ${fieldErrors.address ? 'border-red-400' : 'border-[#E7E5E4] focus:border-[#14422D]'}`}
                  />
                </div>
                {fieldErrors.address && <p className="text-red-600 text-[12px] mt-1">{fieldErrors.address}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#904C18] uppercase tracking-wider block">Mô tả quán</label>
                <textarea
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  className={`w-full bg-white border rounded-[8px] px-4 py-3 text-[15px] text-[#1A1C19] focus:outline-none transition-colors resize-none leading-relaxed ${fieldErrors.description ? 'border-red-400' : 'border-[#E7E5E4] focus:border-[#14422D]'}`}
                />
                {fieldErrors.description && <p className="text-red-600 text-[12px] mt-1">{fieldErrors.description}</p>}
              </div>
            </div>
          </Section>

          {/* 2. BỘ SƯU TẬP */}
          <Section
            title="Bộ sưu tập"
            desc="Hình ảnh đẹp và rõ nét về không gian làm việc sẽ thu hút nhiều khách hàng hơn."
          >
            <div className="flex flex-wrap gap-4">
              {(form.images.length + newPhotos.length) < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-[200px] h-[140px] rounded-[16px] border border-dashed border-[#D6D3D1] flex flex-col items-center justify-center gap-2 text-[#78716C] hover:text-[#14422D] hover:border-[#14422D] hover:bg-[#FAFAF5] transition-all cursor-pointer bg-transparent"
                >
                  <ImagePlus size={24} strokeWidth={1.5} />
                  <span className="font-bold text-[13px]">Thêm ảnh</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={handleAddNewPhoto} className="hidden" />

              {/* Ảnh cũ (từ server) */}
              {form.images.map((src, idx) => (
                <div key={`old-${idx}`} className="relative w-[160px] h-[120px] rounded-[16px] overflow-hidden border border-[#E7E5E4] group shadow-sm">
                  <img src={src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${src}`} alt="Cafe" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {/* Badge "Ảnh bìa" chỉ hiển thị ở ảnh đầu tiên */}
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#14422D]/85 text-white text-[9px] text-center py-[3px] font-bold tracking-wide pointer-events-none">
                      ẢNH BÌA
                    </div>
                  )}
                  <button onClick={() => removeExistingImage(idx)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}

              {/* Ảnh mới chưa upload */}
              {newPhotos.map((p, idx) => (
                <div key={`new-${idx}`} className="relative w-[160px] h-[120px] rounded-[16px] overflow-hidden border-2 border-dashed border-[#14422D] group shadow-sm">
                  <img src={p.preview} alt="New" className="w-full h-full object-cover" />
                  <button onClick={() => removeNewPhoto(idx)} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    <X size={12} strokeWidth={3} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#14422D]/80 text-white text-[10px] text-center py-1 font-bold">Mới</div>
                </div>
              ))}
            </div>
            {fieldErrors.photos && <p className="text-red-600 text-[12px] mt-2">{fieldErrors.photos}</p>}
          </Section>

          {/* 3. TIỆN ÍCH & KHÔNG GIAN */}
          <Section
            title="Tiện ích & Không gian"
            desc="Chọn các tiện ích nổi bật nhất mà quán của bạn đang cung cấp cho khách hàng."
          >
            <div className="bg-[#FAFAF5] p-8 rounded-[16px] border border-[#E7E5E4] flex flex-wrap gap-3">
              {FACILITIES.map(({ key, label, icon }) => {
                const active = form.facilities.includes(key);
                return (
                  <button
                    key={key} onClick={() => toggleFacility(key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all border ${active
                      ? 'bg-[#14422D] text-white border-[#14422D] shadow-sm'
                      : 'bg-white text-[#1A1C19] border-[#D6D3D1] hover:border-[#A8A29E]'
                      }`}
                  >
                    {icon} {label}
                  </button>
                )
              })}
            </div>
            {fieldErrors.amenities && <p className="text-red-600 text-[12px] mt-2">{fieldErrors.amenities}</p>}
          </Section>

          {/* 4. GIỜ HOẠT ĐỘNG */}
          <Section
            title="Giờ hoạt động"
            desc="Thiết lập thời gian đóng mở cửa chính xác cho từng giai đoạn trong tuần."
          >
            <div className="flex flex-col gap-4">
              {form.operatingHours.map((row, idx) => (
                <div key={row.label} className={`px-6 py-5 rounded-[12px] border border-[#E7E5E4] flex items-center justify-between shadow-sm ${row.isDayOff ? 'bg-[#FAFAF5]' : 'bg-white'}`}>

                  {/* Nhãn Thứ */}
                  <div className={`font-bold text-[15px] w-40 ${row.isDayOff ? 'text-[#A8A29E]' : 'text-[#14422D]'}`}>
                    {row.label}
                  </div>

                  {/* Cụm input giờ */}
                  <div className="flex items-center gap-6">
                    {row.isDayOff ? (
                      <>
                        <div className="w-[120px] border border-[#E7E5E4] rounded-[8px] px-3 py-2 text-[14px] font-medium text-center text-[#A8A29E] bg-[#FAFAF5]">—</div>
                        <div className="w-[120px] border border-[#E7E5E4] rounded-[8px] px-3 py-2 text-[14px] font-medium text-center text-[#A8A29E] bg-[#FAFAF5]">—</div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            type="time" value={row.openTime} onChange={e => setTime(idx, 'openTime', e.target.value)}
                            className="w-[120px] border border-[#E7E5E4] rounded-[8px] px-3 py-2 text-[14px] font-medium focus:outline-none focus:border-[#14422D] text-center"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="time" value={row.closeTime} onChange={e => setTime(idx, 'closeTime', e.target.value)}
                            className="w-[120px] border border-[#E7E5E4] rounded-[8px] px-3 py-2 text-[14px] font-medium focus:outline-none focus:border-[#14422D] text-center"
                          />
                        </div>
                      </>
                    )}

                    {/* Checkbox Nghỉ */}
                    <label className="flex items-center gap-2 cursor-pointer ml-4">
                      <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center transition-colors border ${row.isDayOff ? 'bg-[#14422D] border-[#14422D]' : 'bg-white border-[#D6D3D1]'}`}>
                        {row.isDayOff && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox" className="hidden"
                        checked={row.isDayOff} onChange={() => toggleDayOff(idx)}
                      />
                      <span className={`text-[14px] font-bold ${row.isDayOff ? 'text-[#1A1C19]' : 'text-[#78716C]'}`}>Nghỉ</span>
                    </label>
                  </div>

                </div>
              ))}

              {/* Checkbox Đóng cửa Lễ */}
              <div className="mt-4 flex items-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-[20px] h-[20px] rounded-[6px] flex items-center justify-center transition-colors border ${form.isClosedOnHolidays ? 'bg-[#14422D] border-[#14422D]' : 'bg-[#FAFAF5] border-[#D6D3D1] group-hover:border-[#14422D]'}`}>
                    {form.isClosedOnHolidays && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox" className="hidden"
                    checked={form.isClosedOnHolidays} onChange={() => setForm(f => ({ ...f, isClosedOnHolidays: !f.isClosedOnHolidays }))}
                  />
                  <span className="font-bold text-[15px] text-[#1A1C19]">Đóng cửa vào ngày lễ</span>
                </label>
              </div>
            </div>
          </Section>

        </div>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-[#E7E5E4] pt-8 flex items-center justify-end gap-4 pb-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 rounded-full font-bold text-[#57534E] border border-[#E7E5E4] bg-white hover:bg-[#F5F5F0] transition-colors text-[15px] min-w-[120px]"
          >
            Hủy
          </button>
          <button
            onClick={handleSave} disabled={saving}
            className="flex items-center justify-center gap-2 px-10 py-3 rounded-full font-bold text-white bg-[#14422D] hover:bg-[#0d2e1f] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-[15px] min-w-[180px]"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Đang lưu...</> : 'Lưu thay đổi'}
          </button>
        </div>

      </main>
    </>
  )
}