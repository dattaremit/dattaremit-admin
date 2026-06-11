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

// Tier multipliers are fractions of the base fee (0.3 = 30% of base). Backend
// caps them at 1 (RATE_FLAG_MULTIPLIER_MAX).
const multiplierField = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, "Must be a number with up to 4 decimals")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 1, "Must be 1 or lower");

// Zynk fee component, whole basis points. Backend caps at 1000 (10%).
const zynkBpsField = z
  .string()
  .regex(/^\d+$/, "Must be a whole number of basis points")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 1000, "Must be 1000 or lower");

// Flat banking fee in USD. Backend caps at 50 (BANKING_FEE_USD_MAX).
const bankingFeeField = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a USD amount with up to 2 decimals")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 50, "Must be 50 or lower");

const developerFeeSchema = z.object({
  small: multiplierField,
  medium: multiplierField,
  high: multiplierField,
  zynkBps: zynkBpsField,
  nreBps: zynkBpsField,
  bankingFeeUsd: bankingFeeField,
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
    "RATE_FLAG_MULTIPLIER_SMALL",
    (raw) => raw,
    "0.3",
    "Failed to load developer fee settings",
  );
  const medium = useSettingsKey<string>(
    "RATE_FLAG_MULTIPLIER_MEDIUM",
    (raw) => raw,
    "0.6",
    "Failed to load developer fee settings",
  );
  const high = useSettingsKey<string>(
    "RATE_FLAG_MULTIPLIER_HIGH",
    (raw) => raw,
    "0.85",
    "Failed to load developer fee settings",
  );
  const zynkBps = useSettingsKey<string>(
    "ZYNK_FEE_BPS",
    (raw) => raw,
    "20",
    "Failed to load developer fee settings",
  );
  const nreBps = useSettingsKey<string>(
    "NRE_FEE_BPS",
    (raw) => raw,
    "10",
    "Failed to load developer fee settings",
  );
  const bankingFeeUsd = useSettingsKey<string>(
    "BANKING_FEE_USD",
    (raw) => raw,
    "1",
    "Failed to load developer fee settings",
  );

  const loading =
    enabled.loading ||
    small.loading ||
    medium.loading ||
    high.loading ||
    zynkBps.loading ||
    nreBps.loading ||
    bankingFeeUsd.loading;
  const lastUpdated = [
    enabled.lastUpdated,
    small.lastUpdated,
    medium.lastUpdated,
    high.lastUpdated,
    zynkBps.lastUpdated,
    nreBps.lastUpdated,
    bankingFeeUsd.lastUpdated,
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
          ? "Every transfer is charged the configured fee, scaled by the user's tier, when the selected provider's rate beats the live market rate."
          : "No developer fee is charged — multipliers and components stay configured but unused.",
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
    defaultValues: {
      small: "0.3",
      medium: "0.6",
      high: "0.85",
      zynkBps: "20",
      nreBps: "10",
      bankingFeeUsd: "1",
    },
  });

  useEffect(() => {
    if (!loading) {
      form.reset({
        small: small.value,
        medium: medium.value,
        high: high.value,
        zynkBps: zynkBps.value,
        nreBps: nreBps.value,
        bankingFeeUsd: bankingFeeUsd.value,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, small.value, medium.value, high.value, zynkBps.value, nreBps.value, bankingFeeUsd.value]);

  async function onSubmit(data: DeveloperFeeFormValues) {
    setSaving(true);
    try {
      // Save sequentially so a partial failure leaves earlier writes intact
      // and the toast points at the actual breakage.
      await api.updateSetting("RATE_FLAG_MULTIPLIER_SMALL", data.small);
      await api.updateSetting("RATE_FLAG_MULTIPLIER_MEDIUM", data.medium);
      await api.updateSetting("RATE_FLAG_MULTIPLIER_HIGH", data.high);
      await api.updateSetting("ZYNK_FEE_BPS", data.zynkBps);
      await api.updateSetting("NRE_FEE_BPS", data.nreBps);
      await api.updateSetting("BANKING_FEE_USD", data.bankingFeeUsd);
      const now = new Date().toISOString();
      small.setLastUpdated(now);
      medium.setLastUpdated(now);
      high.setLastUpdated(now);
      zynkBps.setLastUpdated(now);
      nreBps.setLastUpdated(now);
      bankingFeeUsd.setLastUpdated(now);
      toast.success("Developer fee settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save developer fee settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="Developer Fee"
      icon={Percent}
      description="Master switch, fee components, and per-tier multipliers for the developer fee. The fee is (amount × Zynk bps ÷ 10000 + flat banking fee) ÷ amount, scaled by the user's rate-flag tier — charged only when the selected payout provider's rate beats the live market rate. When disabled, no fee is charged."
      loading={loading}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="developer-fee-enabled">Developer fee</Label>
            <p className="text-sm text-muted-foreground">
              Off by default. When on, every transfer is charged the configured
              fee (scaled by the user&apos;s tier), provided the selected
              provider&apos;s rate beats the live market rate.
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
                    Zynk fee component, in basis points (20 = 0.20%). Part of the
                    base fee: amount × bps / 10000.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nreBps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NRE Fee (bps)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="10"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Extra DattaRemit fee component, in basis points (10 = 0.10%),
                    added to the developer fee <strong>only</strong> when a user
                    sends to their own NRE bank account. 0 disables it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankingFeeUsd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banking Fee (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Flat banking fee in USD added to the base fee on every charged
                    transfer (e.g. $1). 0 disables it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="0.3"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Applied when the user&apos;s rate flag is SMALL. 0 disables
                    the fee for these users; 1.0 charges the full base fee.
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
                      placeholder="0.6"
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
                      placeholder="0.85"
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
