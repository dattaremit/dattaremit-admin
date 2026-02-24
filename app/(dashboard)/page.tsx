"use client";

import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";
import {
  api,
  type DashboardStats,
  type ChartDataPoint,
  type TypeCount,
  type StatusCount,
  type ReferralStats,
} from "@/lib/api";
import { STATUS_BADGE_VARIANT, PIE_COLORS } from "@/lib/constants";
import { formatDate, formatMonthShort } from "@/lib/utils";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { StatsCard } from "@/components/stats-card";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { ErrorState } from "@/components/error-state";

interface DashboardData {
  stats: DashboardStats;
  registrationData: ChartDataPoint[];
  activityTypeData: TypeCount[];
  accountStatusData: StatusCount[];
  kycData: TypeCount[];
  referralStats: ReferralStats;
}

const registrationChartConfig = {
  count: { label: "Registrations", color: "var(--chart-1)" },
} satisfies ChartConfig;

const activityTypeChartConfig = {
  count: { label: "Count", color: "var(--chart-2)" },
} satisfies ChartConfig;

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
  const totalStatusUsers = accountStatusData.reduce((sum, d) => sum + d.count, 0);

  const accountStatusChartConfig = Object.fromEntries(
    accountStatusData.map((d, i) => [
      d.status,
      { label: d.status, color: PIE_COLORS[i % PIE_COLORS.length] },
    ]),
  ) satisfies ChartConfig;

  const kycChartConfig = Object.fromEntries(
    kycData.map((d, i) => [
      d.type,
      { label: d.type.replace("KYC_", ""), color: PIE_COLORS[i % PIE_COLORS.length] },
    ]),
  ) satisfies ChartConfig;

  const formattedRegData = registrationData.map((d) => ({
    month: formatMonthShort(d.month),
    count: d.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your DattaRemit platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="All registered users"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserCheck}
          description="Verified & active"
        />
        <StatsCard
          title="Pending KYC"
          value={stats.pendingKyc}
          icon={Clock}
          description="Awaiting verification"
        />
        <StatsCard
          title="Total Activities"
          value={stats.totalActivities}
          icon={Activity}
          description="All activity records"
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Registration Trend - Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  User Registrations
                </CardTitle>
                <CardDescription>Monthly registration trend</CardDescription>
              </CardHeader>
              <CardContent>
                {formattedRegData.length > 0 ? (
                  <ChartContainer config={registrationChartConfig} className="h-[300px] w-full">
                    <AreaChart data={formattedRegData} accessibilityLayer>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <defs>
                        <linearGradient id="fillReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="count"
                        type="monotone"
                        fill="url(#fillReg)"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">No registration data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Account Status - Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status Distribution</CardTitle>
                <CardDescription>Breakdown of user account statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {accountStatusData.length > 0 ? (
                  <ChartContainer config={accountStatusChartConfig} className="h-[300px] w-full">
                    <PieChart accessibilityLayer>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={accountStatusData.map((d) => ({
                          name: d.status,
                          value: d.count,
                          fill: accountStatusChartConfig[d.status]?.color,
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {accountStatusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Users & Activities */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/users/${user.id}`}
                              className="text-sm font-medium truncate block hover:underline"
                            >
                              {user.firstName} {user.lastName}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>{user.email}</TooltipContent>
                        </Tooltip>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[user.accountStatus] ?? "outline"}>
                        {user.accountStatus}
                      </Badge>
                    </div>
                  ))}
                  {stats.recentUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No users yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user
                            ? `${activity.user.firstName} ${activity.user.lastName}`
                            : "Unknown"}
                          {" - "}
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[activity.status] ?? "outline"}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                  {stats.recentActivities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activities yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Status Progress */}
          {totalStatusUsers > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Account Status Breakdown</CardTitle>
                <CardDescription>Progress of user account statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountStatusData.map((d) => (
                  <div key={d.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{d.status}</span>
                      <span className="text-muted-foreground">
                        {d.count} ({Math.round((d.count / totalStatusUsers) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(d.count / totalStatusUsers) * 100} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts Row 2 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Activity Types - Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Types</CardTitle>
                <CardDescription>Distribution of activity types</CardDescription>
              </CardHeader>
              <CardContent>
                {activityTypeData.length > 0 ? (
                  <ChartContainer config={activityTypeChartConfig} className="h-[350px] w-full">
                    <BarChart
                      data={activityTypeData.map((d) => ({
                        type: d.type.replace(/_/g, " "),
                        count: d.count,
                      }))}
                      layout="vertical"
                      accessibilityLayer
                    >
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="type"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={120}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">No activity data yet</p>
                )}
              </CardContent>
            </Card>

            {/* KYC Activities - Radial Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Activities</CardTitle>
                <CardDescription>KYC verification status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {kycData.length > 0 ? (
                  <ChartContainer config={kycChartConfig} className="h-[350px] w-full">
                    <RadialBarChart
                      data={kycData.map((d, i) => ({
                        name: d.type.replace("KYC_", ""),
                        value: d.count,
                        fill: PIE_COLORS[i % PIE_COLORS.length],
                      }))}
                      innerRadius={30}
                      outerRadius={140}
                      cx="50%"
                      cy="50%"
                      accessibilityLayer
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, Math.max(...kycData.map((d) => d.count), 1)]}
                        tick={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <RadialBar dataKey="value" cornerRadius={5} background />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2"
                      />
                    </RadialBarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">No KYC data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Referral Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>
                Total referrals: {referralStats.totalReferrals} users joined via referral
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralStats.topReferrers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead className="text-right">Referrals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralStats.topReferrers.map((referrer, i) => (
                      <TableRow key={referrer.id}>
                        <TableCell className="font-medium">#{i + 1}</TableCell>
                        <TableCell>
                          <Link href={`/users/${referrer.id}`} className="hover:underline">
                            {referrer.firstName} {referrer.lastName}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No referral data yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
