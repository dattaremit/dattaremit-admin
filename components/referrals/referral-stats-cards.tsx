"use client";

import { Gift, TrendingUp, Trophy } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { Progress } from "@/components/ui/progress";

interface ReferralStatsCardsProps {
  totalReferrals: number;
  referralRate: number;
  topReferrerCount: number;
}

export function ReferralStatsCards({
  totalReferrals,
  referralRate,
  topReferrerCount,
}: ReferralStatsCardsProps) {
  return (
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
        value={topReferrerCount}
        icon={Trophy}
        description="Users with successful referrals"
      />
    </div>
  );
}
