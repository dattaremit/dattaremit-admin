"use client";

import { useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { ErrorState } from "@/components/error-state";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { useDashboardData } from "@/hooks/use-dashboard-data";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();
  const { user } = useUser();

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-brand">
              <Sparkles className="h-3 w-3" />
              {today}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              <span className="text-gradient-brand">
                {greeting}
                {user?.firstName ? `, ${user.firstName}` : ""}
              </span>
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Here&apos;s what&apos;s moving on the DattaRemit platform today —
              users, activity and KYC at a glance.
            </p>
          </div>
        </div>
      </div>

      <DashboardStatsCards stats={data.stats} />

      <div
        className="animate-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        <DashboardTabs data={data} />
      </div>
    </div>
  );
}
