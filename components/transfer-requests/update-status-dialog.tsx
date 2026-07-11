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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type TransferRequest } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";
import { formatAmount } from "@/lib/utils";

interface UpdateStatusDialogProps {
  request: TransferRequest;
  status: "COMPLETED" | "REJECTED";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UpdateStatusDialog({
  request,
  status,
  open,
  onOpenChange,
  onSuccess,
}: UpdateStatusDialogProps) {
  const [note, setNote] = useState("");
  const isReject = status === "REJECTED";

  const { loading, run } = useDialogAction(
    () => api.updateTransferRequestStatus(request.id, status, note.trim() || undefined),
    {
      successMessage: isReject
        ? "Request rejected — balance refunded to the user"
        : "Request marked as completed",
      errorMessage: "Failed to update transfer request",
      onOpenChange,
      onSuccess,
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReject ? "Reject transfer request" : "Mark as completed"}</DialogTitle>
          <DialogDescription>
            {request.userName ?? "User"} · {formatAmount(request.amountUsd, "USD")} →{" "}
            {formatAmount(request.endAmountInr, "INR")}
            <br />
            <span className="text-foreground">{request.destinationLabel}</span>
            {isReject && (
              <>
                <br />
                The {formatAmount(request.amountUsd, "USD")} will be refunded to the user&apos;s
                balance.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-note">Note (optional)</Label>
            <Textarea
              id="status-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isReject ? "Reason for rejection…" : "Payment reference…"}
              maxLength={280}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={isReject ? "destructive" : "default"} disabled={loading}>
              {loading
                ? "Saving..."
                : isReject
                  ? "Reject & refund"
                  : "Mark completed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
