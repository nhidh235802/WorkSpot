'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  bio: string | null;
  role: 'customer' | 'owner' | 'admin';
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  customer: 'Khách hàng',
  owner: 'Chủ quán',
  admin: 'Quản trị viên',
};

const ROLE_COLOR: Record<string, string> = {
  customer: 'bg-[#ffdbc7] text-[#311300]',
  owner: 'bg-[#d4edda] text-[#155724]',
  admin: 'bg-[#cce5ff] text-[#004085]',
};

// ─── API helpers ──────────────────────────────────────────────────────────────
// Ưu tiên env variable; nếu không có thì dùng port 3000 (NestJS default).
// Đặt NEXT_PUBLIC_API_URL=http://localhost:3000 trong file .env.local nếu backend chạy port khác.
const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    // NestJS trả về { message: string | string[] }
    const msg = json.message;
    return Array.isArray(msg) ? msg.join(', ') : (msg ?? `Lỗi ${res.status}`);
  } catch {
    return `Lỗi ${res.status}: server không trả về JSON hợp lệ.`;
  }
}

async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API}/profile`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function patchProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API}/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API}/profile/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" className="text-stone-400">
      <path d="M11 0C6 0 1.73 3.11 0 7.5 1.73 11.89 6 15 11 15s9.27-3.11 11-7.5C20.27 3.11 16 0 11 0zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="currentColor"/>
    </svg>
  ) : (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" className="text-stone-400">
      <path d="M2.42 1L1 2.41l3.36 3.36A11.14 11.14 0 0 0 0 7.5C1.73 11.89 6 15 11 15a10.9 10.9 0 0 0 4.36-.9l3.22 3.22L20 15.83 2.42 1zM11 12.5a5 5 0 0 1-4.9-4.03l1.56 1.56A3 3 0 0 0 11 13.5v-1zm0-10a10.83 10.83 0 0 1 9.54 5.8 11.07 11.07 0 0 1-2.88 3.35l-1.42-1.42A5 5 0 0 0 11 2.5a4.93 4.93 0 0 0-2.16.49L7.3 1.45A10.9 10.9 0 0 1 11 1z" fill="currentColor"/>
    </svg>
  );
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg text-sm font-medium transition-all
        ${type === 'success' ? 'bg-[#14422d] text-white' : 'bg-red-600 text-white'}`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-base leading-none">×</button>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="px-1 text-[10px] font-semibold uppercase tracking-[1.2px] text-stone-500" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ReadOnlyField({ value }: { value: string }) {
  return (
    <div className="flex items-center px-4 py-4 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base leading-6" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {value || <span className="text-stone-400 italic">Chưa cập nhật</span>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Basic info edit
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '', address: '', bio: '' });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [savingPwd, setSavingPwd] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        setEditForm({
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          bio: data.bio ?? '',
        });
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Validate profile form ───────────────────────────────────────────────────
  function validateEdit() {
    const errors: Record<string, string> = {};
    if (!editForm.fullName.trim() || editForm.fullName.trim().length < 2)
      errors.fullName = 'Họ tên phải có ít nhất 2 ký tự.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email))
      errors.email = 'Email không hợp lệ.';
    if (editForm.phone && !/^(\+84|0)[0-9]{9}$/.test(editForm.phone))
      errors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567).';
    if (editForm.bio && editForm.bio.length > 1000)
      errors.bio = 'Bio không được vượt quá 1000 ký tự.';
    return errors;
  }

  // ── Submit profile ──────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    const errors = validateEdit();
    if (Object.keys(errors).length) { setEditErrors(errors); return; }
    setEditErrors({});
    setSavingProfile(true);
    try {
      const updated = await patchProfile({
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        address: editForm.address.trim() || undefined,
        bio: editForm.bio.trim() || undefined,
      });
      setProfile(updated);
      setIsEditing(false);
      setToast({ message: 'Cập nhật hồ sơ thành công!', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  }

  function handleCancelEdit() {
    if (!profile) return;
    setEditForm({ fullName: profile.fullName ?? '', email: profile.email ?? '', phone: profile.phone ?? '', address: profile.address ?? '', bio: profile.bio ?? '' });
    setEditErrors({});
    setIsEditing(false);
  }

  // ── Validate password ────────────────────────────────────────────────────────
  function validatePassword() {
    const errors: Record<string, string> = {};
    if (!currentPwd) errors.currentPwd = 'Vui lòng nhập mật khẩu hiện tại.';
    if (!newPwd) errors.newPwd = 'Vui lòng nhập mật khẩu mới.';
    else if (newPwd.length < 6) errors.newPwd = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    else if (newPwd === currentPwd) errors.newPwd = 'Mật khẩu mới không được trùng mật khẩu cũ.';
    return errors;
  }

  // ── Submit password ──────────────────────────────────────────────────────────
  async function handleChangePassword() {
    const errors = validatePassword();
    if (Object.keys(errors).length) { setPwdErrors(errors); return; }
    setPwdErrors({});
    setSavingPwd(true);
    try {
      await changePassword(currentPwd, newPwd);
      setCurrentPwd('');
      setNewPwd('');
      setToast({ message: 'Đổi mật khẩu thành công!', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    } finally {
      setSavingPwd(false);
    }
  }

  const memberSince = profile
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : '';

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#14422d] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#414943] text-sm" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#fafaf5] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow text-center max-w-sm">
          <p className="text-red-600 font-semibold mb-2">Không thể tải hồ sơ</p>
          <p className="text-stone-500 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-start bg-[#fafaf5] px-[65px] py-0">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex w-full flex-col items-start bg-[#fafaf5cc] shadow-[0px_8px_30px_#0000000a] backdrop-blur-md">
        <div className="relative flex h-20 w-full items-center justify-between pl-8 pr-8">
          <a href="/" className="text-[#14422d] text-2xl font-normal tracking-[-1.2px] leading-8" style={{ fontFamily: "'Acme', sans-serif" }}>
            WorkSpot
          </a>
          <div className="flex items-center gap-3">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#14422d] flex items-center justify-center text-white text-sm font-bold">
                {profile?.fullName?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex w-full max-w-6xl flex-col items-start gap-16 px-6 pb-20 pt-12">
        {/* Header */}
        <section className="flex flex-col items-start gap-2 w-full">
          <h1 className="text-[#14422d] text-5xl font-bold tracking-[-1.2px] leading-[48px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Hồ sơ cá nhân
          </h1>
          <p className="text-[#414943] text-base leading-6 max-w-lg" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            Quản lý thông tin tài khoản để sử dụng WorkSpot tiện lợi hơn.
          </p>
        </section>

        {/* Content Grid */}
        <section className="grid grid-cols-12 gap-10 w-full">
          {/* Sidebar card */}
          <aside className="col-span-4">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 sticky top-28">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[#e3e3de] flex items-center justify-center">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-[#14422d]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {profile?.fullName?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex flex-col items-center gap-1 text-center">
                <h2 className="text-[#14422d] text-2xl font-bold tracking-[-0.5px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {profile?.fullName}
                </h2>
                <p className="text-stone-500 text-sm" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Thành viên từ {memberSince}
                </p>
              </div>

              {/* Role badge */}
              {profile && (
                <span className={`px-4 py-1.5 rounded-full text-xs tracking-[0.3px] ${ROLE_COLOR[profile.role]}`} style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {ROLE_LABEL[profile.role]}
                </span>
              )}

              {/* Email */}
              <div className="w-full border-t border-[#e8e8e3] pt-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[1.2px] font-semibold text-stone-400" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Email</span>
                <span className="text-[#1a1c19] text-sm break-all" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="w-full flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[1.2px] font-semibold text-stone-400" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Điện thoại</span>
                  <span className="text-[#1a1c19] text-sm" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>{profile.phone}</span>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="col-span-8 flex flex-col gap-8">
            {/* Basic info section */}
            <section className="bg-white rounded-xl p-10 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[#14422d] text-2xl font-bold tracking-[-0.6px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Thông tin cơ bản
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#14422d] text-white text-sm font-medium rounded-lg hover:bg-[#1a5438] transition-colors"
                    style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Họ tên */}
                <FieldGroup label="Họ và tên">
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                        className={`px-4 py-4 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] transition-all ${editErrors.fullName ? 'ring-2 ring-red-400' : ''}`}
                        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                      />
                      {editErrors.fullName && <p className="text-red-500 text-xs px-1">{editErrors.fullName}</p>}
                    </div>
                  ) : (
                    <ReadOnlyField value={profile?.fullName ?? ''} />
                  )}
                </FieldGroup>

                {/* Email */}
                <FieldGroup label="Email">
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                        className={`px-4 py-4 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] transition-all ${editErrors.email ? 'ring-2 ring-red-400' : ''}`}
                        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                      />
                      {editErrors.email && <p className="text-red-500 text-xs px-1">{editErrors.email}</p>}
                    </div>
                  ) : (
                    <ReadOnlyField value={profile?.email ?? ''} />
                  )}
                </FieldGroup>

                {/* Điện thoại */}
                <FieldGroup label="Số điện thoại">
                  {isEditing ? (
                    <div className="flex flex-col gap-1">
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="0901234567"
                        className={`px-4 py-4 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] transition-all placeholder:text-stone-400 ${editErrors.phone ? 'ring-2 ring-red-400' : ''}`}
                        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                      />
                      {editErrors.phone && <p className="text-red-500 text-xs px-1">{editErrors.phone}</p>}
                    </div>
                  ) : (
                    <ReadOnlyField value={profile?.phone ?? ''} />
                  )}
                </FieldGroup>

                {/* Địa chỉ */}
                <FieldGroup label="Địa chỉ">
                  {isEditing ? (
                    <input
                      value={editForm.address}
                      onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="VD: Hoàn Kiếm, Hà Nội"
                      className="px-4 py-4 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] transition-all placeholder:text-stone-400"
                      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                    />
                  ) : (
                    <ReadOnlyField value={profile?.address ?? ''} />
                  )}
                </FieldGroup>
              </div>

              {/* Bio */}
              <FieldGroup label="Giới thiệu bản thân">
                {isEditing ? (
                  <div className="flex flex-col gap-1">
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      rows={4}
                      maxLength={1000}
                      placeholder="Chia sẻ đôi điều về bản thân..."
                      className={`px-4 py-4 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] resize-none transition-all placeholder:text-stone-400 ${editErrors.bio ? 'ring-2 ring-red-400' : ''}`}
                      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                    />
                    <div className="flex justify-between items-center px-1">
                      {editErrors.bio ? <p className="text-red-500 text-xs">{editErrors.bio}</p> : <span />}
                      <span className="text-stone-400 text-xs">{editForm.bio.length}/1000</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 pt-4 pb-10 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base leading-6 min-h-[100px]" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    {profile?.bio || <span className="text-stone-400 italic">Chưa có giới thiệu.</span>}
                  </div>
                )}
              </FieldGroup>

              {/* Edit action buttons */}
              {isEditing && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#14422d] text-white text-sm font-medium rounded-lg hover:bg-[#1a5438] disabled:opacity-60 transition-colors"
                    style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  >
                    {savingProfile ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Đang lưu...</>
                    ) : 'Lưu thay đổi'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={savingProfile}
                    className="px-4 py-2.5 bg-white text-[#14422d] text-sm font-medium rounded-lg border border-[#14422d40] hover:bg-[#f5f5f0] transition-colors"
                    style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  >
                    Huỷ
                  </button>
                </div>
              )}
            </section>

            {/* Security section */}
            <section className="bg-white rounded-xl p-10 flex flex-col gap-8">
              <h3 className="text-[#14422d] text-2xl font-bold tracking-[-0.6px]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Bảo mật
              </h3>

              <div className="grid grid-cols-2 gap-8">
                {/* Current password */}
                <FieldGroup label="Mật khẩu hiện tại">
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={`w-full px-4 py-[18px] pr-12 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] placeholder:text-gray-400 transition-all ${pwdErrors.currentPwd ? 'ring-2 ring-red-400' : ''}`}
                        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(p => !p)}
                        aria-label={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        <EyeIcon open={showCurrent} />
                      </button>
                    </div>
                    {pwdErrors.currentPwd && <p className="text-red-500 text-xs px-1">{pwdErrors.currentPwd}</p>}
                  </div>
                </FieldGroup>

                {/* New password */}
                <FieldGroup label="Mật khẩu mới">
                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full px-4 py-[18px] pr-12 bg-[#e3e3de] rounded-lg text-[#1a1c19] text-base outline-none focus:ring-2 focus:ring-[#14422d] placeholder:text-gray-400 transition-all ${pwdErrors.newPwd ? 'ring-2 ring-red-400' : ''}`}
                        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(p => !p)}
                        aria-label={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        <EyeIcon open={showNew} />
                      </button>
                    </div>
                    {pwdErrors.newPwd && <p className="text-red-500 text-xs px-1">{pwdErrors.newPwd}</p>}
                  </div>
                </FieldGroup>
              </div>

              <div className="flex items-center border-t border-[#e8e8e3] pt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={savingPwd}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#e8e8e3] text-[#1a1c19] text-sm font-semibold rounded-full hover:bg-[#ddddd8] disabled:opacity-60 transition-colors"
                  style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                >
                  {savingPwd ? (
                    <><span className="w-4 h-4 border-2 border-[#1a1c19] border-t-transparent rounded-full animate-spin" />Đang đổi...</>
                  ) : 'Đổi mật khẩu'}
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}