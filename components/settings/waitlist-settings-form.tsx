"use client";

import { useEffect, useState } from "react";
import { Hourglass, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";

export function WaitlistSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await api.getSettings();
        const setting = response.data.WAITLIST_ENABLED;
        if (setting) {
          setEnabled(setting.value === "true");
          setLastUpdated(setting.updated_at);
        }
      } catch {
        toast.error("Failed to load waitlist setting");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function onToggle(checked: boolean) {
    setSaving(true);
    const previous = enabled;
    setEnabled(checked);
    try {
      await api.updateSetting("WAITLIST_ENABLED", checked ? "true" : "false");
      setLastUpdated(new Date().toISOString());
      toast.success(
        checked ? "Waitlist enabled" : "Waitlist disabled",
        {
          description: checked
            ? "New signups will land on the waitlist screen until you disable this."
            : "All waitlisted users are now released and can continue onboarding.",
        },
      );
    } catch {
      setEnabled(previous);
      toast.error("Failed to update waitlist setting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hourglass className="h-5 w-5" />
          Waitlist
        </CardTitle>
        <CardDescription>
          Gate new signups behind a waitlist screen. Toggling off immediately
          releases everyone currently on the waitlist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="waitlist-enabled">Waitlist mode</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, users who complete signup see the waitlist
                  screen instead of onboarding.
                </p>
              </div>
              <Switch
                id="waitlist-enabled"
                checked={enabled}
                disabled={saving}
                onCheckedChange={onToggle}
              />
            </div>

            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
