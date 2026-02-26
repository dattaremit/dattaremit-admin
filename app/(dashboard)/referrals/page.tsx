"use client";

import { useState } from "react";
import { ErrorState } from "@/components/error-state";
import { PagePagination } from "@/components/page-pagination";
import { StatsCard } from "@/components/stats-card";
import { TableSkeleton } from "@/components/table-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { api, type DashboardStats } from "@/lib/api";
import { Gift, Search, TrendingUp, Trophy, Users } from "lucide-react";
import Link from "next/link";

interface StatsData {
  totalReferrals: number;
  dashStats: DashboardStats;
}

interface Referrer {
  id: string;
  firstName: string;
  lastName: string;
  referCode: string;
  referralCount: number;
}

export default function ReferralsPage() {
  const [search, setSearch] = useState("");

  // Stats cards + chart (no filtering needed)
  const { data: statsData, loading: statsLoading, error: statsError, refetch: statsRefetch } =
    useApiFetch<StatsData>(async () => {
      const [refRes, statsRes] = await Promise.all([
        api.getReferralStats(),
        api.getDashboardStats(),
      ]);
      return {
        totalReferrals: refRes.data.totalReferrals,
        dashStats: statsRes.data,
      };
    });

  // Leaderboard table (with search + pagination)
  const {
    data: topReferrers,
    total,
    page,
    setPage,
    totalPages,
    loading: tableLoading,
    error: tableError,
    refetch: tableRefetch,
  } = usePaginatedFetch<Referrer>(
    async (page, limit) => {
      const res = await api.getReferralStats(page, limit, search || undefined);
      return { data: res.data.topReferrers, total: res.data.total };
    },
    [search],
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
  const totalUsers = dashStats.totalUsers;
  const referralRate =
    totalUsers > 0 ? Math.round((totalReferrals / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Track referral program performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Referrals"
          value={totalReferrals}
          icon={Gift}
          description="Users who joined via referral"
        />
        <StatsCard
          title="Referral Rate"
          value={`${referralRate}%`}
          icon={TrendingUp}
          description="Of all users joined via referral"
        >
          <Progress value={referralRate} className="mt-2 mb-1" />
        </StatsCard>
        <StatsCard
          title="Top Referrers"
          value={total}
          icon={Trophy}
          description="Users with successful referrals"
        />
      </div>

      {/* Referrer Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Referrer Leaderboard</CardTitle>
          <CardDescription>Detailed breakdown of top referrers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or referral code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          {tableError ? (
            <ErrorState message={tableError} onRetry={tableRefetch} />
          ) : tableLoading ? (
            <TableSkeleton />
          ) : topReferrers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead className="text-right">Referrals</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topReferrers.map((referrer, i) => (
                    <TableRow key={referrer.id}>
                      <TableCell>
                        <Badge
                          variant={page === 1 && i === 0 ? "default" : "outline"}
                          className="w-8 justify-center"
                        >
                          {(page - 1) * 20 + i + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/users/${referrer.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {referrer.firstName?.[0]}
                              {referrer.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {referrer.firstName} {referrer.lastName}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {referrer.referCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {referrer.referralCount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {totalReferrals > 0
                          ? `${Math.round((referrer.referralCount / totalReferrals) * 100)}%`
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No referral data yet</p>
              <p className="text-sm text-muted-foreground/70">
                {search
                  ? "No referrers match your search"
                  : "Referral stats will appear once users start referring others"}
              </p>
            </div>
          )}

          <PagePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
