"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { useSettingsKey } from "@/hooks/use-settings-key";
import {
  SettingsCard,
  LastUpdated,
} from "@/components/settings/settings-card";

export function RecipientKycSettingsForm() {
  const {
    value: enabled,
    setValue: setEnabled,
    loading,
    lastUpdated,
    setLastUpdated,
  } = useSettingsKey<boolean>(
    "RECIPIENT_KYC_ENABLED",
    (raw) => raw === "true",
    true,
    "Failed to load recipient KYC setting",
  );

  const [saving, setSaving] = useState(false);

  async function onToggle(checked: boolean) {
    setSaving(true);
    const previous = enabled;
    setEnabled(checked);
    try {
      await api.setRecipientKycEnabled(checked);
      setLastUpdated(new Date().toISOString());
      toast.success(
        checked ? "Recipient KYC enabled" : "Recipient KYC disabled",
        {
          description: checked
            ? "New recipients must complete KYC before a bank account can be added."
            : "New recipients skip KYC — a bank account can be added right away.",
        },
      );
    } catch (err) {
      setEnabled(previous);
      toast.error(
        err instanceof Error ? err.message : "Failed to update setting",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="Recipient KYC"
      icon={ShieldCheck}
      description="When enabled, a new recipient must complete KYC before a bank account can be added. When disabled, recipients skip KYC and a bank account can be added immediately. This only affects recipients created after the change."
      loading={loading}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="recipient-kyc-enabled">Require recipient KYC</Label>
            <p className="text-sm text-muted-foreground">
              Gate adding a recipient&apos;s bank account behind KYC approval.
            </p>
          </div>
          <Switch
            id="recipient-kyc-enabled"
            checked={enabled}
            disabled={saving}
            onCheckedChange={onToggle}
          />
        </div>

        <LastUpdated at={lastUpdated} />
      </div>
    </SettingsCard>
  );
}
