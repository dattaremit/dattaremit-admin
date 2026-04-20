"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrationChart } from "@/components/dashboard/registration-chart";
import { AccountStatusChart } from "@/components/dashboard/account-status-chart";
import { ActivityTypeChart } from "@/components/dashboard/activity-type-chart";
import { KycChart } from "@/components/dashboard/kyc-chart";
import { RecentUsers } from "@/components/dashboard/recent-users";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { AccountStatusBreakdown } from "@/components/dashboard/account-status-breakdown";
import { ReferralStatsTable } from "@/components/dashboard/referral-stats-table";
import { type DashboardData } from "@/hooks/use-dashboard-data";

interface DashboardTabsProps {
  data: DashboardData;
}

export function DashboardTabs({ data }: DashboardTabsProps) {
  const {
    stats,
    registrationData,
    activityTypeData,
    accountStatusData,
    kycData,
    referralStats,
  } = data;

  return (
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
  );
}
