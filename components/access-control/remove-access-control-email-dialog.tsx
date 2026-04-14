"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, type AccessControlEntry } from "@/lib/api";

interface RemoveAccessControlEmailDialogProps {
  entry: AccessControlEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RemoveAccessControlEmailDialog({
  entry,
  open,
  onOpenChange,
  onSuccess,
}: RemoveAccessControlEmailDialogProps) {
  const [loading, setLoading] = useState(false);
  const listLabel = entry.listType === "BLOCKLIST" ? "blocklist" : "allowlist";

  async function handleRemove() {
    setLoading(true);
    try {
      await api.removeAccessControlEmail(entry.id);
      toast.success(`Removed from ${listLabel}`);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove entry",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove from {listLabel}</DialogTitle>
          <DialogDescription>
            Remove <strong>{entry.email}</strong> from the {listLabel}?
            {entry.listType === "BLOCKLIST"
              ? " They will no longer be blocked from signing up."
              : " They will no longer be allowed through while allowlist mode is active."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
