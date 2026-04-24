const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function assertApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    !API_BASE_URL.startsWith("https://")
  ) {
    throw new Error("NEXT_PUBLIC_API_URL must use HTTPS in production");
  }
  return API_BASE_URL;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function safeErrorMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status === 409) return "This request conflicts with an existing record.";
  if (status === 422) return "Some of the information you entered isn't valid.";
  if (status === 429) return "Too many requests. Please wait a moment.";
  if (status >= 500) return "A server error occurred. Please try again later.";
  if (status >= 400) return "Invalid request. Please check your details.";
  return "An unexpected error occurred. Please try again.";
}

let getAuthToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

async function adminFetch<T>(
  endpoint: string,
  options?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const token = getAuthToken ? await getAuthToken() : null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const baseUrl = assertApiBaseUrl();
    const res = await fetch(`${baseUrl}/admin${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-auth-token": token } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      console.error("API error", res.status, body);
      throw new Error(safeErrorMessage(res.status));
    }

    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("The request took too long. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
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
  accountStatus: "INITIAL" | "ACTIVE" | "PENDING" | "REJECTED" | "DELETED";
  role: "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER";
  zynkEntityId: string | null;
  zynkExternalAccountId: string | null;
  zynkDepositAccountId: string | null;
  indianKycStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "FAILED";
  instantTransfer: boolean;
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

export type SettingsKey =
  | "WEEKLY_TRANSFER_LIMIT_USD"
  | "WAITLIST_ENABLED"
  | "NOTIFY_EMAIL_ENABLED"
  | "NOTIFY_KYC_ALERTS"
  | "NOTIFY_NEW_USER_ALERTS"
  | "NOTIFY_ALERT_EMAIL"
  | "NOTIFY_WEBHOOK_URL";

export interface AppSettings {
  [key: string]: {
    value: string;
    updatedBy: string | null;
    updated_at: string | null;
  };
}

export type AccessListType = "BLOCKLIST" | "ALLOWLIST";

export interface AccessControlEntry {
  id: string;
  email: string;
  listType: AccessListType;
  reason: string | null;
  createdBy: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessControlListResponse {
  entries: AccessControlEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  users?: T[];
  activities?: T[];
  recipients?: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BankDetailsPublic {
  id: string;
  label: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumberMasked: string | null;
  bankIfsc: string | null;
  branchName: string | null;
  bankAccountType: string | null;
  isDefault: boolean;
  created_at?: string;
}

export interface RecipientSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "FAILED" | null;
  banks: BankDetailsPublic[];
  defaultBank: BankDetailsPublic | null;
  hasBankAccount: boolean;
  linkedUserCount: number;
  bankCount: number;
  created_at: string;
}

export interface RecipientDetail extends RecipientSummary {
  nationality: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  linkedUsers: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    accountStatus: string;
    created_at: string;
    linkedAt: string;
  }[];
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

  getRecipients: (
    page = 1,
    limit = 20,
    search?: string,
    kycStatus?: string,
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    if (kycStatus) params.set("kycStatus", kycStatus);
    return adminFetch<ApiResponse<PaginatedResponse<RecipientSummary>>>(
      `/recipients?${params}`,
    );
  },

  getRecipientById: (id: string) =>
    adminFetch<ApiResponse<RecipientDetail>>(`/recipients/${id}`),

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

  toggleInstantTransfer: (id: string, enabled: boolean) =>
    adminFetch<ApiResponse<User>>(`/users/${id}/instant-transfer`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
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

  // Settings
  getSettings: () =>
    adminFetch<ApiResponse<AppSettings>>("/settings"),

  updateSetting: (key: SettingsKey, value: string) =>
    adminFetch<ApiResponse<unknown>>("/settings", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    }),

  // Access control
  getAccessControlList: (
    listType: AccessListType,
    page = 1,
    limit = 20,
    search?: string,
  ) => {
    const params = new URLSearchParams({
      listType,
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    return adminFetch<ApiResponse<AccessControlListResponse>>(
      `/access-control?${params}`,
    );
  },

  addAccessControlEmail: (payload: {
    email: string;
    listType: AccessListType;
    reason?: string;
  }) =>
    adminFetch<ApiResponse<AccessControlEntry>>("/access-control", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  removeAccessControlEmail: (id: string) =>
    adminFetch<ApiResponse<void>>(`/access-control/${id}`, {
      method: "DELETE",
    }),

  setWaitlistEnabled: (enabled: boolean) =>
    adminFetch<ApiResponse<unknown>>("/settings", {
      method: "PUT",
      body: JSON.stringify({
        key: "WAITLIST_ENABLED",
        value: enabled ? "true" : "false",
      }),
    }),
};
