"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { type ReferralBonus } from "@/lib/api";
import {
  REFERRAL_BONUS_STATUS_VARIANT,
  REFERRAL_BONUS_PAYOUT_STATUS_VARIANT,
} from "@/lib/constants";
import { StatusBadge } from "@/components/table/status-badge";
import { formatDateTime } from "@/lib/utils";

interface ReferralBonusDetailDialogProps {
  bonus: ReferralBonus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-2 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm break-all">{children}</span>
    </div>
  );
}

export function ReferralBonusDetailDialog({
  bonus,
  open,
  onOpenChange,
}: ReferralBonusDetailDialogProps) {
  const { payout } = bonus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Referral Bonus Details</DialogTitle>
          <DialogDescription>
            Ledger record and payout attempt for this bonus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Bonus</h3>
          <DetailRow label="Beneficiary role">
            {bonus.beneficiaryRole}
          </DetailRow>
          <DetailRow label="Amount">
            {bonus.currency} {bonus.amount}
          </DetailRow>
          <DetailRow label="Status">
            <StatusBadge
              value={bonus.status}
              variants={REFERRAL_BONUS_STATUS_VARIANT}
            />
          </DetailRow>
          <DetailRow label="Referrer ID">{bonus.referrerId}</DetailRow>
          <DetailRow label="Referee ID">{bonus.refereeId}</DetailRow>
          <DetailRow label="Qualifying txn">
            {bonus.qualifyingTransactionId}
          </DetailRow>
          <DetailRow label="Payout txn">
            {bonus.payoutTransactionId ?? "—"}
          </DetailRow>
          <DetailRow label="Claimed at">
            {bonus.claimedAt ? formatDateTime(bonus.claimedAt) : "—"}
          </DetailRow>
          <DetailRow label="Failed at">
            {bonus.failedAt ? formatDateTime(bonus.failedAt) : "—"}
          </DetailRow>
          <DetailRow label="Created">
            {formatDateTime(bonus.created_at)}
          </DetailRow>
        </div>

        <Separator />

        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Payout</h3>
          {payout ? (
            <>
              <DetailRow label="Payout status">
                <StatusBadge
                  value={payout.status}
                  variants={REFERRAL_BONUS_PAYOUT_STATUS_VARIANT}
                />
              </DetailRow>
              <DetailRow label="Amount (USD)">{payout.amountUsd}</DetailRow>
              <DetailRow label="Output (INR)">
                {payout.outputAmountInr ?? "—"}
              </DetailRow>
              <DetailRow label="Retry count">{payout.retryCount}</DetailRow>
              <DetailRow label="Failure reason">
                {payout.failureReason ?? "—"}
              </DetailRow>
              <DetailRow label="Merchant payout ID">
                {payout.merchantPayoutId}
              </DetailRow>
              <DetailRow label="Credible payout ID">
                {payout.crediblePayoutId ?? "—"}
              </DetailRow>
              <DetailRow label="Created">
                {formatDateTime(payout.created_at)}
              </DetailRow>
              <DetailRow label="Updated">
                {formatDateTime(payout.updated_at)}
              </DetailRow>
            </>
          ) : (
            <p className="py-1.5 text-sm text-muted-foreground">
              No payout has been attempted for this bonus yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
