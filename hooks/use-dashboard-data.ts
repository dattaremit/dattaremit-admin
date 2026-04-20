"use client";

import {
  api,
  type DashboardStats,
  type ChartDataPoint,
  type TypeCount,
  type StatusCount,
  type ReferralStats,
} from "@/lib/api";
import { useApiFetch } from "@/hooks/use-api-fetch";

export interface DashboardData {
  stats: DashboardStats;
  registrationData: ChartDataPoint[];
  activityTypeData: TypeCount[];
  accountStatusData: StatusCount[];
  kycData: TypeCount[];
  referralStats: ReferralStats;
}

export function useDashboardData() {
  return useApiFetch<DashboardData>(async () => {
    const [statsRes, regRes, actTypeRes, accStatusRes, kycRes, refRes] =
      await Promise.all([
        api.getDashboardStats(),
        api.getRegistrationChart(),
        api.getActivityTypeChart(),
        api.getAccountStatusChart(),
        api.getKycActivityChart(),
        api.getReferralStats(),
      ]);
    return {
      stats: statsRes.data,
      registrationData: regRes.data,
      activityTypeData: actTypeRes.data,
      accountStatusData: accStatusRes.data,
      kycData: kycRes.data,
      referralStats: refRes.data,
    };
  });
}
