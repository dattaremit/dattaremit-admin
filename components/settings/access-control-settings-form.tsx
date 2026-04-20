"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSettingsKey } from "@/hooks/use-settings-key";
import {
  SettingsCard,
  LastUpdated,
} from "@/components/settings/settings-card";

export function AccessControlSettingsForm() {
  const {
    value: enabled,
    setValue: setEnabled,
    loading,
    lastUpdated,
    setLastUpdated,
  } = useSettingsKey<boolean>(
    "WAITLIST_ENABLED",
    (raw) => raw === "true",
    false,
    "Failed to load waitlist setting",
  );

  const [saving, setSaving] = useState(false);

  async function onToggle(checked: boolean) {
    setSaving(true);
    const previous = enabled;
    setEnabled(checked);
    try {
      await api.setWaitlistEnabled(checked);
      setLastUpdated(new Date().toISOString());
      toast.success(checked ? "Waitlist enabled" : "Waitlist disabled", {
        description: checked
          ? "New signups are gated behind the waitlist. Add emails to the allowlist to let specific people through."
          : "All signups pass — except emails on the blocklist.",
      });
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
      title="Waitlist"
      icon={Hourglass}
      description="When enabled, new signups see the waitlist screen. Emails on the allowlist bypass the waitlist. Emails on the blocklist are always blocked, even when the waitlist is off."
      loading={loading}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="waitlist-enabled">Waitlist mode</Label>
            <p className="text-sm text-muted-foreground">
              Gate new signups behind the waitlist screen.
            </p>
          </div>
          <Switch
            id="waitlist-enabled"
            checked={enabled}
            disabled={saving}
            onCheckedChange={onToggle}
          />
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/access-control">
            Manage blocklist & allowlist
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>

        <LastUpdated at={lastUpdated} />
      </div>
    </SettingsCard>
  );
}
