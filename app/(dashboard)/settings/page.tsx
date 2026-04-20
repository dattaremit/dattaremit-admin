"use client";

import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { TransferLimitsForm } from "@/components/settings/transfer-limits-form";
import { AccessControlSettingsForm } from "@/components/settings/access-control-settings-form";

export default function SettingsPage() {
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
          <TabsTrigger value="transfer-limits">Transfer Limits</TabsTrigger>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettingsForm />
        </TabsContent>

        <TabsContent value="transfer-limits" className="space-y-6">
          <TransferLimitsForm />
        </TabsContent>

        <TabsContent value="access-control" className="space-y-6">
          <AccessControlSettingsForm />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettingsForm />
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
                  The admin dashboard authenticates every request with a
                  Clerk-issued JWT obtained through <code>getToken()</code> and
                  sent in the <code>x-auth-token</code> header. No admin secret
                  is persisted in the browser.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Session Status</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You are currently authenticated. Session lifetime is managed
                    by Clerk.
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
