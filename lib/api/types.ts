// Shared API types: the response envelope plus every domain model returned by
// the admin endpoints. Kept separate from the fetch client and the endpoint
// definitions so types can be imported without pulling in runtime code.

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
  // Admin-only fee tier. The user-facing API never returns this field;
  // only admin endpoints surface it.
  rateFlag: "ZERO" | "SMALL" | "MEDIUM" | "HIGH";
  created_at: string;
  updated_at: string;
  addresses?: Address[];
  activities?: Activity[];
  // The user's own saved bank accounts. Returned by the user-detail endpoint
  // (GET /admin/users/:id) with the FULL account number for manual payout.
  banks?: BankDetailsAdmin[];
  // The user's own NRE bank account (at most one), if added. Full details for
  // manual payout. Null/absent when the user has not added an NRE account.
  nreBankAccount?: NreBankAccountAdmin | null;
  _count?: { addresses: number };
}

export type RateFlag = User["rateFlag"];

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
  // Audit-grade fields. Optional because legacy rows pre-PR1 won't carry them.
  actorId?: string | null;
  actorType?: "USER" | "ADMIN" | "SYSTEM" | "WEBHOOK";
  requestId?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
  deviceId?: string | null;
  diff?: Record<string, unknown> | null;
  resultCode?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ActivityFilters {
  type?: string;
  status?: string;
  actorId?: string;
  subjectUserId?: string;
  referenceId?: string;
  from?: string;
  to?: string;
  // Index signature lets the value flow through `useFilteredTable<F extends FilterMap>`
  // without a structural mismatch — the hook treats every entry as
  // `string | undefined` and only forwards keys that exist on this type.
  [key: string]: string | undefined;
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

export interface ReferralFunnel {
  totalReferrals: number;
  completedKyc: number;
  connectedBank: number;
  addedRecipient: number;
  completedTransfer: number;
}

export interface ReferralStats {
  totalReferrals: number;
  // Platform-wide funnel of how far referred users have progressed (counts only,
  // no per-user identities). funnel.totalReferrals === totalReferrals above.
  funnel: ReferralFunnel;
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

// Referral bonus ledger (GET /admin/referral-bonuses). `amount`/`amountUsd`/
// `outputAmountInr` arrive as decimal strings from the backend.
export type ReferralBonusStatus =
  | "PENDING"
  | "INITIATED"
  | "CLAIMED"
  | "FAILED";

export type ReferralBonusPayoutStatus =
  | "PENDING"
  | "INITIATED"
  | "COMPLETED"
  | "FAILED"
  | "NEEDS_MANUAL_REVIEW";

export interface ReferralBonusPayout {
  id: string;
  status: ReferralBonusPayoutStatus;
  amountUsd: string;
  outputAmountInr: string | null;
  retryCount: number;
  failureReason: string | null;
  merchantPayoutId: string;
  crediblePayoutId: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralBonus {
  id: string;
  beneficiaryRole: "REFERRER" | "REFEREE";
  referrerId: string;
  refereeId: string;
  qualifyingTransactionId: string;
  amount: string;
  currency: string;
  status: ReferralBonusStatus;
  payoutTransactionId: string | null;
  claimedAt: string | null;
  failedAt: string | null;
  payout: ReferralBonusPayout | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralBonusListResponse {
  items: ReferralBonus[];
  total: number;
  page: number;
  limit: number;
}

export interface ReferralBonusFilters {
  status?: string;
  [key: string]: string | undefined;
}

export interface RetryPayoutResult {
  bonusStatus: ReferralBonusStatus;
  payoutStatus: ReferralBonusPayoutStatus | null;
}

export type SettingsKey =
  | "WEEKLY_TRANSFER_LIMIT_USD"
  | "WAITLIST_ENABLED"
  | "RECIPIENT_KYC_ENABLED"
  | "NOTIFY_EMAIL_ENABLED"
  | "NOTIFY_KYC_ALERTS"
  | "NOTIFY_NEW_USER_ALERTS"
  | "NOTIFY_ALERT_EMAIL"
  | "NOTIFY_WEBHOOK_URL"
  | "DEVELOPER_FEE_ENABLED"
  | "ZYNK_FEE_BPS"
  | "BANKING_FEE_USD"
  | "NRE_FEE_BPS"
  | "RATE_FLAG_MULTIPLIER_SMALL"
  | "RATE_FLAG_MULTIPLIER_MEDIUM"
  | "RATE_FLAG_MULTIPLIER_HIGH"
  | "NRE_SELF_TRANSFER_FEE_RATE"
  | "REFERRAL_BONUS_ENABLED"
  | "REFERRAL_BONUS_MIN_TRANSFER_USD"
  | "REFERRAL_REFERRER_BONUS_USD"
  | "REFERRAL_REFEREE_BONUS_USD";

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
  transactions?: T[];
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

// Admin-only bank shape with the FULL (unmasked) account number, returned by
// GET /admin/users/:id so an admin can manually key a bank transfer when an
// automated payout fails.
export interface BankDetailsAdmin {
  id: string;
  label: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  branchName: string | null;
  bankAccountType: string | null;
  isDefault: boolean;
  created_at?: string;
}

// Admin-only shape for the user's own NRE bank account (separate model, carries
// SWIFT + currency). Full account number, same manual-payout rationale.
export interface NreBankAccountAdmin {
  id: string;
  accountType: string | null;
  bankName: string | null;
  branchName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  swiftCode: string | null;
  currency: string | null;
  accountStatus: string | null;
  isPrimary: boolean;
  created_at?: string;
}

export type TransactionStatus =
  | "SIMULATED"
  | "ACCEPTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type TransactionPayoutProvider =
  | "ZYNK_DIRECT"
  | "ZYNK_TO_CREDIBLE"
  | "ZYNK_TO_DCX";

// Row shape for the transactions table.
export interface TransactionListItem {
  id: string;
  zynkTransactionId: string;
  status: TransactionStatus;
  payoutProvider: TransactionPayoutProvider;
  destinationName: string | null;
  sendAmount: number | null;
  sendCurrency: string;
  receiveAmount: number | null;
  receiveCurrency: string;
  exchangeRate: number | null;
  totalFees: number | null;
  feeCurrency: string | null;
  developerFeeAmount: number | null;
  sender: { id: string; name: string; email: string | null };
  counterparty: { type: "recipient" | "user" | "self"; name: string };
  created_at: string;
}

// Full detail for the transaction detail page.
export interface TransactionDetail {
  id: string;
  zynkTransactionId: string;
  zynkExecutionId: string | null;
  status: TransactionStatus;
  payoutProvider: TransactionPayoutProvider;
  destinationName: string | null;
  depositMemo: string | null;
  failureReason: string | null;
  created_at: string;
  updated_at: string;
  amounts: {
    sendAmount: number | null;
    sendCurrency: string;
    receiveAmount: number | null;
    receiveCurrency: string;
    exchangeRate: number | null;
    liveRate: number | null;
    totalFees: number | null;
    feeCurrency: string | null;
    developerFeeRate: number | null;
    developerFeeAmount: number | null;
  };
  sender: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    zynkEntityId: string | null;
    zynkExternalAccountId: string | null;
    credibleExternalAccountId: string | null;
  } | null;
  receiver: { id: string; name: string; email: string | null } | null;
  recipient: {
    id: string;
    name: string;
    email: string | null;
    kycStatus: string | null;
    zynkEntityId: string | null;
    credibleExternalAccountId: string | null;
  } | null;
  bankDetails: BankDetailsAdmin | null;
  nreBankAccount: NreBankAccountAdmin | null;
  credible: {
    id: string;
    purpose: string;
    status: string;
    merchantPayoutId: string;
    crediblePayoutId: string | null;
    senderCustomerId: string;
    receiverCustomerId: string | null;
    inputAmount: number | null;
    inputCurrency: string;
    outputAmount: number | null;
    outputCurrency: string;
    fxRateAtPayout: number | null;
    isSelfTransfer: boolean;
    transactionReferenceNo: string | null;
    failureReason: string | null;
    completedAt: string | null;
    failedAt: string | null;
    created_at: string;
  } | null;
  simulateResponse: unknown;
  transferResponse: unknown;
}

export interface TransactionFilters {
  search?: string;
  status?: string;
  payoutProvider?: string;
  from?: string;
  to?: string;
  [key: string]: string | undefined;
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
  rateFlag?: RateFlag;
}
