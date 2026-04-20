"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Bell } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  kycAlerts: z.boolean(),
  newUserAlerts: z.boolean(),
  alertEmail: z.string().email("Must be a valid email").or(z.literal("")),
  alertWebhookUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export function NotificationSettingsForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      kycAlerts: true,
      newUserAlerts: false,
      alertEmail: "",
      alertWebhookUrl: "",
    },
  });

  function onSubmit(_data: NotificationFormValues) {
    toast.info("Notification persistence is not wired up yet", {
      description:
        "Backend endpoints for these keys are not available. Changes are not saved.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how you receive alerts and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email notifications for important events
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kycAlerts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>KYC Alerts</FormLabel>
                    <FormDescription>
                      Get notified when users submit or complete KYC
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newUserAlerts"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>New User Alerts</FormLabel>
                    <FormDescription>
                      Get notified when new users register
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="alertEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="admin@dattaremit.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email address for receiving alert notifications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alertWebhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://hooks.slack.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional webhook URL for receiving alerts (e.g. Slack)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Notifications
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
