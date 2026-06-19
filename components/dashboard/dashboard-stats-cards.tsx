"use client";

import { Users, UserCheck, Clock, Activity } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { type DashboardStats } from "@/lib/api";

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        accent="brand"
        description="All registered users"
        index={0}
      />
      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        icon={UserCheck}
        accent="success"
        description="Verified & active"
        index={1}
      />
      <StatsCard
        title="Pending KYC"
        value={stats.pendingKyc}
        icon={Clock}
        accent="warning"
        description="Awaiting verification"
        index={2}
      />
      <StatsCard
        title="Total Activities"
        value={stats.totalActivities}
        icon={Activity}
        accent="neutral"
        description="All activity records"
        index={3}
      />
    </div>
  );
}
