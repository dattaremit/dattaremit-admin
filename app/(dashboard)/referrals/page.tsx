"use client";

import { useState } from "react";
import { ErrorState } from "@/components/error-state";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { SearchInput } from "@/components/search-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { api, type DashboardStats, type ReferralFunnel } from "@/lib/api";
import { ReferralStatsCards } from "@/components/referrals/referral-stats-cards";
import { ReferralFunnelCards } from "@/components/referrals/referral-funnel-cards";
import {
  ReferrersTable,
  type Referrer,
} from "@/components/referrals/referrers-table";
import { BonusPayoutsPanel } from "@/components/referrals/bonus-payouts-panel";

interface StatsData {
  totalReferrals: number;
  funnel: ReferralFunnel;
  dashStats: DashboardStats;
}

export default function ReferralsPage() {
  const [search, setSearch] = useState("");

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: statsRefetch,
  } = useApiFetch<StatsData>(async () => {
    const [refRes, statsRes] = await Promise.all([
      api.getReferralStats(),
      api.getDashboardStats(),
    ]);
    return {
      totalReferrals: refRes.data.totalReferrals,
      funnel: refRes.data.funnel,
      dashStats: statsRes.data,
    };
  });

  const {
    data: topReferrers,
    total,
    page,
    setPage,
    totalPages,
    loading: tableLoading,
    error: tableError,
    refetch: tableRefetch,
  } = useFilteredTable<Referrer, { search?: string }>(
    async (page, limit, { search }) => {
      const res = await api.getReferralStats(page, limit, search);
      return { data: res.data.topReferrers, total: res.data.total };
    },
    { search },
  );

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-100" />
      </div>
    );
  }

  if (statsError) return <ErrorState message={statsError} onRetry={statsRefetch} />;
  if (!statsData) return null;

  const { totalReferrals, funnel, dashStats } = statsData;
  const referralRate =
    dashStats.totalUsers > 0
      ? Math.round((totalReferrals / dashStats.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Track referral program performance
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bonus-payouts">Bonus Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReferralStatsCards
            totalReferrals={totalReferrals}
            referralRate={referralRate}
            topReferrerCount={total}
          />

          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Referred user funnel</h2>
              <p className="text-sm text-muted-foreground">
                How far referred users progress — aggregate counts only, no individual data
              </p>
            </div>
            <ReferralFunnelCards funnel={funnel} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Referrer Leaderboard</CardTitle>
              <CardDescription>Detailed breakdown of top referrers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name, email, or referral code..."
              />

              {tableError ? (
                <ErrorState message={tableError} onRetry={tableRefetch} />
              ) : tableLoading ? (
                <TableSkeleton />
              ) : (
                <ReferrersTable
                  referrers={topReferrers}
                  page={page}
                  totalReferrals={totalReferrals}
                  searchActive={!!search}
                />
              )}

              <PagePagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonus-payouts" className="space-y-6">
          <BonusPayoutsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
