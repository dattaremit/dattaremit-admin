"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Percent, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import { useSettingsKey } from "@/hooks/use-settings-key";
import {
  SettingsCard,
  LastUpdated,
} from "@/components/settings/settings-card";

const multiplierField = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, "Must be a number with up to 4 decimals")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 5, "Must be 5 or lower");

const zynkBpsField = z
  .string()
  .regex(/^\d+$/, "Must be a whole number of basis points")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 1000, "Must be 1000 or lower");

const infraRateField = z
  .string()
  .regex(/^\d+(\.\d{1,6})?$/, "Must be a decimal fraction with up to 6 decimals")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 0.1, "Must be 0.1 or lower");

const developerFeeSchema = z.object({
  small: multiplierField,
  medium: multiplierField,
  high: multiplierField,
  zynkBps: zynkBpsField,
  infraRate: infraRateField,
});

type DeveloperFeeFormValues = z.infer<typeof developerFeeSchema>;

export function DeveloperFeeForm() {
  const enabled = useSettingsKey<boolean>(
    "DEVELOPER_FEE_ENABLED",
    (raw) => raw === "true",
    false,
    "Failed to load developer fee settings",
  );
  const small = useSettingsKey<string>(
    "DEVELOPER_FEE_SMALL_MULTIPLIER",
    (raw) => raw,
    "0.50",
    "Failed to load developer fee settings",
  );
  const medium = useSettingsKey<string>(
    "DEVELOPER_FEE_MEDIUM_MULTIPLIER",
    (raw) => raw,
    "0.75",
    "Failed to load developer fee settings",
  );
  const high = useSettingsKey<string>(
    "DEVELOPER_FEE_HIGH_MULTIPLIER",
    (raw) => raw,
    "1.00",
    "Failed to load developer fee settings",
  );
  const zynkBps = useSettingsKey<string>(
    "DEVELOPER_FEE_ZYNK_BPS",
    (raw) => raw,
    "20",
    "Failed to load developer fee settings",
  );
  const infraRate = useSettingsKey<string>(
    "DEVELOPER_FEE_INFRA_RATE",
    (raw) => raw,
    "0",
    "Failed to load developer fee settings",
  );

  const loading =
    enabled.loading ||
    small.loading ||
    medium.loading ||
    high.loading ||
    zynkBps.loading ||
    infraRate.loading;
  const lastUpdated = [
    enabled.lastUpdated,
    small.lastUpdated,
    medium.lastUpdated,
    high.lastUpdated,
    zynkBps.lastUpdated,
    infraRate.lastUpdated,
  ]
    .filter((t): t is string => Boolean(t))
    .sort()
    .at(-1) ?? null;

  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function onToggle(checked: boolean) {
    setToggling(true);
    const previous = enabled.value;
    enabled.setValue(checked);
    try {
      await api.updateSetting("DEVELOPER_FEE_ENABLED", checked ? "true" : "false");
      enabled.setLastUpdated(new Date().toISOString());
      toast.success(checked ? "Developer fee enabled" : "Developer fee disabled", {
        description: checked
          ? "Transfers will probe-simulate then re-simulate with the per-user multiplier applied."
          : "Transfers hit Zynk simulate once — multipliers stay configured but are not applied.",
      });
    } catch (err) {
      enabled.setValue(previous);
      toast.error(err instanceof Error ? err.message : "Failed to update setting");
    } finally {
      setToggling(false);
    }
  }

  const form = useForm<DeveloperFeeFormValues>({
    resolver: zodResolver(developerFeeSchema),
    defaultValues: { small: "0.50", medium: "0.75", high: "1.00", zynkBps: "20", infraRate: "0" },
  });

  useEffect(() => {
    if (!loading) {
      form.reset({
        small: small.value,
        medium: medium.value,
        high: high.value,
        zynkBps: zynkBps.value,
        infraRate: infraRate.value,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, small.value, medium.value, high.value, zynkBps.value, infraRate.value]);

  async function onSubmit(data: DeveloperFeeFormValues) {
    setSaving(true);
    try {
      // Save sequentially so a partial failure leaves earlier writes intact
      // and the toast points at the actual breakage.
      await api.updateSetting("DEVELOPER_FEE_SMALL_MULTIPLIER", data.small);
      await api.updateSetting("DEVELOPER_FEE_MEDIUM_MULTIPLIER", data.medium);
      await api.updateSetting("DEVELOPER_FEE_HIGH_MULTIPLIER", data.high);
      await api.updateSetting("DEVELOPER_FEE_ZYNK_BPS", data.zynkBps);
      await api.updateSetting("DEVELOPER_FEE_INFRA_RATE", data.infraRate);
      const now = new Date().toISOString();
      small.setLastUpdated(now);
      medium.setLastUpdated(now);
      high.setLastUpdated(now);
      zynkBps.setLastUpdated(now);
      infraRate.setLastUpdated(now);
      toast.success("Developer fee settings saved");
    } catch {
      toast.error("Failed to save developer fee settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="Developer Fee"
      icon={Percent}
      description="Master switch and per-tier multipliers for the FX-margin developer fee. When disabled, transfers hit Zynk simulate once and no fee is charged."
      loading={loading}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="developer-fee-enabled">Developer fee</Label>
            <p className="text-sm text-muted-foreground">
              Off by default. Turn on once an upstream FX-rate endpoint exists
              — until then, charging the fee forces a wasted probe simulate.
            </p>
          </div>
          <Switch
            id="developer-fee-enabled"
            checked={enabled.value}
            disabled={toggling}
            onCheckedChange={onToggle}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="small"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Small Multiplier</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.50"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Applied when the user&apos;s rate flag is SMALL. 0 disables
                    the fee for these users; 1.0 takes the full margin.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medium Multiplier</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.75"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Applied when the user&apos;s rate flag is MEDIUM.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="high"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>High Multiplier</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1.00"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Applied when the user&apos;s rate flag is HIGH (default for
                    new users).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zynkBps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zynk Fee (bps)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="20"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Zynk&apos;s own carve, in basis points (the &ldquo;20&rdquo;).
                    Subtracted from the FX spread as (bps + 1) / 10000.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="infraRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Infra Fee (fraction)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="0"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Infra fee carved out of the spread, as a decimal fraction
                    (e.g. 0.001 = 0.1%). 0 disables it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LastUpdated at={lastUpdated} />

            <Button type="submit" disabled={saving || !enabled.value}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </form>
        </Form>
      </div>
    </SettingsCard>
  );
}
