"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type User } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";

interface SetBalanceDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

export function SetBalanceDialog({ user, open, onOpenChange, onSuccess }: SetBalanceDialogProps) {
  const currentBalance = Number(user.balance ?? 0);
  const [amount, setAmount] = useState(currentBalance.toFixed(2));
  const [error, setError] = useState<string | null>(null);

  const { loading, run } = useDialogAction(
    (value: number) => api.setUserBalance(user.id, value),
    {
      successMessage: "User balance updated successfully",
      errorMessage: "Failed to update balance",
      onOpenChange,
      onSuccess,
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = amount.trim();
    if (!AMOUNT_REGEX.test(trimmed)) {
      setError("Enter a valid USD amount (up to 2 decimal places).");
      return;
    }
    setError(null);
    await run(Number(trimmed));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Balance</DialogTitle>
          <DialogDescription>
            Set the prepaid balance for {user.firstName} {user.lastName}. This
            replaces the current balance of{" "}
            <strong>${currentBalance.toFixed(2)}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance-amount">Balance (USD)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="balance-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Balance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
