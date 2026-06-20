"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState } from "@/components/error-state";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import {
  api,
  type ReferralBonus,
  type ReferralBonusFilters,
} from "@/lib/api";
import { REFERRAL_BONUS_STATUSES } from "@/lib/constants";
import { ReferralBonusesTable } from "@/components/referrals/referral-bonuses-table";
import { ReferralBonusDetailDialog } from "@/components/referrals/referral-bonus-detail-dialog";
import { RetryPayoutDialog } from "@/components/referrals/retry-payout-dialog";

export function BonusPayoutsPanel() {
  const [status, setStatus] = useState("all");

  const {
    data: bonuses,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch,
  } = useFilteredTable<ReferralBonus, ReferralBonusFilters>(
    async (page, limit, filters) => {
      const res = await api.getReferralBonuses(page, limit, filters);
      return { data: res.data.items, total: res.data.total };
    },
    { status },
  );

  const detailDialog = useCrudDialog<ReferralBonus>();
  const retryDialog = useCrudDialog<ReferralBonus>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bonus Payouts</CardTitle>
        <CardDescription>
          {total} referral bonus{total !== 1 ? "es" : ""} recorded across the
          platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {REFERRAL_BONUS_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading ? (
          <TableSkeleton />
        ) : (
          <ReferralBonusesTable
            bonuses={bonuses}
            onViewDetail={detailDialog.open}
            onRetry={retryDialog.open}
          />
        )}

        <PagePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>

      {detailDialog.target && (
        <ReferralBonusDetailDialog
          bonus={detailDialog.target}
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) detailDialog.close();
          }}
        />
      )}

      {retryDialog.target && (
        <RetryPayoutDialog
          bonus={retryDialog.target}
          {...retryDialog.bindProps(refetch)}
        />
      )}
    </Card>
  );
}
