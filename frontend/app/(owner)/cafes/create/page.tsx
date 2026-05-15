'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Sidebar from '@/components/OwnerSidebar';
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
  { id: 'power', label: 'Ổ cắm điện', icon: <Zap size={16} /> },
  { id: 'desk', label: 'Bàn làm việc', icon: <Monitor size={16} /> },
  { id: 'snack', label: 'Đồ ăn nhẹ', icon: <UtensilsCrossed size={16} /> },
  { id: 'clean', label: 'Độ sạch sẽ', icon: <Sparkles size={16} /> },
  { id: 'workspace', label: 'Không gian làm việc', icon: <Laptop size={16} /> },
  { id: 'smoking', label: 'Quy định hút thuốc', icon: <Cigarette size={16} /> },
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
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: React.ReactNode;
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
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
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

    if (!name.trim()) return setError('Vui lòng nhập tên quán.');
    if (!address.trim()) return setError('Vui lòng nhập địa chỉ quán.');

    setIsSubmitting(true);

    try {
      // 1. Geocode address → coordinates via Nominatim
      const searchQuery = `${address.trim()}, Hà Nội, Việt Nam`;
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          searchQuery
        )}`,
        { headers: { 'Accept-Language': 'vi' } }
      );
      const geocodeData = await geocodeRes.json();

      if (!geocodeData || geocodeData.length === 0) {
        setError(
          'Không thể xác định tọa độ từ địa chỉ này. Vui lòng nhập rõ hơn (VD: Số nhà, Tên đường, Quận).'
        );
        setIsSubmitting(false);
        return;
      }

      const lat = parseFloat(geocodeData[0].lat);
      const lng = parseFloat(geocodeData[0].lon);

      // 2. Build payload
      const payload = {
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        latitude: lat,
        longitude: lng,
        amenities: Array.from(selectedAmenities),
        schedule: {
          weekday: schedule.weekday,
          saturday: schedule.saturday,
          sunday: schedule.sunday,
          closedOnHolidays,
        },
      };

      // 3. Send to backend
      // If photos are needed, use FormData:
      // const formData = new FormData();
      // formData.append('data', JSON.stringify(payload));
      // photos.forEach((p) => formData.append('photos', p.file));

      const backendRes = await fetch('/api/cafes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!backendRes.ok) {
        const msg = await backendRes.text();
        throw new Error(msg || 'Lỗi từ server');
      }

      // 4. Success
      router.push('/owner/dashboard');
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF5' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          paddingTop: 64,
          paddingBottom: 96,
          paddingLeft: 32,
          paddingRight: 32,
          boxSizing: 'border-box',
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1
            style={{
              margin: 0,
              color: '#14422D',
              fontSize: 48,
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
              fontSize: 20,
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
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <FormLabel>Địa chỉ</FormLabel>
                  <TextInput
                    placeholder="Ví dụ: 45 Lý Quốc Sư, Hoàn Kiếm, Hà Nội"
                    value={address}
                    onChange={setAddress}
                    prefix={<MapPin size={16} />}
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
                {/* Add photo button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 160,
                    height: 120,
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
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleAddPhoto}
              />

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
            onClick={() => router.back()}
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
    </div>
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