"use client";

import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

interface AddPromoterDialogProps {
  onSuccess: () => void;
}

export function AddPromoterDialog({ onSuccess }: AddPromoterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumberPrefix, setPhoneNumberPrefix] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [role, setRole] = useState<"INFLUENCER" | "PROMOTER">("PROMOTER");
  const [referValue, setReferValue] = useState(1);

  const [referCodePreview, setReferCodePreview] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!firstName.trim() || !lastName.trim()) {
      setReferCodePreview("");
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.previewReferCode(firstName.trim(), lastName.trim());
        setReferCodePreview(res.data.referCode);
      } catch {
        const cleanFirst = firstName.trim().toUpperCase();
        const lastInitial = lastName.trim().charAt(0).toUpperCase();
        setReferCodePreview(`DATTA-${cleanFirst}${lastInitial}`);
      }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [firstName, lastName]);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumberPrefix("+1");
    setPhoneNumber("");
    setDateOfBirth("");
    setNationality("");
    setRole("PROMOTER");
    setReferValue(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createPromoter({
        firstName,
        lastName,
        email,
        phoneNumberPrefix,
        phoneNumber,
        dateOfBirth,
        nationality: nationality || undefined,
        role,
        referValue,
      });

      toast.success("Promoter created successfully");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create promoter"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Promoter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Promoter / Influencer</DialogTitle>
          <DialogDescription>
            Create a new influencer or promoter with a custom referral code and
            referral value.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-firstName">First Name</Label>
              <Input
                id="promo-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-lastName">Last Name</Label>
              <Input
                id="promo-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {referCodePreview && (
            <div className="rounded-md border bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Referral Code Preview
              </p>
              <p className="font-mono text-sm font-medium">
                {referCodePreview}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="promo-email">Email</Label>
            <Input
              id="promo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-phonePrefix">Prefix</Label>
              <Input
                id="promo-phonePrefix"
                value={phoneNumberPrefix}
                onChange={(e) => setPhoneNumberPrefix(e.target.value)}
                placeholder="+1"
                required
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="promo-phoneNumber">Phone Number</Label>
              <Input
                id="promo-phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-dateOfBirth">Date of Birth</Label>
            <Input
              id="promo-dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-nationality">Nationality</Label>
            <Input
              id="promo-nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) =>
                  setRole(v as "INFLUENCER" | "PROMOTER")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROMOTER">Promoter</SelectItem>
                  <SelectItem value="INFLUENCER">Influencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-referValue">Refer Value</Label>
              <Input
                id="promo-referValue"
                type="number"
                min={1}
                value={referValue}
                onChange={(e) => setReferValue(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Promoter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
