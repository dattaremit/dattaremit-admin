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
import { api, type User } from "@/lib/api";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phoneNumberPrefix, setPhoneNumberPrefix] = useState(user.phoneNumberPrefix);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "");
  const [nationality, setNationality] = useState(user.nationality || "");
  const [role, setRole] = useState<"ADMIN" | "USER" | "INFLUENCER" | "PROMOTER">(user.role);
  const [accountStatus, setAccountStatus] = useState(user.accountStatus);
  const [referValue, setReferValue] = useState(user.referValue ?? 1);

  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPhoneNumberPrefix(user.phoneNumberPrefix);
    setPhoneNumber(user.phoneNumber);
    setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "");
    setNationality(user.nationality || "");
    setRole(user.role);
    setAccountStatus(user.accountStatus);
    setReferValue(user.referValue ?? 1);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.updateUser(user.id, {
        firstName,
        lastName,
        email,
        phoneNumberPrefix,
        phoneNumber,
        dateOfBirth,
        nationality: nationality || undefined,
        role,
        accountStatus,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">First Name</Label>
              <Input
                id="edit-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Last Name</Label>
              <Input
                id="edit-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phonePrefix">Prefix</Label>
              <Input
                id="edit-phonePrefix"
                value={phoneNumberPrefix}
                onChange={(e) => setPhoneNumberPrefix(e.target.value)}
                placeholder="+1"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-phoneNumber">Phone Number</Label>
              <Input
                id="edit-phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
            <Input
              id="edit-dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-nationality">Nationality</Label>
            <Input
              id="edit-nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "ADMIN" | "USER" | "INFLUENCER" | "PROMOTER")}>
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
            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select value={accountStatus} onValueChange={(v) => setAccountStatus(v as typeof accountStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INITIAL">Initial</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
