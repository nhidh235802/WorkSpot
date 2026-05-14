"use client";

import { useId, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Amenity = {
  id: string;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
};

type ScheduleItem = {
  id: string;
  label: string;
  open: string;
  close: string;
  closed: boolean;
  disabled?: boolean;
};

// ─── Inline SVG Icons (replace external .svg imports) ────────────────────────

const IconBack = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M8 2L4 6L8 10" stroke="#1b4332" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconLocation = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
    <path d="M8 0C4.13 0 1 3.13 1 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 8 4.5a2.5 2.5 0 0 1 0 5z" fill="#6b7280" />
  </svg>
);

const IconUpload = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 15V7M7 11l4-4 4 4" stroke="#1b4332b2" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="1" y="1" width="20" height="20" rx="5" stroke="#1b4332b2" strokeWidth="1.5" strokeDasharray="3 2" />
  </svg>
);

const IconClose = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconCheck = ({ dark = false }: { dark?: boolean }) => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
    <path d="M1 5L4.5 8.5L11 1.5" stroke={dark ? "#fff" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevron = ({ disabled = false }: { disabled?: boolean }) => (
  <svg
    className={disabled ? "opacity-30" : "opacity-70"}
    width="14" height="14" viewBox="0 0 20 20" fill="none"
    aria-hidden="true"
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Amenity icon components — matched to design screenshots
// Wi-Fi: fan arcs + dot
const WifiIcon = () => (
  <svg width="18" height="15" viewBox="0 0 18 15" fill="none">
    <circle cx="9" cy="13" r="1.5" fill="currentColor" />
    <path d="M5.5 9.8a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M2.5 6.8a9 9 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M0 3.8a13 13 0 0 1 18 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
// Power plug: plug head with two prongs
const PowerIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
    <rect x="3" y="6" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 14v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M5 6V3M11 6V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
// Desk: table top + two legs (matches ảnh "Bàn làm việc")
const DeskIcon = () => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
    <rect x="1" y="4" width="18" height="3" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 7v8M16 7v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
// Snacks: bowl with steam lines (matches ảnh "Đồ ăn nhẹ")
const SnacksIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M1 9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M2 9c0 4 2.69 7 7 7s7-3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 6c0-1.5 1-2 1-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M9 5c0-1.5 1-2 1-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 6c0-1.5 1-2 1-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
// Clean: broom/mop (matches ảnh "Độ sạch sẽ" — upright brush shape)
const CleanIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
    <path d="M8 1v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M2 12c0 3 1.5 5 6 5s6-2 6-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 6L4 3M10 6l2-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
// Workspace: monitor screen (matches ảnh "Không gian làm việc")
const WorkspaceIcon = () => (
  <svg width="20" height="17" viewBox="0 0 20 17" fill="none">
    <rect x="1" y="1" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6 16h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 13v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
// No-smoking: cigarette with diagonal cross/slash (matches ảnh "Quy định hút thuốc")
const SmokingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4 9h5M12 9h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M3 15L15 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// Nav icons
const DashboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="0.75" y="0.75" width="5.75" height="5.75" rx="1.25" fill="currentColor" />
    <rect x="8.5" y="0.75" width="5.75" height="5.75" rx="1.25" fill="currentColor" />
    <rect x="0.75" y="8.5" width="5.75" height="5.75" rx="1.25" fill="currentColor" />
    <rect x="8.5" y="8.5" width="5.75" height="5.75" rx="1.25" fill="currentColor" />
  </svg>
);
const AddCafeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    {/* 3 horizontal bars */}
    <rect x="0" y="1" width="10" height="2.2" rx="1.1" />
    <rect x="0" y="5" width="10" height="2.2" rx="1.1" />
    <rect x="0" y="9" width="7" height="2.2" rx="1.1" />
    {/* Pencil — rotated -45deg around its center at (12,11) */}
    <g transform="translate(12,11) rotate(-45)">
      <rect x="-2" y="-5.5" width="4" height="8" rx="0.8" />
      <polygon points="-2,2.5 2,2.5 0,6" />
      <rect x="-2" y="-7.5" width="4" height="2.5" rx="0.5" fill="currentColor" opacity="0.55" />
    </g>
  </svg>
);
const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1.5 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const navigationItems = [
  { label: "Tổng quan", icon: <DashboardIcon />, active: true },
  { label: "Đăng ký quán mới", icon: <AddCafeIcon />, active: false },
  { label: "Hồ sơ cá nhân", icon: <ProfileIcon />, active: false },
];

const initialAmenities: Amenity[] = [
  { id: "wifi", label: "Wi-Fi", icon: <WifiIcon />, selected: true },
  { id: "power", label: "Ổ cắm điện", icon: <PowerIcon />, selected: true },
  { id: "desk", label: "Bàn làm việc", icon: <DeskIcon />, selected: false },
  { id: "snacks", label: "Đồ ăn nhẹ", icon: <SnacksIcon />, selected: false },
  { id: "clean", label: "Độ sạch sẽ", icon: <CleanIcon />, selected: false },
  { id: "workspace", label: "Không gian làm việc", icon: <WorkspaceIcon />, selected: false },
  { id: "smoking", label: "Quy định hút thuốc", icon: <SmokingIcon />, selected: false },
];

const initialSchedule: ScheduleItem[] = [
  { id: "weekdays", label: "Thứ Hai - Thứ Sáu", open: "08:00 AM", close: "10:00 PM", closed: false },
  { id: "saturday", label: "Thứ Bảy", open: "08:00 AM", close: "11:00 PM", closed: false },
  { id: "sunday", label: "Chủ Nhật", open: "", close: "", closed: true, disabled: true },
];

const timeOptions = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function formatTime(value: string) {
  if (!value) return "—";
  return value.replace(":", " : ");
}

function TimeSelect({
  value, onChange, disabled = false, ariaLabel, showDash = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  showDash?: boolean;
}) {
  if (showDash) {
    return (
      <div className="relative w-[122px] flex items-center justify-center px-4 py-3 rounded-lg border border-[#c0c9c133] bg-[#fafaf5]">
        <span className="font-['Noto_Sans'] font-normal text-sm text-[#1a1c194d]">—</span>
      </div>
    );
  }
  return (
    <div
      className={`relative w-[122px] flex items-center px-4 py-3 rounded-lg overflow-hidden border border-solid ${disabled ? "bg-[#fafaf5] border-[#c0c9c133]" : "bg-white border-[#c0c9c14c]"
        }`}
    >
      <span
        className={`pointer-events-none absolute left-4 font-['Noto_Sans'] font-normal text-sm leading-5 ${disabled ? "text-[#1a1c194d]" : "text-[#1a1c19]"
          }`}
      >
        {value ? formatTime(value) : "—"}
      </span>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="relative z-10 w-full appearance-none bg-transparent text-transparent pr-6 font-['Noto_Sans'] font-normal text-sm leading-5 outline-none"
      >
        {!value && <option value="">—</option>}
        {timeOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <IconChevron disabled={disabled} />
      </div>
    </div>
  );
}

function Checkbox({
  checked, onChange, label, disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`relative flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-transparent bg-[#1b4332]" : `border-[#c0c9c1] bg-white ${disabled ? "opacity-60" : ""}`
          }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        {checked && <IconCheck />}
      </span>
      {label && (
        <span className="font-['Noto_Sans'] font-bold text-[#414943] text-sm tracking-[0] leading-5 whitespace-nowrap">
          {label}
        </span>
      )}
    </label>
  );
}

// ─── Navigation Sidebar ───────────────────────────────────────────────────────

function OwnerNavigationSection() {
  return (
    <aside
      className="flex w-72 min-h-screen sticky top-0 flex-col items-start gap-2 p-6 bg-[#fafaf5] border-r border-[#e7ede8]"
      aria-label="Điều hướng chủ quán"
    >
      <div className="flex flex-col items-start pb-10 relative self-stretch w-full">
        <h1 className="font-['Manrope'] font-bold text-[#1a1c19] text-xl tracking-[-0.50px] leading-7">
          WorkSpot Owner
        </h1>
        <p className="font-['Be_Vietnam_Pro'] font-normal text-stone-400 text-[10px] tracking-[0.50px] leading-[15px]">
          Cổng thông tin Hà Nội
        </p>
      </div>

      <nav className="flex flex-col items-start gap-2 flex-1 self-stretch w-full" aria-label="Menu chính">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-current={item.active ? "page" : undefined}
            className={`flex gap-3 px-4 py-3 self-stretch w-full rounded-xl items-center text-left transition-colors ${item.active
              ? "bg-[#14422d] shadow-[0px_1px_2px_#0000000d]"
              : "hover:bg-[#f0f4f1]"
              }`}
          >
            <span className={item.active ? "text-white" : "text-stone-500"}>
              {item.icon}
            </span>
            <span
              className={`text-sm leading-5 ${item.active
                ? "font-['Be_Vietnam_Pro'] font-bold text-white"
                : "font-['Be_Vietnam_Pro'] font-medium text-stone-600"
                }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-start pt-6 self-stretch w-full border-t border-stone-200">
        <div className="flex items-center gap-3 p-2 self-stretch w-full">
          <div
            className="w-10 h-10 rounded-full bg-[#c7d9ce] flex items-center justify-center text-[#1b4332] font-bold text-sm"
            role="img"
            aria-label="Ảnh hồ sơ Minh Anh"
          >
            MA
          </div>
          <div className="flex flex-col items-start">
            <span className="font-['Roboto'] font-medium text-[#1a1c19] text-sm leading-5 whitespace-nowrap">
              Minh Anh
            </span>
            <span className="font-['Be_Vietnam_Pro'] font-normal text-stone-500 text-[10px] tracking-[0.25px] leading-[15px] whitespace-nowrap">
              Chủ quán
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Cafe Profile Details Section ─────────────────────────────────────────────

function CafeProfileDetailsSection() {
  const [cafeName, setCafeName] = useState("Cafe Studio");
  const [address, setAddress] = useState("45 Lý Quốc Sư, Hoàn Kiếm, Hà Nội");
  const [description, setDescription] = useState(
    "Một không gian yên tĩnh ngay trung tâm Hà Nội, được thiết kế tối giản dành riêng cho những ai cần sự tập trung để làm việc và sáng tạo.",
  );
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [closedOnHolidays, setClosedOnHolidays] = useState(true);
  const [hasGalleryImage, setHasGalleryImage] = useState(true);

  const toggleAmenity = (id: string) => {
    setAmenities((current) =>
      current.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    );
  };

  const updateSchedule = (
    id: string,
    field: "open" | "close" | "closed",
    value: string | boolean,
  ) => {
    setSchedule((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (field === "closed") return { ...item, closed: Boolean(value) };
        return { ...item, [field]: value as string };
      }),
    );
  };

  return (
    <section className="flex flex-1 flex-col items-start gap-14 pt-16 pb-28 px-10 max-w-[960px]">
      {/* Header */}
      <header className="flex flex-col items-start gap-5 self-stretch w-full">
        <button
          type="button"
          className="inline-flex gap-2 items-center"
          aria-label="Quay lại dashboard"
        >
          <IconBack />
          <span className="font-['Noto_Sans'] font-bold text-[#1b4332] text-sm tracking-[0.70px] leading-5 whitespace-nowrap">
            QUAY LẠI DASHBOARD
          </span>
        </button>
        <div className="flex flex-col items-start pt-3 self-stretch w-full">
          <h1 className="font-['Manrope'] font-extrabold text-[#1b4332] text-5xl tracking-[-1.20px] leading-[48px]">
            Chỉnh sửa thông tin của quán
          </h1>
        </div>
        <p className="font-['Be_Vietnam_Pro'] font-normal text-[#414943] text-xl leading-[32.5px]">
          Cập nhật thông tin chi tiết của quán để khách hàng có thông tin chính xác nhất.
        </p>
      </header>

      <form
        className="flex flex-col items-start gap-20 self-stretch w-full"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* ── Thông tin cơ bản ── */}
        <div className="grid grid-cols-12 gap-10 w-full">
          <div className="col-span-4 flex flex-col items-start gap-3">
            <h2 className="font-['Manrope'] font-bold text-[#1b4332] text-2xl leading-8">
              Thông tin cơ bản
            </h2>
            <p className="font-['Noto_Sans'] font-normal text-[#414943] text-sm leading-[22.8px]">
              Tên quán và địa chỉ chính xác giúp khách
              <br />
              hàng dễ dàng tìm thấy bạn trên bản đồ.
            </p>
          </div>

          <div className="col-span-8 flex flex-col items-start gap-6 p-8 bg-[#fdfdfb] rounded-2xl border border-[#c0c9c133]">
            {/* Tên quán */}
            <div className="flex flex-col items-start gap-2 self-stretch w-full">
              <label
                htmlFor="cafe-name"
                className="font-['Noto_Sans'] font-bold text-[#904c18] text-xs tracking-[1.20px] leading-4 whitespace-nowrap"
              >
                TÊN QUÁN
              </label>
              <div className="flex items-start justify-center px-4 py-3 self-stretch w-full bg-white rounded-lg border border-[#c0c9c14c]">
                <input
                  id="cafe-name"
                  type="text"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  className="flex-1 bg-transparent font-['Noto_Sans'] font-normal text-[#1a1c19] text-base leading-6 outline-none"
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="flex flex-col items-start gap-2 self-stretch w-full">
              <label
                htmlFor="cafe-address"
                className="font-['Noto_Sans'] font-bold text-[#904c18] text-xs tracking-[1.20px] leading-4 whitespace-nowrap"
              >
                ĐỊA CHỈ
              </label>
              <div className="relative flex items-center self-stretch w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IconLocation />
                </span>
                <div className="flex items-start justify-center pl-10 pr-4 py-3 self-stretch w-full bg-white rounded-lg border border-[#c0c9c14c]">
                  <input
                    id="cafe-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 bg-transparent font-['Noto_Sans'] font-normal text-[#1a1c19] text-base leading-6 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="flex flex-col items-start gap-2 self-stretch w-full">
              <label
                htmlFor="cafe-description"
                className="font-['Noto_Sans'] font-bold text-[#904c18] text-xs tracking-[1.20px] leading-4 whitespace-nowrap"
              >
                MÔ TẢ QUÁN
              </label>
              <div className="flex items-start justify-center pt-3 pb-16 px-4 self-stretch w-full bg-white rounded-lg border border-[#c0c9c14c]">
                <textarea
                  id="cafe-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="flex-1 resize-none bg-transparent font-['Noto_Sans'] font-normal text-[#1a1c19] text-base leading-6 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bộ sưu tập ── */}
        <div className="grid grid-cols-12 gap-10 w-full">
          <div className="col-span-4 flex flex-col items-start gap-3">
            <h2 className="font-['Manrope'] font-bold text-[#1b4332] text-2xl leading-8">
              Bộ sưu tập
            </h2>
            <p className="font-['Noto_Sans'] font-normal text-[#414943] text-sm leading-[22.8px]">
              Hình ảnh đẹp và rõ nét về không gian làm
              <br />
              việc sẽ thu hút nhiều khách hàng hơn.
            </p>
          </div>

          <div className="col-span-8 grid grid-cols-2 gap-4 h-52">
            {/* Upload slot */}
            <button
              type="button"
              className="w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c0c9c180] hover:border-[#1b4332] hover:bg-[#f5f9f7] transition-colors"
              aria-label="Thêm ảnh"
            >
              <span className="mb-2">
                <IconUpload />
              </span>
              <span className="font-['Noto_Sans'] font-bold text-[#1b4332b2] text-xs leading-4 whitespace-nowrap">
                Thêm ảnh
              </span>
            </button>

            {/* Gallery image */}
            {hasGalleryImage ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0px_2px_4px_-2px_#0000001a,0px_4px_6px_-1px_#0000001a] bg-[#d4e6d9]">
                <div className="absolute inset-0 flex items-center justify-center text-[#1b4332] opacity-30">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                    <circle cx="17" cy="17" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M4 32l10-10 8 8 6-6 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00000010]" />
                <button
                  type="button"
                  onClick={() => setHasGalleryImage(false)}
                  className="absolute top-3 right-3 flex items-center justify-center p-1.5 bg-[#00000080] rounded-full backdrop-blur-sm"
                  aria-label="Xóa ảnh"
                >
                  <IconClose />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setHasGalleryImage(true)}
                className="w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c0c9c180] hover:border-[#1b4332] hover:bg-[#f5f9f7] transition-colors"
                aria-label="Thêm ảnh"
              >
                <span className="mb-2"><IconUpload /></span>
                <span className="font-['Noto_Sans'] font-bold text-[#1b4332b2] text-xs leading-4">Thêm ảnh</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Tiện ích & Không gian ── */}
        <div className="grid grid-cols-12 gap-10 w-full">
          <div className="col-span-4 flex flex-col items-start gap-3">
            <h2 className="font-['Manrope'] font-bold text-[#1b4332] text-2xl leading-8">
              Tiện ích &amp; Không gian
            </h2>
            <p className="font-['Noto_Sans'] font-normal text-[#414943] text-sm leading-[22.8px]">
              Chọn các tiện ích nổi bật nhất mà quán của bạn đang cung cấp cho khách hàng.
            </p>
          </div>

          <div className="col-span-8 p-8 bg-[#fdfdfb] rounded-2xl border border-[#c0c9c133]">
            <div className="flex flex-wrap gap-x-[18px] gap-y-4">
              {amenities.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  aria-pressed={amenity.selected}
                  className={`relative inline-flex items-center gap-2 px-5 py-[11px] rounded-full transition-colors ${amenity.selected
                    ? "bg-[#1b4332] shadow-[0px_2px_4px_-2px_#1b43321a,0px_4px_6px_-1px_#1b43321a]"
                    : "bg-[#fafaf5] border border-[#c0c9c14c] hover:border-[#1b4332]"
                    }`}
                >
                  <span className={amenity.selected ? "text-white" : "text-[#1a1c19]"}>
                    {amenity.icon}
                  </span>
                  <span
                    className={`font-['Noto_Sans'] font-bold text-sm leading-5 whitespace-nowrap ${amenity.selected ? "text-white" : "text-[#1a1c19]"
                      }`}
                  >
                    {amenity.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Giờ hoạt động ── */}
        <div className="grid grid-cols-12 gap-10 w-full">
          <div className="col-span-4 flex flex-col items-start gap-3">
            <h2 className="font-['Manrope'] font-bold text-[#1b4332] text-2xl leading-8">
              Giờ hoạt động
            </h2>
            <p className="font-['Noto_Sans'] font-normal text-[#414943] text-sm leading-[22.8px]">
              Thiết lập thời gian đóng mở cửa chính xác
              <br />
              cho từng giai đoạn trong tuần.
            </p>
          </div>

          <div className="col-span-8 flex flex-col items-end gap-4">
            {schedule.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-6 self-stretch w-full bg-[#fdfdfb] rounded-2xl border border-[#c0c9c133]`}
              >
                <div className="flex flex-col w-40 items-start">
                  <p className="font-['Noto_Sans'] font-bold text-[#1b4332] text-base leading-6">
                    {item.label}
                  </p>
                </div>

                <>
                  <div className="flex gap-4">
                    <TimeSelect
                      value={item.open}
                      onChange={(value) => updateSchedule(item.id, "open", value)}
                      disabled={item.closed}
                      showDash={!!item.disabled}
                      ariaLabel={`${item.label} giờ mở cửa`}
                    />
                    <TimeSelect
                      value={item.close}
                      onChange={(value) => updateSchedule(item.id, "close", value)}
                      disabled={item.closed}
                      showDash={!!item.disabled}
                      ariaLabel={`${item.label} giờ đóng cửa`}
                    />
                  </div>
                  <div className="pl-2">
                    <Checkbox
                      checked={item.closed}
                      onChange={item.disabled ? () => { } : (checked) => updateSchedule(item.id, "closed", checked)}
                      label="Nghỉ"
                      disabled={!!item.disabled}
                    />
                  </div>
                </>
              </div>
            ))}

            <div className="flex items-center gap-2 self-stretch">
              <Checkbox
                checked={closedOnHolidays}
                onChange={setClosedOnHolidays}
                label="Đóng cửa vào ngày lễ"
              />
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-start justify-end gap-5 pt-16 self-stretch w-full border-t border-[#c0c9c14c]">
          <button
            type="button"
            className="inline-flex items-center justify-center px-10 py-4 bg-white rounded-full border border-[#c0c9c180] hover:bg-[#f5f5f0] transition-colors"
          >
            <span className="font-['Noto_Sans'] font-bold text-[#414943] text-base leading-6 whitespace-nowrap">
              Hủy
            </span>
          </button>
          <button
            type="submit"
            className="relative inline-flex items-center justify-center px-14 py-[17px] bg-[#1b4332] rounded-full hover:bg-[#163829] transition-colors shadow-[0px_8px_10px_-6px_#1b433233,0px_20px_25px_-5px_#1b433233]"
          >
            <span className="font-['Noto_Sans'] font-bold text-white text-base leading-6 whitespace-nowrap">
              Lưu thay đổi
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerCafeProfilePage() {
  return (
    <main
      className="bg-[#fafaf5] w-full min-w-[1280px] min-h-screen flex"
      data-screen="OwnerCafeProfile"
    >
      <OwnerNavigationSection />
      <CafeProfileDetailsSection />
    </main>
  );
}
