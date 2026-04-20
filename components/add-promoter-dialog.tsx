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
import { UserIdentityFields } from "@/components/users/user-identity-fields";
import { useUserIdentityForm } from "@/hooks/use-user-identity-form";

interface AddPromoterDialogProps {
  onSuccess: () => void;
}

export function AddPromoterDialog({ onSuccess }: AddPromoterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { values, setValue, reset } = useUserIdentityForm();
  const [role, setRole] = useState<"INFLUENCER" | "PROMOTER">("PROMOTER");
  const [referValue, setReferValue] = useState(1);

  const [referCodePreview, setReferCodePreview] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { firstName, lastName } = values;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createPromoter({
        ...values,
        nationality: values.nationality || undefined,
        role,
        referValue,
      });

      toast.success("Promoter created successfully");
      reset();
      setRole("PROMOTER");
      setReferValue(1);
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
          <UserIdentityFields values={values} onChange={setValue} idPrefix="promo" />

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
