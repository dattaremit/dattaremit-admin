"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, type AccessListType } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";

interface AddAccessControlEmailDialogProps {
  listType: AccessListType;
  onSuccess: () => void;
}

export function AddAccessControlEmailDialog({
  listType,
  onSuccess,
}: AddAccessControlEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  const listLabel = listType === "BLOCKLIST" ? "blocklist" : "allowlist";

  function resetForm() {
    setEmail("");
    setReason("");
  }

  const { loading, run } = useDialogAction(
    () =>
      api.addAccessControlEmail({
        email: email.trim(),
        listType,
        reason: reason.trim() || undefined,
      }),
    {
      successMessage: `Added to ${listLabel}`,
      errorMessage: `Failed to add to ${listLabel}`,
      onOpenChange: (next) => {
        setOpen(next);
        if (!next) resetForm();
      },
      onSuccess,
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to {listLabel}</DialogTitle>
          <DialogDescription>
            {listType === "BLOCKLIST"
              ? "Blocked users will see the waitlist screen and cannot complete onboarding while blocklist mode is active."
              : "Only emails on the allowlist can complete onboarding while allowlist mode is active."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-email">Email</Label>
            <Input
              id="access-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="access-reason">Reason (optional)</Label>
            <Textarea
              id="access-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Internal note — why this email is on the list"
              rows={3}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : `Add to ${listLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
