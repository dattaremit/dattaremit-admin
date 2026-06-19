"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type RateFlag, type User } from "@/lib/api";
import { UserIdentityFields } from "@/components/users/user-identity-fields";
import { useUserIdentityForm } from "@/hooks/use-user-identity-form";
import {
  userIdentitySchema,
  referValueSchema,
} from "@/schemas/user-identity.schema";

const RATE_FLAG_OPTIONS: { value: RateFlag; label: string; hint: string }[] = [
  { value: "ZERO", label: "Zero", hint: "No developer fee taken" },
  { value: "SMALL", label: "Small", hint: "Smallest share of the developer fee" },
  { value: "MEDIUM", label: "Medium", hint: "Mid share of the developer fee" },
  { value: "HIGH", label: "High", hint: "Largest share of the developer fee (default)" },
];

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function userToIdentity(user: User) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumberPrefix: user.phoneNumberPrefix,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    nationality: user.nationality || "",
  };
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const { values, setValue, reset } = useUserIdentityForm(userToIdentity(user));
  const [referValue, setReferValue] = useState(user.referValue ?? 1);
  const [rateFlag, setRateFlag] = useState<RateFlag>(user.rateFlag ?? "HIGH");

  useEffect(() => {
    reset(userToIdentity(user));
    setReferValue(user.referValue ?? 1);
    setRateFlag(user.rateFlag ?? "HIGH");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = userIdentitySchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    const parsedRefer = referValueSchema.safeParse(referValue);
    if (!parsedRefer.success) {
      toast.error(parsedRefer.error.issues[0]?.message ?? "Invalid refer value");
      return;
    }

    setLoading(true);

    try {
      await api.updateUser(user.id, {
        ...parsed.data,
        nationality: parsed.data.nationality || undefined,
        referValue: parsedRefer.data,
        rateFlag,
      });

      toast.success("User updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update details for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <UserIdentityFields values={values} onChange={setValue} idPrefix="edit" />

          <div className="space-y-2">
            <Label htmlFor="edit-referValue">Refer Value</Label>
            <Input
              id="edit-referValue"
              type="number"
              min={1}
              value={referValue}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setReferValue(Number.isFinite(n) && n >= 1 ? n : 1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rateFlag">Rate Flag</Label>
            <Select value={rateFlag} onValueChange={(v) => setRateFlag(v as RateFlag)}>
              <SelectTrigger id="edit-rateFlag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_FLAG_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label} — {opt.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Internal fee tier — scales the developer fee charged on this
              user&apos;s transfers (via the per-tier multiplier). Never shown to
              the user.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
