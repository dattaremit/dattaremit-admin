"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Hourglass, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function AccessControlSettingsForm() {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hourglass className="h-5 w-5" />
          Waitlist
        </CardTitle>
        <CardDescription>
          When enabled, new signups see the waitlist screen. Emails on the
          allowlist bypass the waitlist. Emails on the blocklist are always
          blocked, even when the waitlist is off.
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
