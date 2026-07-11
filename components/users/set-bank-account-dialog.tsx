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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type UsdBankAccount, type User } from "@/lib/api";
import { useDialogAction } from "@/hooks/use-dialog-action";

interface SetBankAccountDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Flat field map — the nested UsdBankAccount is assembled on submit.
type FormState = {
  holderName: string;
  bankName: string;
  bankCountry: string;
  bic: string;
  abaRoutingNumber: string;
  accountNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  addressCountry: string;
};

function initialState(user: User): FormState {
  const existing = user.usdBankAccount;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return {
    holderName: existing?.accountHolder.name ?? fullName,
    bankName: existing?.bank.name ?? "",
    bankCountry: existing?.bank.country ?? "United States of America",
    bic: existing?.bank.bic ?? "",
    abaRoutingNumber: existing?.bank.abaRoutingNumber ?? "",
    accountNumber: existing?.account.accountNumber ?? "",
    addressLine1: existing?.address.line1 ?? "",
    city: existing?.address.city ?? "",
    state: existing?.address.state ?? "",
    postalCode: existing?.address.postalCode ?? "",
    addressCountry: existing?.address.country ?? "United States of America",
  };
}

export function SetBankAccountDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: SetBankAccountDialogProps) {
  const [form, setForm] = useState<FormState>(() => initialState(user));
  const [error, setError] = useState<string | null>(null);

  const { loading, run } = useDialogAction(
    (payload: UsdBankAccount) => api.setUsdBankAccount(user.id, payload),
    {
      successMessage: "Bank account assigned successfully",
      errorMessage: "Failed to assign bank account",
      onOpenChange,
      onSuccess,
    },
  );

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()]),
    ) as FormState;

    if (Object.values(trimmed).some((v) => v === "")) {
      setError("All fields are required.");
      return;
    }
    if (!/^\d{9}$/.test(trimmed.abaRoutingNumber)) {
      setError("ABA routing number must be 9 digits.");
      return;
    }
    if (!/^\d{4,20}$/.test(trimmed.accountNumber)) {
      setError("Account number must be 4-20 digits.");
      return;
    }
    setError(null);

    await run({
      accountHolder: { name: trimmed.holderName },
      bank: {
        name: trimmed.bankName,
        country: trimmed.bankCountry,
        bic: trimmed.bic,
        abaRoutingNumber: trimmed.abaRoutingNumber,
      },
      account: { accountNumber: trimmed.accountNumber },
      address: {
        line1: trimmed.addressLine1,
        city: trimmed.city,
        state: trimmed.state,
        postalCode: trimmed.postalCode,
        country: trimmed.addressCountry,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {user.usdBankAccount ? "Update Bank Account" : "Assign Bank Account"}
          </DialogTitle>
          <DialogDescription>
            Assign the USD receiving bank account for {user.firstName} {user.lastName}.
            This is shown to the user on their balance page. Assign a bank account
            before crediting a balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Account Holder</p>
            <div className="space-y-2">
              <Label htmlFor="bank-holder-name">Name</Label>
              <Input
                id="bank-holder-name"
                value={form.holderName}
                onChange={set("holderName")}
                placeholder="Venkat Ram Reddy Kottha"
                autoFocus
              />
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Bank</p>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank name</Label>
              <Input
                id="bank-name"
                value={form.bankName}
                onChange={set("bankName")}
                placeholder="Slovak Savings Bank"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-country">Bank country</Label>
                <Input
                  id="bank-country"
                  value={form.bankCountry}
                  onChange={set("bankCountry")}
                  placeholder="United States of America"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-bic">BIC / SWIFT</Label>
                <Input
                  id="bank-bic"
                  value={form.bic}
                  onChange={set("bic")}
                  placeholder="SSBAUS32"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-aba">ABA routing number</Label>
                <Input
                  id="bank-aba"
                  inputMode="numeric"
                  value={form.abaRoutingNumber}
                  onChange={set("abaRoutingNumber")}
                  placeholder="043087080"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account-number">Account number</Label>
                <Input
                  id="bank-account-number"
                  inputMode="numeric"
                  value={form.accountNumber}
                  onChange={set("accountNumber")}
                  placeholder="516589907899"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Bank Address</p>
            <div className="space-y-2">
              <Label htmlFor="bank-address-line1">Address line 1</Label>
              <Input
                id="bank-address-line1"
                value={form.addressLine1}
                onChange={set("addressLine1")}
                placeholder="8700 Perry Highway"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-city">City</Label>
                <Input
                  id="bank-city"
                  value={form.city}
                  onChange={set("city")}
                  placeholder="Pittsburgh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-state">State</Label>
                <Input
                  id="bank-state"
                  value={form.state}
                  onChange={set("state")}
                  placeholder="PA"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank-postal">Postal code</Label>
                <Input
                  id="bank-postal"
                  value={form.postalCode}
                  onChange={set("postalCode")}
                  placeholder="15237"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-address-country">Country</Label>
                <Input
                  id="bank-address-country"
                  value={form.addressCountry}
                  onChange={set("addressCountry")}
                  placeholder="United States of America"
                />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Bank Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
