"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ErrorState } from "@/components/error-state";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { api, type DashboardStats } from "@/lib/api";
import { ReferralStatsCards } from "@/components/referrals/referral-stats-cards";
import {
  ReferrersTable,
  type Referrer,
} from "@/components/referrals/referrers-table";

interface StatsData {
  totalReferrals: number;
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

  const { totalReferrals, dashStats } = statsData;
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

      <ReferralStatsCards
        totalReferrals={totalReferrals}
        referralRate={referralRate}
        topReferrerCount={total}
      />

      <Card>
        <CardHeader>
          <CardTitle>Referrer Leaderboard</CardTitle>
          <CardDescription>Detailed breakdown of top referrers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or referral code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

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
    </div>
  );
}
