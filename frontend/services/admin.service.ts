const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AdminStatsResponse {
  totalAccounts: number;
  totalCafes: number;
  pendingCafes: number;
  activeCafes: number;
  rejectedCafes: number;
  cafeTrend: Array<{ month: number; count: string }>;
  accountTrend: Array<{ month: number; count: string }>;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminUserList {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminCafeItem {
  id: string;
  name: string;
  address: string;
  status: string;
  owner: { id: string; fullName: string; email: string } | null;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface AdminCafeList {
  items: AdminCafeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const requestJson = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || 'Lỗi khi gọi API');
  }
  return response.json();
};

export const AdminService = {
  getStats: async (): Promise<AdminStatsResponse> => {
    return requestJson(`${BACKEND_API_URL}/admin/stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
  },

  getPendingCafes: async (): Promise<AdminCafeList> => {
    return requestJson(`${BACKEND_API_URL}/cafes/admin/pending`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
  },

  approveCafe: async (id: string) => {
    return requestJson(`${BACKEND_API_URL}/cafes/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
  },

  rejectCafe: async (id: string, rejectionReason: string) => {
    return requestJson(`${BACKEND_API_URL}/cafes/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ rejectionReason }),
    });
  },

  getUsers: async (params?: { name?: string; email?: string; role?: string; page?: number; limit?: number }): Promise<AdminUserList> => {
    const searchParams = new URLSearchParams();
    if (params?.name) searchParams.append('name', params.name);
    if (params?.email) searchParams.append('email', params.email);
    if (params?.role) searchParams.append('role', params.role);
    searchParams.append('page', String(params?.page ?? 1));
    searchParams.append('limit', String(params?.limit ?? 10));

    return requestJson(`${BACKEND_API_URL}/admin/users?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
  },

  getCafesForAdmin: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<AdminCafeList> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    searchParams.append('page', String(params?.page ?? 1));
    searchParams.append('limit', String(params?.limit ?? 20));
    return requestJson(`${BACKEND_API_URL}/cafes/admin?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      cache: 'no-store',
    });
  },

  toggleCafeVisibility: async (id: string) => {
    return requestJson(`${BACKEND_API_URL}/cafes/${id}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
  },
};
