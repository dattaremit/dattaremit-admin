"use client";

import { ArrowLeftRight, Landmark, ShieldCheck, UserPlus } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { Progress } from "@/components/ui/progress";
import type { ReferralFunnel } from "@/lib/api";

const STAGES: {
  key: keyof Omit<ReferralFunnel, "totalReferrals">;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    key: "completedKyc",
    title: "Completed KYC",
    icon: ShieldCheck,
    description: "Referred users who passed KYC",
  },
  {
    key: "connectedBank",
    title: "Connected Bank",
    icon: Landmark,
    description: "Referred users with a linked bank",
  },
  {
    key: "addedRecipient",
    title: "Added Recipient",
    icon: UserPlus,
    description: "Referred users with a recipient",
  },
  {
    key: "completedTransfer",
    title: "Completed Transfer",
    icon: ArrowLeftRight,
    description: "Referred users who sent money",
  },
];

// Platform-wide funnel: how far the whole referred cohort has progressed. Counts
// only — no individual referred user is identified.
export function ReferralFunnelCards({ funnel }: { funnel: ReferralFunnel }) {
  const total = funnel.totalReferrals;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAGES.map(({ key, title, icon, description }) => {
        const count = funnel[key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <StatsCard
            key={key}
            title={title}
            value={count}
            icon={icon}
            description={`${description} (${pct}% of ${total})`}
            accent="brand"
          >
            <Progress value={pct} className="mt-2 mb-1" />
          </StatsCard>
        );
      })}
    </div>
  );
}
