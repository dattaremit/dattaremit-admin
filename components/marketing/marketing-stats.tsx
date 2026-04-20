"use client";

import { Megaphone, TrendingUp, Users } from "lucide-react";
import { StatsCard } from "@/components/stats-card";

interface MarketingStatsProps {
  totalInfluencers: number;
  totalPromoters: number;
  totalPromoterReferrals: number;
}

export function MarketingStats({
  totalInfluencers,
  totalPromoters,
  totalPromoterReferrals,
}: MarketingStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total Influencers"
        value={totalInfluencers}
        icon={Megaphone}
        description="Active influencer accounts"
      />
      <StatsCard
        title="Total Promoters"
        value={totalPromoters}
        icon={Users}
        description="Active promoter accounts"
      />
      <StatsCard
        title="Total Referrals by Promoters"
        value={totalPromoterReferrals}
        icon={TrendingUp}
        description="Sign-ups attributed to promoters"
      />
    </div>
  );
}
