'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ─────────────────────────────────────────────────────────────────────
type Facility = 'wifi' | 'socket' | 'desk' | 'snack' | 'cleanliness' | 'workspace' | 'smoking_rule'

interface OperatingHour {
  label: string
  days: string[]
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
  {
    key: 'wifi', label: 'Wi-Fi',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" /></svg>
  },
  {
    key: 'socket', label: 'Ổ cắm điện',
    icon: <svg width="10" height="14" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="1" x2="5" y2="5" /><line x1="9" y1="1" x2="9" y2="5" /><rect x="2" y="5" width="10" height="9" rx="4" /><line x1="7" y1="14" x2="7" y2="19" /></svg>
  },
  {
    key: 'desk', label: 'Bàn làm việc',
    icon: <svg width="14" height="10" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="18" height="5" rx="1" /><line x1="4" y1="6" x2="4" y2="13" /><line x1="16" y1="6" x2="16" y2="13" /><line x1="4" y1="10" x2="16" y2="10" /></svg>
  },
  {
    key: 'snack', label: 'Đồ ăn nhẹ',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="9" cy="9.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="10.5" cy="15" r="1" fill="currentColor" stroke="none" /></svg>
  },
  {
    key: 'cleanliness', label: 'Độ sạch sẽ',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="10" y="2" width="4" height="6" rx="2" /><rect x="3" y="8" width="18" height="10" rx="2" /><line x1="8" y1="11" x2="8" y2="16" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="16" y1="11" x2="16" y2="16" /></svg>
  },
  {
    key: 'workspace', label: 'Không gian làm việc',
    icon: <svg width="16" height="12" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="20" height="11" rx="2" /><line x1="7" y1="15" x2="15" y2="15" /><line x1="11" y1="12" x2="11" y2="15" /></svg>
  },
  {
    key: 'smoking_rule', label: 'Quy định hút thuốc',
    icon: <svg width="16" height="14" viewBox="0 0 22 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="12" x2="14" y2="12" /><line x1="16" y1="12" x2="20" y2="12" /><path d="M14 9 c3 0 3 3 3 3" /><path d="M12 6 c3 0 4 2 4 6" /><line x1="2" y1="2" x2="20" y2="16" /></svg>
  },
]

// ─── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ userName = 'Minh Anh' }: { userName?: string }) {
  const navItems = [
    { label: 'Tổng quan', active: true, icon: <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="1" width="7" height="7" rx="1.5" /><rect x="10" y="1" width="7" height="7" rx="1.5" /><rect x="1" y="10" width="7" height="7" rx="1.5" /><rect x="10" y="10" width="7" height="7" rx="1.5" /></svg> },
    { label: 'Đăng ký quán mới', active: false, icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h7" /><polyline points="12,2 12,6 16,6" /><path d="M16 2h-4" /><path d="M13 13.5l3.5-3.5a1.2 1.2 0 0 1 1.7 1.7L14.7 15l-2.2.5.5-2z" /><line x1="7" y1="8" x2="11" y2="8" /><line x1="7" y1="11" x2="10" y2="11" /></svg> },
    { label: 'Hồ sơ cá nhân', active: false, icon: <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="6" r="3.5" /><path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6" /></svg> },
  ]

  return (
    <div style={{ width: 288, minHeight: '100vh', background: '#FAFAF5', borderRight: '1px solid rgba(120,113,108,0.1)', padding: 24, display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10 }}>
      {/* Brand */}
      <div style={{ paddingBottom: 40 }}>
        <div style={{ color: '#1C1917', fontSize: 20, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '28px' }}>WorkSpot Owner</div>
        <div style={{ color: '#A8A29E', fontSize: 10, fontFamily: 'Be Vietnam Pro, sans-serif', letterSpacing: '0.08em', lineHeight: '16px', marginTop: 2 }}>Cổng thông tin Hà Nội</div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => (
          <button key={item.label} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: item.active ? '#14422D' : 'transparent', color: item.active ? 'white' : '#78716C', fontSize: 14, fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: item.active ? 700 : 500, lineHeight: '20px', textAlign: 'left', boxShadow: item.active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
            <span style={{ color: item.active ? 'white' : '#78716C', flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: 24 }}>
        <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#D6D3D1', flexShrink: 0, overflow: 'hidden' }}>
            <img src="https://placehold.co/40x40" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ color: '#1C1917', fontSize: 14, fontFamily: 'Roboto, sans-serif', fontWeight: 500, lineHeight: '20px' }}>{userName}</div>
            <div style={{ color: '#78716C', fontSize: 10, fontFamily: 'Be Vietnam Pro, sans-serif', lineHeight: '16px' }}>Chủ quán</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
      {/* Left label */}
      <div style={{ width: 240, flexShrink: 0, paddingTop: 4 }}>
        <div style={{ color: '#14422D', fontSize: 24, fontFamily: 'Manrope, sans-serif', fontWeight: 700, lineHeight: '32px', marginBottom: 12 }}>{title}</div>
        <div style={{ color: '#525252', fontSize: 14, fontFamily: 'Noto Sans, sans-serif', fontWeight: 400, lineHeight: '24px' }}>{description}</div>
      </div>
      {/* Right content */}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  color: '#92400E', fontSize: 12, fontFamily: 'Noto Sans, sans-serif',
  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '16px',
}

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'white',
  border: 'none', outline: '1px solid rgba(120,113,108,0.3)', outlineOffset: -1,
  borderRadius: 8, padding: '12px 16px',
  color: '#1C1917', fontSize: 16, fontFamily: 'Noto Sans, sans-serif',
  fontWeight: 400, lineHeight: '24px',
}

// ─── Main page ──────────────────────────────────────────────────────────────────
export default function EditCafePage() {
  const router = useRouter()

  const [form, setForm] = useState<CafeForm>({
    name: 'Cafe Studio',
    address: '45 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
    description: 'Một không gian yên tĩnh ngay trung tâm Hà Nội, được thiết kế tối giản dành riêng cho những ai cần sự tập trung để làm việc và sáng tạo.',
    facilities: ['wifi', 'socket'],
    images: ['https://placehold.co/300x208'],
    isClosedOnHolidays: true,
    operatingHours: [
      { label: 'Thứ Hai - Thứ Sáu', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], openTime: '08:00', closeTime: '22:00', isDayOff: false },
      { label: 'Thứ Bảy', days: ['saturday'], openTime: '08:00', closeTime: '23:00', isDayOff: false },
      { label: 'Chủ Nhật', days: ['sunday'], openTime: '08:00', closeTime: '22:00', isDayOff: true },
    ],
  })

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toggle facility
  function toggleFacility(key: Facility) {
    setForm(f => ({
      ...f,
      facilities: f.facilities.includes(key)
        ? f.facilities.filter(k => k !== key)
        : [...f.facilities, key],
    }))
  }

  // Toggle day off
  function toggleDayOff(idx: number) {
    setForm(f => {
      const hours = [...f.operatingHours]
      hours[idx] = { ...hours[idx], isDayOff: !hours[idx].isDayOff }
      return { ...f, operatingHours: hours }
    })
  }

  function setTime(idx: number, field: 'openTime' | 'closeTime', val: string) {
    setForm(f => {
      const hours = [...f.operatingHours]
      hours[idx] = { ...hours[idx], [field]: val }
      return { ...f, operatingHours: hours }
    })
  }

  // Add image
  function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm(f => ({ ...f, images: [...f.images, reader.result as string] }))
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  // Save
  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      // TODO: gọi API PATCH /cafes/:id với form data
      await new Promise(r => setTimeout(r, 800)) // simulate
      router.push('/')
    } catch (e: unknown) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // Format time display: "08:00" → "08 : 00  AM"
  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number)
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return { h: String(h12).padStart(2, '0'), m: String(m).padStart(2, '0'), ampm }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF5', display: 'flex' }}>
      <Sidebar />

      {/* Main content */}
      <div style={{ marginLeft: 288, flex: 1, padding: '64px 48px 112px', maxWidth: 1280 - 288, boxSizing: 'border-box' }}>

        {/* Back link */}
        <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#14422D', fontSize: 14, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: '20px', padding: 0, marginBottom: 20 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#14422D" strokeWidth="2.5" strokeLinecap="round"><path d="M14 8H2M2 8l5-5M2 8l5 5" /></svg>
          Quay lại Dashboard
        </button>

        {/* Page title */}
        <div style={{ marginBottom: 56 }}>
          <h1 style={{ margin: 0, color: '#14422D', fontSize: 48, fontFamily: 'Manrope, sans-serif', fontWeight: 800, lineHeight: '48px', marginBottom: 20 }}>
            Chỉnh sửa thông tin của quán
          </h1>
          <p style={{ margin: 0, maxWidth: 672, color: '#525252', fontSize: 20, fontFamily: 'Noto Sans, sans-serif', fontWeight: 400, lineHeight: '32px' }}>
            Cập nhật thông tin chi tiết của quán để khách hàng có thông tin chính xác nhất.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

          {/* ── Thông tin cơ bản ── */}
          <Section title="Thông tin cơ bản" description={'Tên quán và địa chỉ chính xác giúp khách hàng dễ dàng tìm thấy bạn trên bản đồ.'}>
            <div style={{ background: '#FAFAF5', borderRadius: 16, outline: '1px solid rgba(120,113,108,0.2)', outlineOffset: -1, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Tên quán */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={labelStyle}>Tên quán</div>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputBase}
                />
              </div>

              {/* Địa chỉ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={labelStyle}>Địa chỉ</div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C4.686 0 2 2.686 2 6c0 4.5 6 13 6 13s6-8.5 6-13c0-3.314-2.686-6-6-6z" fill="#A8A29E" /><circle cx="8" cy="6" r="2.2" fill="white" /></svg>
                  </span>
                  <input
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    style={{ ...inputBase, paddingLeft: 40 }}
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={labelStyle}>Mô tả quán</div>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={5}
                  style={{ ...inputBase, resize: 'vertical', paddingTop: 12, paddingBottom: 56 }}
                />
              </div>
            </div>
          </Section>

          {/* ── Bộ sưu tập ── */}
          <Section title="Bộ sưu tập" description={'Hình ảnh đẹp và rõ nét về không gian làm việc sẽ thu hút nhiều khách hàng hơn.'}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {/* Add button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 208, height: 208, borderRadius: 16, outline: '2px dashed rgba(120,113,108,0.5)', outlineOffset: -2, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(20,66,45,0.7)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(20,66,45,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {/* Khung ảnh */}
                  <rect x="2" y="4" width="17" height="14" rx="2" />
                  {/* Mặt trời */}
                  <circle cx="7.5" cy="9" r="1.5" />
                  {/* Núi */}
                  <polyline points="2,16 7,10 11,14 14,11 19,16" />
                  {/* Dấu + góc trên phải */}
                  <line x1="20" y1="2" x2="20" y2="8" />
                  <line x1="17" y1="5" x2="23" y2="5" />
                </svg>
                <span style={{ fontSize: 12, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, color: 'rgba(20,66,45,0.7)' }}>Thêm ảnh</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAddImage} style={{ display: 'none' }} />

              {/* Images */}
              {form.images.map((src, idx) => (
                <div key={idx} style={{ position: 'relative', width: 300, height: 208, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 4px -2px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.08)' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Tiện ích ── */}
          <Section title="Tiện ích & Không gian" description="Chọn các tiện ích nổi bật nhất mà quán của bạn đang cung cấp cho khách hàng.">
            <div style={{ background: '#FAFAF5', borderRadius: 16, outline: '1px solid rgba(120,113,108,0.2)', outlineOffset: -1, padding: 32, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {FACILITIES.map(({ key, label, icon }) => {
                  const active = form.facilities.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleFacility(key)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                        background: active ? '#14422D' : '#FAFAF5',
                        outline: active ? 'none' : '1px solid rgba(120,113,108,0.3)',
                        outlineOffset: -1,
                        color: active ? 'white' : '#1C1917',
                        fontSize: 14, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, lineHeight: '20px',
                        boxShadow: active ? '0 2px 4px -2px rgba(27,67,50,0.1), 0 4px 6px -1px rgba(27,67,50,0.1)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', color: active ? 'white' : '#1C1917' }}>{icon}</span>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </Section>

          {/* ── Giờ hoạt động ── */}
          <Section title="Giờ hoạt động" description={'Thiết lập thời gian đóng mở cửa chính xác cho từng giai đoạn trong tuần.'}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {form.operatingHours.map((row, idx) => {
                const open = formatTime(row.openTime)
                const close = formatTime(row.closeTime)
                return (
                  <div
                    key={row.label}
                    style={{ padding: 24, background: '#FAFAF5', borderRadius: 16, outline: '1px solid rgba(120,113,108,0.2)', outlineOffset: -1, display: 'flex', alignItems: 'center', gap: 16, opacity: row.isDayOff ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    {/* Day label */}
                    <div style={{ width: 160, flexShrink: 0, color: '#14422D', fontSize: 16, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, lineHeight: '24px' }}>
                      {row.label}
                    </div>

                    {/* Time inputs – ngang hàng */}
                    <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                      {/* Open */}
                      <div style={{ flex: 1, padding: '10px 14px', background: 'white', borderRadius: 8, outline: '1px solid rgba(120,113,108,0.3)', outlineOffset: -1, display: 'flex', alignItems: 'center' }}>
                        {row.isDayOff ? (
                          <div style={{ width: 20, height: 1.5, background: '#A8A29E', borderRadius: 2 }} />
                        ) : (
                          <input
                            type="time"
                            value={row.openTime}
                            disabled={row.isDayOff}
                            onChange={e => setTime(idx, 'openTime', e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', color: '#1C1917', fontSize: 14, fontFamily: 'Noto Sans, sans-serif', cursor: row.isDayOff ? 'not-allowed' : 'text', width: '100%' }}
                          />
                        )}
                      </div>
                      {/* Close */}
                      <div style={{ flex: 1, padding: '10px 14px', background: 'white', borderRadius: 8, outline: '1px solid rgba(120,113,108,0.3)', outlineOffset: -1, display: 'flex', alignItems: 'center' }}>
                        {row.isDayOff ? (
                          <div style={{ width: 20, height: 1.5, background: '#A8A29E', borderRadius: 2 }} />
                        ) : (
                          <input
                            type="time"
                            value={row.closeTime}
                            disabled={row.isDayOff}
                            onChange={e => setTime(idx, 'closeTime', e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', color: '#1C1917', fontSize: 14, fontFamily: 'Noto Sans, sans-serif', cursor: row.isDayOff ? 'not-allowed' : 'text', width: '100%' }}
                          />
                        )}
                      </div>
                    </div>


                    {/* Day off checkbox */}
                    <div style={{ paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => toggleDayOff(idx)}
                        style={{ width: 20, height: 20, borderRadius: 4, background: row.isDayOff ? '#14422D' : 'white', border: row.isDayOff ? 'none' : '1px solid #D6D3D1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, outline: row.isDayOff ? '1px solid rgba(0,0,0,0)' : 'none' }}
                      >
                        {row.isDayOff && (
                          <svg width="12" height="9" viewBox="0 0 14 10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,5 5,9 13,1" /></svg>
                        )}
                      </button>
                      <span style={{ color: '#525252', fontSize: 14, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, lineHeight: '20px' }}>Nghỉ</span>
                    </div>
                  </div>
                )
              })}

              {/* Đóng cửa ngày lễ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setForm(f => ({ ...f, isClosedOnHolidays: !f.isClosedOnHolidays }))}
                  style={{ width: 24, height: 24, borderRadius: 4, background: form.isClosedOnHolidays ? '#14422D' : 'white', border: form.isClosedOnHolidays ? 'none' : '1px solid #D6D3D1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {form.isClosedOnHolidays && (
                    <svg width="14" height="10" viewBox="0 0 16 11" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,5.5 6,10 15,1" /></svg>
                  )}
                </button>
                <span style={{ color: '#525252', fontSize: 14, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, lineHeight: '20px' }}>Đóng cửa vào ngày lễ</span>
              </div>
            </div>
          </Section>

        </div>

        {/* ── Footer actions ── */}
        <div style={{ marginTop: 64, paddingTop: 64, borderTop: '1px solid rgba(120,113,108,0.3)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20 }}>
          {saveError && <p style={{ margin: 0, fontSize: 14, color: '#DC2626', fontFamily: 'Noto Sans, sans-serif' }}>{saveError}</p>}
          <button
            onClick={() => router.back()}
            style={{ padding: '16px 40px', background: 'white', borderRadius: 9999, border: 'none', outline: '1px solid rgba(120,113,108,0.5)', outlineOffset: -1, cursor: 'pointer', color: '#525252', fontSize: 16, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, lineHeight: '24px' }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ position: 'relative', padding: '16px 56px', background: saving ? '#5A8A72' : '#14422D', borderRadius: 9999, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: 'white', fontSize: 16, fontFamily: 'Noto Sans, sans-serif', fontWeight: 700, lineHeight: '24px', boxShadow: '0 8px 10px -6px rgba(27,67,50,0.2), 0 20px 25px -5px rgba(27,67,50,0.2)', transition: 'background 0.2s' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

      </div>
    </div>
  )
}
