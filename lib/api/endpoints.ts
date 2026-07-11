// Typed admin endpoint functions. Grouped by domain (dashboard, users,
// recipients, transactions, activities, charts, marketing, settings, access
// control). All requests go through `adminFetch` from ./client.

import { adminFetch, assertApiBaseUrl, getTokenGetter } from "./client";
import type {
  AccessControlEntry,
  AccessControlListResponse,
  AccessListType,
  Activity,
  ActivityFilters,
  ApiResponse,
  AppSettings,
  ChartDataPoint,
  CreatePromoterPayload,
  CreateUserPayload,
  DashboardStats,
  MarketingStats,
  PaginatedResponse,
  PromoterPaginatedResponse,
  RecipientDetail,
  RecipientSummary,
  ReferralBonusFilters,
  ReferralBonusListResponse,
  ReferralStats,
  RetryPayoutResult,
  SettingsKey,
  StatusCount,
  TransactionDetail,
  TransactionFilters,
  TransactionListItem,
  TransferRequest,
  TransferRequestFilters,
  TypeCount,
  UpdateUserPayload,
  UsdBankAccount,
  User,
  WebhookEventDetail,
  WebhookEventListItem,
  WebhookFilters,
} from "./types";

// The dashboard route fires `/admin/stats` twice on load — once from the shell's
// admin-authorization check and once from the dashboard data hook — at the same
// moment. Collapse concurrent in-flight calls into a single request so the page
// load makes one round trip instead of two. No TTL: once the request settles the
// next call fetches fresh data, so refetch/retry semantics are unchanged.
let statsInFlight: Promise<ApiResponse<DashboardStats>> | null = null;

export const api = {
  getDashboardStats: () => {
    if (statsInFlight) return statsInFlight;
    statsInFlight = adminFetch<ApiResponse<DashboardStats>>("/stats").finally(
      () => {
        statsInFlight = null;
      },
    );
    return statsInFlight;
  },

  getUsers: (page = 1, limit = 20, search?: string, status?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return adminFetch<ApiResponse<PaginatedResponse<User>>>(`/users?${params}`);
  },

  getUserById: (id: string) => adminFetch<ApiResponse<User>>(`/users/${id}`),

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

  getTransactions: (page = 1, limit = 20, filters: TransactionFilters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.payoutProvider)
      params.set("payoutProvider", filters.payoutProvider);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return adminFetch<ApiResponse<PaginatedResponse<TransactionListItem>>>(
      `/transactions?${params}`,
    );
  },

  getTransactionById: (id: string) =>
    adminFetch<ApiResponse<TransactionDetail>>(`/transactions/${id}`),

  getWebhookEvents: (page = 1, limit = 20, filters: WebhookFilters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.provider) params.set("provider", filters.provider);
    if (filters.status) params.set("status", filters.status);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return adminFetch<ApiResponse<PaginatedResponse<WebhookEventListItem>>>(
      `/webhooks?${params}`,
    );
  },

  getWebhookEventById: (id: string) =>
    adminFetch<ApiResponse<WebhookEventDetail>>(`/webhooks/${id}`),

  getActivities: (page = 1, limit = 20, filters: ActivityFilters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.actorId) params.set("actorId", filters.actorId);
    if (filters.subjectUserId)
      params.set("subjectUserId", filters.subjectUserId);
    if (filters.referenceId) params.set("referenceId", filters.referenceId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return adminFetch<ApiResponse<PaginatedResponse<Activity>>>(
      `/activities?${params}`,
    );
  },

  /**
   * Triggers a CSV download by fetching the export with the auth header set,
   * then handing the resulting Blob to the browser. Avoids leaking the auth
   * token into the URL (which would be logged by proxies / browser history).
   */
  downloadActivitiesCsv: async (filters: ActivityFilters = {}) => {
    const params = new URLSearchParams({ format: "csv" });
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);
    if (filters.actorId) params.set("actorId", filters.actorId);
    if (filters.subjectUserId)
      params.set("subjectUserId", filters.subjectUserId);
    if (filters.referenceId) params.set("referenceId", filters.referenceId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    const getToken = getTokenGetter();
    if (!getToken) throw new Error("Token getter not initialized");
    const token = await getToken();
    const baseUrl = assertApiBaseUrl();
    const res = await fetch(`${baseUrl}/admin/activities/export?${params}`, {
      headers: { "x-auth-token": token ?? "" },
    });
    if (!res.ok) {
      throw new Error(`Export failed: ${res.status} ${res.statusText}`);
    }
    const blob = await res.blob();
    const filename =
      res.headers
        .get("Content-Disposition")
        ?.match(/filename="?([^";]+)/)?.[1] ?? `activities-${Date.now()}.csv`;
    const truncated = res.headers.get("X-Truncated") === "true";
    const total = Number(res.headers.get("X-Total-Count") ?? 0);
    return { blob, filename, truncated, total };
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
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    return adminFetch<ApiResponse<ReferralStats>>(`/referral-stats?${params}`);
  },

  // Referral bonuses
  getReferralBonuses: (
    page = 1,
    limit = 20,
    filters: ReferralBonusFilters = {},
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filters.status) params.set("status", filters.status);
    return adminFetch<ApiResponse<ReferralBonusListResponse>>(
      `/referral-bonuses?${params}`,
    );
  },

  retryReferralBonusPayout: (id: string) =>
    adminFetch<ApiResponse<RetryPayoutResult>>(
      `/referral-bonuses/${id}/retry-payout`,
      { method: "POST" },
    ),

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

  changeUserRole: (
    id: string,
    role: "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER",
  ) =>
    adminFetch<ApiResponse<User>>(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  toggleInstantTransfer: (id: string, enabled: boolean) =>
    adminFetch<ApiResponse<User>>(`/users/${id}/instant-transfer`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),

  // Sets (replaces) the user's prepaid balance to the given USD amount.
  setUserBalance: (id: string, balance: number) =>
    adminFetch<ApiResponse<User>>(`/users/${id}/balance`, {
      method: "PATCH",
      body: JSON.stringify({ balance }),
    }),

  // Assigns (replaces) the user's USD receiving bank account — shown to the
  // user on their balance page. Assigned before crediting a balance.
  setUsdBankAccount: (id: string, usdBankAccount: UsdBankAccount) =>
    adminFetch<ApiResponse<User>>(`/users/${id}/usd-bank-account`, {
      method: "PATCH",
      body: JSON.stringify(usdBankAccount),
    }),

  // Balance-send requests filed by users; fulfilled manually by an admin.
  getTransferRequests: (page = 1, limit = 20, filters: TransferRequestFilters = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    return adminFetch<ApiResponse<PaginatedResponse<TransferRequest>>>(
      `/transfer-requests?${params}`,
    );
  },

  updateTransferRequestStatus: (
    id: string,
    status: "COMPLETED" | "REJECTED",
    note?: string,
  ) =>
    adminFetch<ApiResponse<TransferRequest>>(`/transfer-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    }),

  // Marketing
  previewReferCode: (firstName: string, lastName: string) => {
    const params = new URLSearchParams({ firstName, lastName });
    return adminFetch<ApiResponse<{ referCode: string }>>(
      `/marketing/promoters/preview-refer-code?${params}`,
    );
  },

  createPromoter: (data: CreatePromoterPayload) =>
    adminFetch<ApiResponse<User>>("/marketing/promoters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPromoters: (page = 1, limit = 20, search?: string, role?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    return adminFetch<ApiResponse<PromoterPaginatedResponse>>(
      `/marketing/promoters?${params}`,
    );
  },

  getMarketingStats: () =>
    adminFetch<ApiResponse<MarketingStats>>("/marketing/stats"),

  // Settings
  getSettings: () => adminFetch<ApiResponse<AppSettings>>("/settings"),

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

  setRecipientKycEnabled: (enabled: boolean) =>
    adminFetch<ApiResponse<unknown>>("/settings", {
      method: "PUT",
      body: JSON.stringify({
        key: "RECIPIENT_KYC_ENABLED",
        value: enabled ? "true" : "false",
      }),
    }),
};
