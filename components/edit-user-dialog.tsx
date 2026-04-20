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
import { api, type User } from "@/lib/api";
import { UserIdentityFields } from "@/components/users/user-identity-fields";
import { useUserIdentityForm } from "@/hooks/use-user-identity-form";

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

  useEffect(() => {
    reset(userToIdentity(user));
    setReferValue(user.referValue ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.updateUser(user.id, {
        ...values,
        nationality: values.nationality || undefined,
        referValue,
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
              onChange={(e) => setReferValue(parseInt(e.target.value) || 1)}
            />
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
