"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Gift, Loader2 } from "lucide-react";
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

// Minimum qualifying transfer, in USD. Backend accepts 0.01–25000.
const minTransferField = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a USD amount with up to 2 decimals")
  .refine((v) => parseFloat(v) >= 0.01, "Must be at least 0.01")
  .refine((v) => parseFloat(v) <= 25000, "Must be 25000 or lower");

// Bonus amount paid to a beneficiary, in USD. Backend accepts 0–1000.
const bonusAmountField = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a USD amount with up to 2 decimals")
  .refine((v) => parseFloat(v) >= 0, "Must be 0 or greater")
  .refine((v) => parseFloat(v) <= 1000, "Must be 1000 or lower");

const referralBonusSchema = z.object({
  minTransfer: minTransferField,
  referrerBonus: bonusAmountField,
  refereeBonus: bonusAmountField,
});

type ReferralBonusFormValues = z.infer<typeof referralBonusSchema>;

export function ReferralBonusForm() {
  const enabled = useSettingsKey<boolean>(
    "REFERRAL_BONUS_ENABLED",
    (raw) => raw === "true",
    false,
    "Failed to load referral bonus settings",
  );
  const minTransfer = useSettingsKey<string>(
    "REFERRAL_BONUS_MIN_TRANSFER_USD",
    (raw) => raw,
    "1000",
    "Failed to load referral bonus settings",
  );
  const referrerBonus = useSettingsKey<string>(
    "REFERRAL_REFERRER_BONUS_USD",
    (raw) => raw,
    "10",
    "Failed to load referral bonus settings",
  );
  const refereeBonus = useSettingsKey<string>(
    "REFERRAL_REFEREE_BONUS_USD",
    (raw) => raw,
    "20",
    "Failed to load referral bonus settings",
  );

  const loading =
    enabled.loading ||
    minTransfer.loading ||
    referrerBonus.loading ||
    refereeBonus.loading;
  const lastUpdated = [
    enabled.lastUpdated,
    minTransfer.lastUpdated,
    referrerBonus.lastUpdated,
    refereeBonus.lastUpdated,
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
      await api.updateSetting(
        "REFERRAL_BONUS_ENABLED",
        checked ? "true" : "false",
      );
      enabled.setLastUpdated(new Date().toISOString());
      toast.success(
        checked ? "Referral bonuses enabled" : "Referral bonuses disabled",
        {
          description: checked
            ? "Qualifying transfers now record referrer and referee bonuses for payout."
            : "No new bonuses are recorded — amounts stay configured but unused.",
        },
      );
    } catch (err) {
      enabled.setValue(previous);
      toast.error(
        err instanceof Error ? err.message : "Failed to update setting",
      );
    } finally {
      setToggling(false);
    }
  }

  const form = useForm<ReferralBonusFormValues>({
    resolver: zodResolver(referralBonusSchema),
    defaultValues: {
      minTransfer: "1000",
      referrerBonus: "10",
      refereeBonus: "20",
    },
  });

  useEffect(() => {
    if (!loading) {
      form.reset({
        minTransfer: minTransfer.value,
        referrerBonus: referrerBonus.value,
        refereeBonus: refereeBonus.value,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, minTransfer.value, referrerBonus.value, refereeBonus.value]);

  async function onSubmit(data: ReferralBonusFormValues) {
    setSaving(true);
    try {
      // Save sequentially so a partial failure leaves earlier writes intact
      // and the toast points at the actual breakage.
      await api.updateSetting(
        "REFERRAL_BONUS_MIN_TRANSFER_USD",
        data.minTransfer,
      );
      await api.updateSetting("REFERRAL_REFERRER_BONUS_USD", data.referrerBonus);
      await api.updateSetting("REFERRAL_REFEREE_BONUS_USD", data.refereeBonus);
      const now = new Date().toISOString();
      minTransfer.setLastUpdated(now);
      referrerBonus.setLastUpdated(now);
      refereeBonus.setLastUpdated(now);
      toast.success("Referral bonus settings saved");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to save referral bonus settings",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="Referral Bonus"
      icon={Gift}
      description="Master switch and bonus amounts for the referral program. When enabled, a referred user's first qualifying transfer (at or above the minimum) records a USD bonus for both the referrer and the referee, paid out on the referee's next completed transfer. When disabled, no new bonuses are recorded."
      loading={loading}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="referral-bonus-enabled">Referral bonuses</Label>
            <p className="text-sm text-muted-foreground">
              Off by default. When on, qualifying transfers record referrer and
              referee bonuses for payout.
            </p>
          </div>
          <Switch
            id="referral-bonus-enabled"
            checked={enabled.value}
            disabled={toggling}
            onCheckedChange={onToggle}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="minTransfer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Qualifying Transfer (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1000"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A referred user&apos;s transfer must be at least this USD
                    amount to earn bonuses. Accepts 0.01–25000.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referrerBonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referrer Bonus (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="10"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paid to the person who referred the user. 0 disables it.
                    Accepts 0–1000.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refereeBonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referee Bonus (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="20"
                      disabled={!enabled.value}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paid to the referred user themselves. 0 disables it. Accepts
                    0–1000.
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
