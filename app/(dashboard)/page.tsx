"use client";

import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { ErrorState } from "@/components/error-state";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your DattaRemit platform</p>
      </div>

      <DashboardStatsCards stats={data.stats} />
      <DashboardTabs data={data} />
    </div>
  );
}
