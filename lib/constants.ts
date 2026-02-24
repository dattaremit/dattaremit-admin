export const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  PENDING: "secondary",
  INITIAL: "outline",
  REJECTED: "destructive",
  COMPLETE: "default",
  FAILED: "destructive",
};

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

export const ACCOUNT_STATUSES = ["INITIAL", "ACTIVE", "PENDING", "REJECTED"] as const;

export const ACTIVITY_STATUSES = ["PENDING", "COMPLETE", "FAILED"] as const;

export const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
