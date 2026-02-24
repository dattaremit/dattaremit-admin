"use client";

import Link from "next/link";
import { Gift, Users, TrendingUp, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { api, type ReferralStats, type DashboardStats } from "@/lib/api";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { StatsCard } from "@/components/stats-card";
import { ErrorState } from "@/components/error-state";

interface ReferralData {
  referralStats: ReferralStats;
  dashStats: DashboardStats;
}

const referralChartConfig = {
  referralCount: { label: "Referrals", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function ReferralsPage() {
  const { data, loading, error, refetch } = useApiFetch<ReferralData>(
    async () => {
      const [refRes, statsRes] = await Promise.all([
        api.getReferralStats(),
        api.getDashboardStats(),
      ]);
      return {
        referralStats: refRes.data,
        dashStats: statsRes.data,
      };
    },
  );

  if (loading) {
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
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const { referralStats, dashStats } = data;
  const totalUsers = dashStats.totalUsers;
  const totalReferrals = referralStats.totalReferrals;
  const referralRate = totalUsers > 0 ? Math.round((totalReferrals / totalUsers) * 100) : 0;

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
          value={referralStats.topReferrers.length}
          icon={Trophy}
          description="Users with successful referrals"
        />
      </div>

      {/* Top Referrers Chart */}
      {referralStats.topReferrers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>
              Users who brought the most referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={referralChartConfig} className="h-[300px] w-full">
              <BarChart
                data={referralStats.topReferrers.map((r) => ({
                  name: `${r.firstName} ${r.lastName}`,
                  referralCount: r.referralCount,
                }))}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="referralCount"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Referrers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referrer Leaderboard</CardTitle>
          <CardDescription>
            Detailed breakdown of top referrers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralStats.topReferrers.length > 0 ? (
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
                  {referralStats.topReferrers.map((referrer, i) => (
                    <TableRow key={referrer.id}>
                      <TableCell>
                        <Badge
                          variant={i === 0 ? "default" : "outline"}
                          className="w-8 justify-center"
                        >
                          {i + 1}
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
                Referral stats will appear once users start referring others
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
