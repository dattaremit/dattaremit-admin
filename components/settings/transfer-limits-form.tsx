"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const transferLimitsSchema = z.object({
  weeklyTransferLimit: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid dollar amount")
    .refine((v) => parseFloat(v) >= 100, "Minimum limit is $100")
    .refine((v) => parseFloat(v) <= 1000000, "Maximum limit is $1,000,000"),
});

type TransferLimitsFormValues = z.infer<typeof transferLimitsSchema>;

export function TransferLimitsForm() {
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingLimits, setSavingLimits] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const form = useForm<TransferLimitsFormValues>({
    resolver: zodResolver(transferLimitsSchema),
    defaultValues: {
      weeklyTransferLimit: "10000",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await api.getSettings();
        const settings = response.data;
        if (settings.WEEKLY_TRANSFER_LIMIT_USD) {
          form.reset({
            weeklyTransferLimit: settings.WEEKLY_TRANSFER_LIMIT_USD.value,
          });
          setLastUpdated(settings.WEEKLY_TRANSFER_LIMIT_USD.updated_at);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, [form]);

  async function onSubmit(data: TransferLimitsFormValues) {
    setSavingLimits(true);
    try {
      await api.updateSetting(
        "WEEKLY_TRANSFER_LIMIT_USD",
        data.weeklyTransferLimit,
      );
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Transfer Limits
        </CardTitle>
        <CardDescription>
          Configure transfer limits applied to all users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingSettings ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="weeklyTransferLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Transfer Limit (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum total amount a user can transfer in a rolling
                      7-day window. Minimum: $100, Maximum: $1,000,000.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated:{" "}
                  {new Date(lastUpdated).toLocaleString()}
                </p>
              )}

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
        )}
      </CardContent>
    </Card>
  );
}
