"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SettingsCard, LastUpdated } from "@/components/settings/settings-card";

const MAX_RATE = 0.05;

const nreFeeSchema = z.object({
  // Stored as a fraction of the payout: 0.003 = 0.3%. Up to 6 decimals.
  nreFeeRate: z
    .string()
    .regex(/^\d+(\.\d{1,6})?$/, "Must be a fraction like 0.003")
    .refine((v) => parseFloat(v) >= 0, "Cannot be negative")
    .refine((v) => parseFloat(v) <= MAX_RATE, `Maximum is ${MAX_RATE} (5%)`),
});

type NreFeeFormValues = z.infer<typeof nreFeeSchema>;

function asPercent(raw: string): string {
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return "—";
  // Trim trailing zeros for a clean "0.3%" style label.
  return `${parseFloat((n * 100).toFixed(4))}%`;
}

export function NreSelfTransferFeeForm() {
  const {
    value: loadedRate,
    loading,
    lastUpdated,
    setLastUpdated,
  } = useSettingsKey<string>(
    "NRE_SELF_TRANSFER_FEE_RATE",
    (raw) => raw,
    "0.003",
    "Failed to load settings",
  );

  const [saving, setSaving] = useState(false);

  const form = useForm<NreFeeFormValues>({
    resolver: zodResolver(nreFeeSchema),
    defaultValues: { nreFeeRate: "0.003" },
  });

  useEffect(() => {
    if (!loading) form.reset({ nreFeeRate: loadedRate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadedRate]);

  const currentRate = form.watch("nreFeeRate");

  async function onSubmit(data: NreFeeFormValues) {
    setSaving(true);
    try {
      await api.updateSetting("NRE_SELF_TRANSFER_FEE_RATE", data.nreFeeRate);
      setLastUpdated(new Date().toISOString());
      toast.success("NRE self-transfer fee saved", {
        description: `Fee set to ${asPercent(data.nreFeeRate)}.`,
      });
    } catch {
      toast.error("Failed to save NRE self-transfer fee");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="NRE Self-Transfer Fee"
      icon={Landmark}
      description="Fee charged when a user transfers to their own NRE account"
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nreFeeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee Rate (fraction of payout)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.003"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Entered as a fraction: <code>0.003</code> ={" "}
                  {asPercent("0.003")}. Currently{" "}
                  <strong>{asPercent(currentRate)}</strong>. Set to{" "}
                  <code>0</code> to disable. Maximum: {MAX_RATE} (5%).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <LastUpdated at={lastUpdated} />

          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save NRE Fee
          </Button>
        </form>
      </Form>
    </SettingsCard>
  );
}
