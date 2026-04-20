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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type User } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";

type Role = "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER";

interface ChangeRoleDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ChangeRoleDialog({ user, open, onOpenChange, onSuccess }: ChangeRoleDialogProps) {
  const [role, setRole] = useState<Role>(user.role);

  const { loading, run } = useDialogAction(
    (nextRole: Role) => api.changeUserRole(user.id, nextRole),
    {
      successMessage: "User role updated successfully",
      errorMessage: "Failed to change role",
      onOpenChange,
      onSuccess,
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await run(role);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.firstName} {user.lastName}.
            Current role: <strong>{user.role}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="INFLUENCER">Influencer</SelectItem>
                <SelectItem value="PROMOTER">Promoter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
