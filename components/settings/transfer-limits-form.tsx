"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, DollarSign, Loader2 } from "lucide-react";
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
import {
  SettingsCard,
  LastUpdated,
} from "@/components/settings/settings-card";

const transferLimitsSchema = z.object({
  weeklyTransferLimit: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid dollar amount")
    .refine((v) => parseFloat(v) >= 100, "Minimum limit is $100")
    .refine((v) => parseFloat(v) <= 25000, "Maximum limit is $25,000"),
});

type TransferLimitsFormValues = z.infer<typeof transferLimitsSchema>;

export function TransferLimitsForm() {
  const {
    value: loadedLimit,
    loading,
    lastUpdated,
    setLastUpdated,
  } = useSettingsKey<string>(
    "WEEKLY_TRANSFER_LIMIT_USD",
    (raw) => raw,
    "10000",
    "Failed to load settings",
  );

  const [savingLimits, setSavingLimits] = useState(false);

  const form = useForm<TransferLimitsFormValues>({
    resolver: zodResolver(transferLimitsSchema),
    defaultValues: { weeklyTransferLimit: "10000" },
  });

  useEffect(() => {
    if (!loading) form.reset({ weeklyTransferLimit: loadedLimit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadedLimit]);

  async function onSubmit(data: TransferLimitsFormValues) {
    setSavingLimits(true);
    try {
      await api.updateSetting("WEEKLY_TRANSFER_LIMIT_USD", data.weeklyTransferLimit);
      setLastUpdated(new Date().toISOString());
      toast.success("Transfer limits saved", {
        description: `Weekly transfer limit set to $${parseFloat(data.weeklyTransferLimit).toLocaleString()}.`,
      });
    } catch {
      toast.error("Failed to save transfer limits");
    } finally {
      setSavingLimits(false);
    }
  }

  return (
    <SettingsCard
      title="Transfer Limits"
      icon={DollarSign}
      description="Configure transfer limits applied to all users"
      loading={loading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="weeklyTransferLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Transfer Limit (USD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10000" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum total amount a user can transfer in a rolling
                  7-day window. Minimum: $100, Maximum: $25,000.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <LastUpdated at={lastUpdated} />

          <Button type="submit" disabled={savingLimits}>
            {savingLimits ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Transfer Limits
          </Button>
        </form>
      </Form>
    </SettingsCard>
  );
}
