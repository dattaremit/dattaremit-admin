"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Server, Bell, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const generalFormSchema = z.object({
  apiUrl: z.string().url("Must be a valid URL"),
  adminToken: z.string().min(1, "Admin token is required"),
  rateLimit: z.string().regex(/^\d+$/, "Must be a number"),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  kycAlerts: z.boolean(),
  newUserAlerts: z.boolean(),
  alertEmail: z.string().email("Must be a valid email").or(z.literal("")),
  alertWebhookUrl: z.string().url("Must be a valid URL").or(z.literal("")),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function SettingsPage() {
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
      adminToken: "",
      rateLimit: "200",
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      kycAlerts: true,
      newUserAlerts: false,
      alertEmail: "",
      alertWebhookUrl: "",
    },
  });

  function onGeneralSubmit(data: GeneralFormValues) {
    if (data.adminToken) {
      localStorage.setItem("admin_token", data.adminToken);
    }
    toast.success("Settings saved", {
      description: "General settings have been updated.",
    });
  }

  function onNotificationSubmit(data: NotificationFormValues) {
    localStorage.setItem("notification_settings", JSON.stringify(data));
    toast.success("Notification settings saved", {
      description: "Your notification preferences have been updated.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin dashboard configuration
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure the connection to the DattaRemit backend server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form
                  onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={generalForm.control}
                    name="apiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Base URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="http://localhost:5000/api"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The base URL of your DattaRemit API server
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="adminToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Token</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new admin token"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Update the admin authentication token (leave blank to
                          keep current)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="rateLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="200"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum requests per 15-minute window
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
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
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={notificationForm.control}
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
                    control={notificationForm.control}
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
                    control={notificationForm.control}
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
                    control={notificationForm.control}
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
                    control={notificationForm.control}
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
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Security configuration and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Authentication</AlertTitle>
                <AlertDescription>
                  The admin dashboard uses token-based authentication. The admin
                  token is stored in your browser&apos;s local storage and sent with
                  every API request via the <code>x-admin-token</code> header.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Session Status</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You are currently authenticated. Your token is securely stored
                    in local storage.
                  </p>
                </div>
                <Separator />
                <div>
                  <Label>API Security</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The server is protected with Helmet security headers, CORS
                    policy, and rate limiting (200 requests per 15 minutes). Admin
                    endpoints use a separate authentication middleware.
                  </p>
                </div>
                <Separator />
                <div>
                  <Label>Data Encryption</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    User PII (email, phone number, date of birth) is encrypted at
                    rest using AES-256 encryption. Email lookups use HMAC-SHA256
                    hashing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
