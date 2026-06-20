"use client";

import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { type ReferralBonus } from "@/lib/api";
import {
  REFERRAL_BONUS_STATUS_VARIANT,
  REFERRAL_BONUS_PAYOUT_STATUS_VARIANT,
} from "@/lib/constants";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/table/status-badge";
import { EmptyTableRow } from "@/components/table/empty-table-row";

interface ReferralBonusesTableProps {
  bonuses: ReferralBonus[];
  onViewDetail: (bonus: ReferralBonus) => void;
  onRetry: (bonus: ReferralBonus) => void;
}

// A bonus can be retried once it has reached a terminal failure — either the
// bonus itself failed or its payout attempt failed / needs manual review.
function canRetry(bonus: ReferralBonus): boolean {
  return (
    bonus.status === "FAILED" ||
    bonus.payout?.status === "FAILED" ||
    bonus.payout?.status === "NEEDS_MANUAL_REVIEW"
  );
}

export function ReferralBonusesTable({
  bonuses,
  onViewDetail,
  onRetry,
}: ReferralBonusesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Beneficiary</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Bonus Status</TableHead>
            <TableHead>Payout Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bonuses.length === 0 ? (
            <EmptyTableRow colSpan={6}>No referral bonuses found</EmptyTableRow>
          ) : (
            bonuses.map((bonus) => (
              <TableRow key={bonus.id}>
                <TableCell>
                  <Badge variant="outline">{bonus.beneficiaryRole}</Badge>
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {formatAmount(Number(bonus.amount), bonus.currency)}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    value={bonus.status}
                    variants={REFERRAL_BONUS_STATUS_VARIANT}
                  />
                </TableCell>
                <TableCell>
                  {bonus.payout ? (
                    <StatusBadge
                      value={bonus.payout.status}
                      variants={REFERRAL_BONUS_PAYOUT_STATUS_VARIANT}
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(bonus.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canRetry(bonus) && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRetry(bonus)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Retry payout</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetail(bonus)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View details</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
