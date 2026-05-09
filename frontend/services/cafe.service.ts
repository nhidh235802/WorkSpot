const API_URL = "http://localhost:3001";

// Định nghĩa khuôn mẫu dữ liệu gửi đi (TypeScript Interface)
export interface SearchCafeParams {
  lat: number | string;
  lng: number | string;
  radius: number;
  keyword?: string;
  filters?: string[];
}

export const CafeService = {
  // Hàm này nhận các tham số đầu vào và tín hiệu hủy (AbortSignal) để phòng khi timeout
  searchCafes: async (params: SearchCafeParams, signal?: AbortSignal) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    // Đóng gói tham số lên URL
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

    // Gửi yêu cầu sang NestJS
    const res = await fetch(`${API_URL}/cafes/search?${queryParams.toString()}`, {
      signal,
    });

    if (!res.ok) {
      throw new Error("サーバーエラーが発生しました"); // Lỗi máy chủ
    }

    return res.json();
  },
  getTopRecommended: async (lat: number, lng: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/cafes/recommended?lat=${lat}&lng=${lng}`, { headers });
    if (!res.ok) {
      throw new Error("Lỗi kết nối máy chủ");
    }
    return res.json();
  }
};