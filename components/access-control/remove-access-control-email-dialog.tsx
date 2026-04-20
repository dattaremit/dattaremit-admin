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
import { api, type AccessControlEntry } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";

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
  const listLabel = entry.listType === "BLOCKLIST" ? "blocklist" : "allowlist";

  const { loading, run: handleRemove } = useDialogAction(
    () => api.removeAccessControlEmail(entry.id),
    {
      successMessage: `Removed from ${listLabel}`,
      errorMessage: "Failed to remove entry",
      onOpenChange,
      onSuccess,
    },
  );

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
            onClick={() => handleRemove()}
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
