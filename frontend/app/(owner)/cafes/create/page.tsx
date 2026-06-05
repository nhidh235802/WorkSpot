'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import CancelConfirmDialog from '@/components/CancelCreateDialog';
import {
  Info,
  Image as ImageIcon,
  Clock,
  MapPin,
  Wifi,
  Zap,
  Monitor,
  UtensilsCrossed,
  Sparkles,
  Laptop,
  Cigarette,
  X,
  Plus,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type DaySchedule = {
  isClosed: boolean;
  open: string;
  close: string;
};

type Amenity = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const AMENITIES: Amenity[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={16} /> },
  { id: 'socket', label: 'Ổ cắm điện', icon: <Zap size={16} /> },
  { id: 'desk', label: 'Bàn làm việc', icon: <Monitor size={16} /> },
  { id: 'snack', label: 'Đồ ăn nhẹ', icon: <UtensilsCrossed size={16} /> },
  { id: 'cleanliness', label: 'Độ sạch sẽ', icon: <Sparkles size={16} /> },
  { id: 'workspace', label: 'Không gian làm việc', icon: <Laptop size={16} /> },
  { id: 'smoking_rule', label: 'Quy định hút thuốc', icon: <Cigarette size={16} /> },
];

const DAY_GROUPS = [
  { key: 'weekday', label: 'Thứ Hai - Thứ Sáu' },
  { key: 'saturday', label: 'Thứ Bảy' },
  { key: 'sunday', label: 'Chủ Nhật' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontWeight: 900,
        color: '#904C18',
        textTransform: 'uppercase' as const,
        letterSpacing: 2,
        lineHeight: '15px',
      }}
    >
      {children}
    </span>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  prefix,
  error,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: React.ReactNode;
  error?: string;
}) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {prefix && (
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#D6D3D1',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {prefix}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingTop: 18,
          paddingBottom: 18,
          paddingLeft: prefix ? 48 : 16,
          paddingRight: 16,
          background: '#FAFAF5',
          borderRadius: 12,
          border: '1px solid #F5F5F4',
          outline: 'none',
          fontSize: 16,
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontWeight: 400,
          color: '#1A1C19',
        }}
      />
      {/* 3. Hiển thị chữ đỏ dưới input */}
      {error && (
        <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
          {error}
        </span>
      )}
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      onClick={(e) => {
        if (!disabled) {
          try {
            e.currentTarget.showPicker();
          } catch (err) { }
        }
      }}
      style={{
        flex: 1,
        padding: '10px',
        background: disabled ? '#F5F5F4' : '#FAFAF5',
        borderRadius: 8,
        border: '1px solid #F5F5F4',
        outline: 'none',
        fontSize: 12,
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontWeight: 500,
        color: disabled ? '#A8A29E' : '#1A1C19',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateCafeForm() {
  const router = useRouter();

  // ── Basic info
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // ── Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(
    new Set()
  );

  // ── Photos
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Schedule
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    weekday: { isClosed: false, open: '08:00', close: '22:00' },
    saturday: { isClosed: false, open: '08:00', close: '23:00' },
    sunday: { isClosed: false, open: '08:00', close: '22:00' },
  });
  const [closedOnHolidays, setClosedOnHolidays] = useState(true);

  // ── Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // ─── Handlers ────────────────────────────────────────────────────────────

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errs: string[] = [];

    if (photos.length + files.length > 5) {
      setFieldErrors(prev => ({ ...prev, photos: 'Chỉ được tải lên tối đa 5 ảnh.' }));
      e.target.value = '';
      return;
    }

    const validPhotos: { file: File; preview: string }[] = [];
    for (const file of files) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png') {
        errs.push(`"${file.name}" không hợp lệ. Chỉ chấp nhận .JPG, .JPEG, .PNG.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        errs.push(`"${file.name}" quá lớn. Tối đa 10MB.`);
        continue;
      }
      validPhotos.push({ file, preview: URL.createObjectURL(file) });
    }

    if (errs.length > 0) {
      setFieldErrors(prev => ({ ...prev, photos: errs.join(' ') }));
    } else {
      setFieldErrors(prev => { const n = { ...prev }; delete n.photos; return n; });
    }

    setPhotos((prev) => [...prev, ...validPhotos]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateSchedule = (
    key: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setError('');
    const errors: Record<string, string> = {};

    // 1. Validate Tên quán
    if (!name.trim()) errors.name = 'Vui lòng nhập tên quán.';
    else if (name.trim().length > 50) errors.name = 'Tên quán không được vượt quá 50 ký tự.';

    // 2. Validate Địa chỉ
    if (!address.trim()) errors.address = 'Vui lòng nhập địa chỉ quán.';
    else if (address.trim().length > 100) errors.address = 'Địa chỉ không được vượt quá 100 ký tự.';

    // 3. Validate Mô tả
    if (!description.trim()) errors.description = 'Vui lòng nhập mô tả quán.';
    else if (description.trim().length > 300) errors.description = 'Mô tả không được vượt quá 300 ký tự.';

    // 4. Validate Ảnh (1-5)
    if (photos.length === 0) errors.photos = 'Vui lòng tải lên ít nhất 1 hình ảnh của quán.';
    else if (photos.length > 5) errors.photos = 'Chỉ được tải lên tối đa 5 ảnh.';

    // 5. Validate Tiện ích
    if (selectedAmenities.size === 0) errors.amenities = 'Vui lòng chọn ít nhất 1 tiện ích.';

    // 6. Validate Giờ hoạt động
    DAY_GROUPS.forEach(day => {
      const s = schedule[day.key];
      if (!s.isClosed && s.open >= s.close) {
        errors[`schedule_${day.key}`] = 'Giờ kết thúc phải sau giờ mở cửa.';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // 1. Geocode
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address.trim() + ', Việt Nam')}`,
        { headers: { 'Accept-Language': 'vi' } }
      );
      const geocodeData = await geocodeRes.json();
      const lat = geocodeData?.[0] ? parseFloat(geocodeData[0].lat) : undefined;
      const lng = geocodeData?.[0] ? parseFloat(geocodeData[0].lon) : undefined;

      if (lat === undefined || lng === undefined) {
        throw new Error('Địa chỉ này không thể định vị trên bản đồ. Vui lòng nhập địa chỉ chính xác và chi tiết hơn (ví dụ: số nhà, tên đường, phường, quận, Hà Nội).');
      }

      // 2. Chuyển schedule → mảng OperatingHours cho backend
      const operatingHours: { dayOfWeek: string; openTime: string | null; closeTime: string | null; isDayOff: boolean }[] = [];
      const dayMap: Record<string, string[]> = {
        weekday: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        saturday: ['saturday'],
        sunday: ['sunday'],
      };
      DAY_GROUPS.forEach(({ key }) => {
        const s = schedule[key];
        dayMap[key].forEach(d => {
          operatingHours.push({
            dayOfWeek: d,
            openTime: s.isClosed ? null : s.open,
            closeTime: s.isClosed ? null : s.close,
            isDayOff: s.isClosed,
          });
        });
      });

      // 3. Build FormData
      const token = localStorage.getItem('access_token');
      const payload = {
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        ...(lat !== undefined && { latitude: lat }),
        ...(lng !== undefined && { longitude: lng }),
        facilities: Array.from(selectedAmenities),
        isClosedOnHolidays: closedOnHolidays,
        operatingHours,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      photos.forEach(p => formData.append('photos', p.file));
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/cafes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Lỗi từ server');
      }

      showToast("Đăng ký thành công! Quán đang ở trạng thái 'Chờ duyệt'.");
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

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
      <div
        style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          paddingTop: 40,
          paddingBottom: 40,
          paddingLeft: 48,
          paddingRight: 48,
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1
            style={{
              margin: 0,
              color: '#14422D',
              fontSize: 40,
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 800,
              lineHeight: '56px',
            }}
          >
            Đăng ký quán mới
          </h1>
          <p
            style={{
              margin: 0,
              color: '#78716C',
              fontSize: 16,
              fontFamily: 'Be Vietnam Pro, sans-serif',
              fontWeight: 400,
              lineHeight: '26px',
            }}
          >
            Đưa không gian của bạn vào mạng lưới của WorkSpot. Hãy cung cấp thông tin để chào đón
            cộng đồng mới.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 3fr', gap: 32 }}>
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Card: Thông tin cơ bản */}
            <div style={cardStyle}>
              <SectionHeader icon={<Info size={18} color="#14422D" />} title="Thông tin cơ bản" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <FormLabel>Tên quán</FormLabel>
                  <TextInput
                    placeholder="Ví dụ: Cafe Studio"
                    value={name}
                    onChange={setName}
                    error={fieldErrors.name}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <FormLabel>Địa chỉ</FormLabel>
                  <TextInput
                    placeholder="Ví dụ: 45 Lý Quốc Sư, Hoàn Kiếm, Hà Nội"
                    value={address}
                    onChange={setAddress}
                    prefix={<MapPin size={16} />}
                    error={fieldErrors.address}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <FormLabel>Mô tả quán</FormLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Một không gian yên tĩnh ngay trung tâm Hà Nội, được thiết kế tối giản..."
                    rows={4}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: 16,
                      background: '#FAFAF5',
                      borderRadius: 12,
                      border: '1px solid #F5F5F4',
                      outline: 'none',
                      fontSize: 16,
                      fontFamily: 'Be Vietnam Pro, sans-serif',
                      fontWeight: 400,
                      color: '#1A1C19',
                      lineHeight: '24px',
                      resize: 'vertical',
                    }}
                  />
                  {fieldErrors.description && (
                    <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                      {fieldErrors.description}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card: Tiện ích & Không gian */}
            <div style={cardStyle}>
              <SectionHeader
                icon={
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                    <rect x="0" y="0" width="22" height="3" rx="1.5" fill="#14422D" />
                    <rect x="0" y="6.5" width="22" height="3" rx="1.5" fill="#14422D" />
                    <rect x="0" y="13" width="22" height="3" rx="1.5" fill="#14422D" />
                  </svg>
                }
                title="Tiện ích & Không gian"
              />

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap' as const,
                  gap: 12,
                }}
              >
                {AMENITIES.map((a) => {
                  const active = selectedAmenities.has(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAmenity(a.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 10,
                        paddingBottom: 10,
                        borderRadius: 12,
                        border: 'none',
                        cursor: 'pointer',
                        background: active ? '#14422D' : '#F5F5F4',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ color: active ? 'white' : '#57534E', display: 'flex' }}>
                        {a.icon}
                      </span>
                      <span
                        style={{
                          color: active ? 'white' : '#57534E',
                          fontSize: 14,
                          fontFamily: 'Be Vietnam Pro, sans-serif',
                          fontWeight: 700,
                          lineHeight: '20px',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {fieldErrors?.amenities && (
                <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {fieldErrors.amenities}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Card: Bộ sưu tập */}
            <div style={cardStyle}>
              <SectionHeader icon={<ImageIcon size={18} color="#14422D" />} title="Bộ sưu tập" />

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap' as const,
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {/* Photo previews */}
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    style={{ position: 'relative', width: 100, height: 90, borderRadius: 12, overflow: 'hidden' }}
                  >
                    <img
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Badge "Ảnh bìa" cho ảnh đầu tiên */}
                    {index === 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(20, 66, 45, 0.85)',
                          color: 'white',
                          fontSize: 9,
                          fontFamily: 'Be Vietnam Pro, sans-serif',
                          fontWeight: 700,
                          textAlign: 'center',
                          padding: '3px 0',
                          letterSpacing: 0.5,
                        }}
                      >
                        ẢNH BÌA
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: 9999,
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <X size={10} color="white" />
                    </button>
                  </div>
                ))}

                {/* Add photo button – only shown when fewer than 5 photos */}
                {photos.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 100,
                      height: 90,
                      background: '#FAFAF5',
                      border: '2px dashed #E7E5E4',
                      borderRadius: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={18} color="#A8A29E" />
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontWeight: 700,
                        color: '#78716C',
                        textTransform: 'uppercase' as const,
                        letterSpacing: 0.5,
                      }}
                    >
                      Thêm ảnh
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                style={{ display: 'none' }}
                onChange={handleAddPhoto}
              />

              {fieldErrors?.photos && (
                <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
                  {fieldErrors.photos}
                </span>
              )}

              <p
                style={{
                  margin: 0,
                  marginTop: 8,
                  fontSize: 10,
                  fontFamily: 'Be Vietnam Pro, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#A8A29E',
                  lineHeight: '16px',
                }}
              >
                * Hình ảnh đẹp và rõ nét về không gian làm việc sẽ thu hút nhiều khách hàng hơn.
              </p>
            </div>

            {/* Card: Giờ hoạt động */}
            <div style={cardStyle}>
              <SectionHeader icon={<Clock size={18} color="#14422D" />} title="Giờ hoạt động" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {DAY_GROUPS.map((day) => {
                  const s = schedule[day.key];
                  return (
                    <div key={day.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Row: label + Nghỉ checkbox */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: 'Be Vietnam Pro, sans-serif',
                            fontWeight: 700,
                            color: '#292524',
                            lineHeight: '16px',
                          }}
                        >
                          {day.label}
                        </span>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={s.isClosed}
                            onChange={(e) => updateSchedule(day.key, 'isClosed', e.target.checked)}
                            style={{ display: 'none' }}
                          />
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 4,
                              border: s.isClosed ? 'none' : '1px solid #D6D3D1',
                              background: s.isClosed ? '#14422D' : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {s.isClosed && (
                              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: 'Be Vietnam Pro, sans-serif',
                              fontWeight: 400,
                              color: '#78716C',
                              lineHeight: '16.5px',
                            }}
                          >
                            Nghỉ
                          </span>
                        </label>
                      </div>

                      {/* Time inputs */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          opacity: s.isClosed ? 0.4 : 1,
                          pointerEvents: s.isClosed ? 'none' : 'all',
                        }}
                      >
                        {fieldErrors[`schedule_${day.key}`] && (
                          <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                            {fieldErrors[`schedule_${day.key}`]}
                          </span>
                        )}
                        <TimeInput
                          value={s.open}
                          onChange={(v) => updateSchedule(day.key, 'open', v)}
                          disabled={s.isClosed}
                        />
                        <span style={{ color: '#D6D3D1', fontSize: 16 }}>~</span>
                        <TimeInput
                          value={s.close}
                          onChange={(v) => updateSchedule(day.key, 'close', v)}
                          disabled={s.isClosed}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Divider */}
                <div style={{ borderTop: '1px solid #F5F5F4', paddingTop: 16 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={closedOnHolidays}
                      onChange={(e) => setClosedOnHolidays(e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        border: closedOnHolidays ? 'none' : '1px solid #D6D3D1',
                        background: closedOnHolidays ? '#14422D' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {closedOnHolidays && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: 'Be Vietnam Pro, sans-serif',
                        fontWeight: 500,
                        color: '#57534E',
                        lineHeight: '20px',
                      }}
                    >
                      Đóng cửa vào ngày lễ
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: 24,
              padding: '12px 16px',
              background: '#FEF2F2',
              borderRadius: 12,
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: 14,
              fontFamily: 'Be Vietnam Pro, sans-serif',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <button
            onClick={() => setShowCancelDialog(true)}
            style={{
              paddingLeft: 48,
              paddingRight: 48,
              paddingTop: 12,
              paddingBottom: 12,
              background: 'white',
              borderRadius: 9999,
              border: '1px solid #E7E5E4',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'Be Vietnam Pro, sans-serif',
              fontWeight: 700,
              color: '#44403C',
            }}
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              paddingLeft: 48,
              paddingRight: 48,
              paddingTop: 12,
              paddingBottom: 12,
              background: isSubmitting ? '#5B8A72' : '#14422D',
              borderRadius: 9999,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontFamily: 'Be Vietnam Pro, sans-serif',
              fontWeight: 700,
              color: 'white',
              boxShadow: '0px 10px 15px -3px rgba(20,66,45,0.20), 0px 4px 6px -4px rgba(20,66,45,0.20)',
              transition: 'background 0.15s ease',
            }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
      <CancelConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
      />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  padding: 32,
  background: 'white',
  boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
};

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</div>
      <h2
        style={{
          margin: 0,
          color: '#14422D',
          fontSize: 20,
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 700,
          lineHeight: '28px',
        }}
      >
        {title}
      </h2>
    </div>
  );
}