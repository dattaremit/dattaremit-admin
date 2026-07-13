"use client";

import { useState } from "react";
import { Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { useSettingsKey } from "@/hooks/use-settings-key";
import { SettingsCard, LastUpdated } from "@/components/settings/settings-card";

export function MaintenanceSettingsForm() {
  const {
    value: enabled,
    setValue: setEnabled,
    loading,
    lastUpdated,
    setLastUpdated,
  } = useSettingsKey<boolean>(
    "MAINTENANCE_MODE_ENABLED",
    (raw) => raw === "true",
    false,
    "Failed to load maintenance mode setting",
  );

  const [saving, setSaving] = useState(false);

  async function onToggle(checked: boolean) {
    setSaving(true);
    const previous = enabled;
    setEnabled(checked);
    try {
      await api.setMaintenanceModeEnabled(checked);
      setLastUpdated(new Date().toISOString());
      toast.success(
        checked ? "Maintenance mode enabled" : "Maintenance mode disabled",
        {
          description: checked
            ? "The customer web app now shows the maintenance page to everyone."
            : "The customer web app is back online for everyone.",
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
      title="Maintenance Mode"
      icon={Wrench}
      description="When enabled, every visitor to the customer web app is shown a maintenance page instead of the app. Use this while deploying or performing scheduled maintenance. The site returns automatically for users the moment you turn this off — no redeploy needed."
      loading={loading}
    >
      <div className="space-y-4">
        {enabled ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Maintenance mode is active</AlertTitle>
            <AlertDescription>
              Customers cannot access the web app right now — they see the
              maintenance page. Turn this off to bring the site back online.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Site is live</AlertTitle>
            <AlertDescription>
              The customer web app is online and serving traffic normally.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="maintenance-mode-enabled">
              Enable maintenance mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Gate the entire customer web app behind the maintenance page.
            </p>
          </div>
          <Switch
            id="maintenance-mode-enabled"
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
