"use client";

import { Users, UserCheck, Clock, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  api,
  type DashboardStats,
  type ChartDataPoint,
  type TypeCount,
  type StatusCount,
  type ReferralStats,
} from "@/lib/api";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { StatsCard } from "@/components/stats-card";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { ErrorState } from "@/components/error-state";
import { RegistrationChart } from "@/components/dashboard/registration-chart";
import { AccountStatusChart } from "@/components/dashboard/account-status-chart";
import { ActivityTypeChart } from "@/components/dashboard/activity-type-chart";
import { KycChart } from "@/components/dashboard/kyc-chart";
import { RecentUsers } from "@/components/dashboard/recent-users";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { AccountStatusBreakdown } from "@/components/dashboard/account-status-breakdown";
import { ReferralStatsTable } from "@/components/dashboard/referral-stats-table";

interface DashboardData {
  stats: DashboardStats;
  registrationData: ChartDataPoint[];
  activityTypeData: TypeCount[];
  accountStatusData: StatusCount[];
  kycData: TypeCount[];
  referralStats: ReferralStats;
}

export default function DashboardPage() {
  const { data, loading, error, refetch } = useApiFetch<DashboardData>(
    async () => {
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
    },
  );

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const { stats, registrationData, activityTypeData, accountStatusData, kycData, referralStats } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your DattaRemit platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} description="All registered users" />
        <StatsCard title="Active Users" value={stats.activeUsers} icon={UserCheck} description="Verified & active" />
        <StatsCard title="Pending KYC" value={stats.pendingKyc} icon={Clock} description="Awaiting verification" />
        <StatsCard title="Total Activities" value={stats.totalActivities} icon={Activity} description="All activity records" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RegistrationChart data={registrationData} />
            <AccountStatusChart data={accountStatusData} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RecentUsers users={stats.recentUsers} />
            <RecentActivities activities={stats.recentActivities} />
          </div>

          <AccountStatusBreakdown data={accountStatusData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ActivityTypeChart data={activityTypeData} />
            <KycChart data={kycData} />
          </div>

          <ReferralStatsTable stats={referralStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
