"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type ReferralBonus } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";

interface RetryPayoutDialogProps {
  bonus: ReferralBonus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RetryPayoutDialog({
  bonus,
  open,
  onOpenChange,
  onSuccess,
}: RetryPayoutDialogProps) {
  const { loading, run: handleRetry } = useDialogAction(
    () => api.retryReferralBonusPayout(bonus.id),
    {
      successMessage: "Referral bonus payout retry triggered",
      errorMessage: "Failed to retry payout",
      onOpenChange,
      onSuccess,
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retry Bonus Payout</DialogTitle>
          <DialogDescription>
            Re-attempt the payout for this{" "}
            <strong>{bonus.beneficiaryRole.toLowerCase()}</strong> bonus of{" "}
            <strong>
              {bonus.currency} {bonus.amount}
            </strong>
            . The failed payout is reset and dispatched again, reusing stable
            idempotency keys so the provider collapses any duplicates.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleRetry()} disabled={loading}>
            {loading ? "Retrying..." : "Retry Payout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
