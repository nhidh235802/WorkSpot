// Định nghĩa khuôn mẫu dữ liệu gửi đi (TypeScript Interface)
export interface SearchCafeParams {
  lat: number | string;
  lng: number | string;
  radius: number;
  keyword?: string;
  filters?: string[];
}

// ── Review — map đúng CreateReviewDto ────────────────────────────────────────
export interface CreateReviewParams {
  rating: number;
  comment: string;
  images?: string[];
}

export interface ReviewResponse {
  id: string;
  cafeId: string;
  userId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  user?: {
    fullName: string;
    avatar: string | null;
  };
}

// 🛠️ ĐỒNG BỘ URL: Đảm bảo tất cả các hàm đều gọi chung một biến cấu hình, trỏ thẳng sang cổng NestJS (3001)
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 🛠️ TỰ ĐỊNH NGHĨA HÀM LẤY HEADER AUTH: Phòng trường hợp file chưa import hàm này
const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') return {};
  
  // Kiểm tra kỹ xem key của bạn trong localStorage là 'accessToken' hay 'access_token' nhé!
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const CafeService = {
  // Hàm tìm kiếm quán cafe
  searchCafes: async (params: SearchCafeParams, signal?: AbortSignal) => {
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      radius: params.radius.toString(),
    });

    if (params.keyword && params.keyword.trim() !== "") {
      queryParams.append("keyword", params.keyword.trim());
    }

    if (params.filters) {
      params.filters.forEach(filter => queryParams.append(filter, "true"));
    }

    const res = await fetch(`${BACKEND_API_URL}/cafes/search?${queryParams.toString()}`, {
      signal,
    });

    if (!res.ok) {
      throw new Error("サーバーエラーが発生しました"); 
    }

    return res.json();
  },

  // Hàm lấy danh sách quán gợi ý
  getTopRecommended: async (lat: number, lng: number) => {
    const res = await fetch(`${BACKEND_API_URL}/cafes/recommended?lat=${lat}&lng=${lng}`, { 
      headers: getAuthHeaders() 
    });
    if (!res.ok) {
      throw new Error("Lỗi kết nối máy chủ");
    }
    return res.json();
  },

  // Hàm lấy chi tiết quán theo ID
  getCafeById: async (id: string) => {
    const res = await fetch(`${BACKEND_API_URL}/cafes/${id}`);
    if (!res.ok) throw new Error("カフェの情報を取得できませんでした");
    return res.json();
  },

  // ── POST /cafes/:id/reviews ───────────────────────────────────────────────
  createReview: async (cafeId: string, params: CreateReviewParams): Promise<ReviewResponse> => {
      // 1. Viết cứng hoàn toàn URL để Next.js không thể nhận nhầm route nội bộ
      const hardcodedUrl = `http://localhost:3001/cafes/${cafeId}/reviews`;

      // 2. Lấy trực tiếp token thủ công để đảm bảo luôn chạy ở Client (Trình duyệt)
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      }

      console.log("--- BẮT ĐẦU GỬI REVIEW ---");
      console.log("URL gửi đi:", hardcodedUrl);
      console.log("Token hiện tại:", token ? "Đã lấy được token" : "KHÔNG CÓ TOKEN");
      console.log("Dữ liệu gửi đi:", {
        rating: params.rating,
        comment: params.comment,
        images: params.images
      });

      const res = await fetch(hardcodedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating: params.rating,
          comment: params.comment,
          images: params.images && params.images.length > 0 ? params.images : [],
        }),
      });

      if (res.status === 401) throw new Error('UNAUTHORIZED');
      if (res.status === 403) throw new Error('FORBIDDEN');

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // In lỗi từ Validation của NestJS ra màn hình Console để dễ nhìn
        console.error("Lỗi từ NestJS trả về:", err);
        throw new Error(err.message ?? '投稿に失敗しました');
      }

      console.log("--- GỬI REVIEW THÀNH CÔNG ---");
      return res.json();
    },

  // ── POST /cafes/:id/reviews/images  →  Upload ảnh trước khi gửi review ──
  uploadReviewImages: async (cafeId: string, files: File[]): Promise<string[]> => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))
      : null;

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const res = await fetch(`http://localhost:3001/cafes/${cafeId}/reviews/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error('画像のアップロードに失敗しました');

    const data = await res.json() as { urls: string[] };
    return data.urls;
  },

  // ── GET /cafes/:id/reviews ────────────────────────────────────────────────
  getReviews: async (cafeId: string): Promise<ReviewResponse[]> => {
    const res = await fetch(`${BACKEND_API_URL}/cafes/${cafeId}/reviews`);
    if (!res.ok) throw new Error('レビューの取得に失敗しました');
    return res.json();
  },

  // ── DELETE /cafes/:id/reviews/:reviewId ──────────────────────────────────
  deleteReview: async (cafeId: string, reviewId: string): Promise<void> => {
    const res = await fetch(`${BACKEND_API_URL}/cafes/${cafeId}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (res.status === 403) throw new Error('削除する権限がありません');
    if (!res.ok && res.status !== 204) throw new Error('削除に失敗しました');
  },
};