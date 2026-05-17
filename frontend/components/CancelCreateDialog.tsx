'use client';

import { useRouter } from 'next/navigation';

interface CancelConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function CancelConfirmDialog({ isOpen, onClose, title, description }: CancelConfirmDialogProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirmCancel = () => {
    router.push('/dashboard');
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      {/* Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 448,
          maxWidth: '100%',
          padding: 32,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Warning icon */}
          <div
            style={{
              width: 64,
              height: 64,
              background: '#FEF2F2',
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12.2 2.667a2 2 0 0 1 3.467 0l10.4 18a2 2 0 0 1-1.734 3H3.6a2 2 0 0 1-1.733-3l10.4-18Z"
                fill="#EF4444"
              />
              <path d="M14 9v5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="18" r="1.25" fill="white" />
            </svg>
          </div>

          {/* Title */}
          <div style={{ paddingTop: 8 }}>
            <h2
              style={{
                margin: 0,
                textAlign: 'center',
                color: '#1C1917',
                fontSize: 24,
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 900,
                lineHeight: '32px',
              }}
            >
              {title ?? 'Hủy đăng ký?'}
            </h2>
          </div>

          {/* Description */}
          <p
            style={{
              margin: 0,
              textAlign: 'center',
              color: '#78716C',
              fontSize: 16,
              fontFamily: 'Be Vietnam Pro, sans-serif',
              fontWeight: 400,
              lineHeight: '26px',
              maxWidth: 400,
            }}
          >
            {description ?? (
              <>
                Những thay đổi bạn đã nhập sẽ không được lưu.
                <br />
                Bạn có chắc chắn muốn thoát không?
              </>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignSelf: 'stretch',
          }}
        >
          {/* Tiếp tục chỉnh sửa */}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 12,
              paddingBottom: 12,
              borderRadius: 12,
              border: '1px solid #E7E5E4',
              background: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'Be Vietnam Pro, sans-serif',
              fontWeight: 700,
              color: '#44403C',
              lineHeight: '20px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            Tiếp tục chỉnh sửa
          </button>

          {/* Hủy bỏ */}
          <button
            onClick={handleConfirmCancel}
            style={{
              flex: 1,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 13,
              paddingBottom: 13,
              borderRadius: 12,
              border: 'none',
              background: '#DC2626',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'Be Vietnam Pro, sans-serif',
              fontWeight: 700,
              color: 'white',
              lineHeight: '20px',
              boxShadow: '0px 10px 15px -3px #FECACA, 0px 4px 6px -4px #FECACA',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#B91C1C')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#DC2626')}
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}