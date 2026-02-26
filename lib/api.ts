const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let getAuthToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken ? await getAuthToken() : null;

  const res = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-auth-token": token } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    throw new Error("Forbidden");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Dashboard
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingKyc: number;
  totalActivities: number;
  recentUsers: User[];
  recentActivities: Activity[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string | null;
  clerkUserId: string;
  referCode: string | null;
  referredByCode: string | null;
  referValue: number;
  accountStatus: "INITIAL" | "ACTIVE" | "PENDING" | "REJECTED";
  role: "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER";
  zynkEntityId: string | null;
  zynkExternalAccountId: string | null;
  zynkDepositAccountId: string | null;
  created_at: string;
  updated_at: string;
  addresses?: Address[];
  activities?: Activity[];
  _count?: { addresses: number };
}

export interface Address {
  id: string;
  type: "PRESENT" | "PERMANENT";
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  status: "PENDING" | "FAILED" | "COMPLETE";
  description: string | null;
  amount: string | null;
  metadata: Record<string, unknown> | null;
  referenceId: string | null;
  ipAddress: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ChartDataPoint {
  month: string;
  count: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ReferralStats {
  totalReferrals: number;
  topReferrers: {
    id: string;
    firstName: string;
    lastName: string;
    referCode: string;
    referralCount: number;
  }[];
  total: number;
  page: number;
  limit: number;
}

export interface MarketingStats {
  totalInfluencers: number;
  totalPromoters: number;
  totalPromoterReferrals: number;
}

export interface PaginatedResponse<T> {
  users?: T[];
  activities?: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PromoterPaginatedResponse {
  promoters: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality?: string;
  role?: "ADMIN" | "USER";
  accountStatus?: "INITIAL" | "ACTIVE" | "PENDING" | "REJECTED";
}

export interface CreatePromoterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality?: string;
  role: "INFLUENCER" | "PROMOTER";
  referValue: number;
  accountStatus?: "INITIAL" | "ACTIVE" | "PENDING" | "REJECTED";
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumberPrefix?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  role?: "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER";
  accountStatus?: "INITIAL" | "ACTIVE" | "PENDING" | "REJECTED";
  referValue?: number;
}

export const api = {
  getDashboardStats: () =>
    adminFetch<ApiResponse<DashboardStats>>("/stats"),

  getUsers: (page = 1, limit = 20, search?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return adminFetch<ApiResponse<PaginatedResponse<User>>>(`/users?${params}`);
  },

  getUserById: (id: string) =>
    adminFetch<ApiResponse<User>>(`/users/${id}`),

  getActivities: (page = 1, limit = 20, type?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    return adminFetch<ApiResponse<PaginatedResponse<Activity>>>(`/activities?${params}`);
  },

  getRegistrationChart: () =>
    adminFetch<ApiResponse<ChartDataPoint[]>>("/charts/registrations"),

  getActivityTypeChart: () =>
    adminFetch<ApiResponse<TypeCount[]>>("/charts/activity-types"),

  getAccountStatusChart: () =>
    adminFetch<ApiResponse<StatusCount[]>>("/charts/account-status"),

  getKycActivityChart: () =>
    adminFetch<ApiResponse<TypeCount[]>>("/charts/kyc"),

  getReferralStats: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return adminFetch<ApiResponse<ReferralStats>>(`/referral-stats?${params}`);
  },

  createUser: (data: CreateUserPayload) =>
    adminFetch<ApiResponse<User>>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: UpdateUserPayload) =>
    adminFetch<ApiResponse<User>>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    adminFetch<ApiResponse<void>>(`/users/${id}`, {
      method: "DELETE",
    }),

  changeUserRole: (id: string, role: "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER") =>
    adminFetch<ApiResponse<User>>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // Marketing
  previewReferCode: (firstName: string, lastName: string) => {
    const params = new URLSearchParams({ firstName, lastName });
    return adminFetch<ApiResponse<{ referCode: string }>>(`/marketing/promoters/preview-refer-code?${params}`);
  },

  createPromoter: (data: CreatePromoterPayload) =>
    adminFetch<ApiResponse<User>>("/marketing/promoters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPromoters: (page = 1, limit = 20, search?: string, role?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    return adminFetch<ApiResponse<PromoterPaginatedResponse>>(`/marketing/promoters?${params}`);
  },

  getMarketingStats: () =>
    adminFetch<ApiResponse<MarketingStats>>("/marketing/stats"),
};
