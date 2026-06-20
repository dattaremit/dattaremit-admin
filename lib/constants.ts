export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: "default",
  PENDING: "secondary",
  INITIAL: "outline",
  REJECTED: "destructive",
  COMPLETE: "default",
  FAILED: "destructive",
};

export const TRANSACTION_STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  COMPLETED: "default",
  ACCEPTED: "secondary",
  PROCESSING: "secondary",
  SIMULATED: "outline",
  FAILED: "destructive",
};

export const TRANSACTION_STATUSES = [
  "SIMULATED",
  "ACCEPTED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export const TRANSACTION_PAYOUT_PROVIDERS = [
  "ZYNK_DIRECT",
  "ZYNK_TO_CREDIBLE",
  "ZYNK_TO_DCX",
] as const;

export const ACTIVITY_TYPES = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYMENT",
  "REFUND",
  "KYC_SUBMITTED",
  "KYC_APPROVED",
  "KYC_REJECTED",
  "KYC_PENDING",
  "KYC_VERIFIED",
  "KYC_FAILED",
  "ACCOUNT_APPROVED",
  "ACCOUNT_ACTIVATED",
  "ACCOUNT_DEACTIVATED",
] as const;

export const REFERRAL_BONUS_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDING: "outline",
  INITIATED: "secondary",
  CLAIMED: "default",
  FAILED: "destructive",
};

export const REFERRAL_BONUS_PAYOUT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDING: "outline",
  INITIATED: "secondary",
  COMPLETED: "default",
  FAILED: "destructive",
  NEEDS_MANUAL_REVIEW: "destructive",
};

export const REFERRAL_BONUS_STATUSES = [
  "PENDING",
  "INITIATED",
  "CLAIMED",
  "FAILED",
] as const;

export const ROLE_BADGE_VARIANT: Record<string, BadgeVariant> = {
  ADMIN: "destructive",
  USER: "outline",
  INFLUENCER: "default",
  PROMOTER: "secondary",
};

export const ACCOUNT_STATUSES = [
  "INITIAL",
  "ACTIVE",
  "PENDING",
  "REJECTED",
] as const;

export const ACTIVITY_STATUSES = ["PENDING", "COMPLETE", "FAILED"] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const DEBOUNCE_MS = 400;

export const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
