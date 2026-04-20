"use client";

import { Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GeneralSettingsForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "(not set)";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Backend and auth are configured via environment variables. These
          values are shown here for reference only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-api-url">API Base URL</Label>
          <Input
            id="settings-api-url"
            value={apiUrl}
            readOnly
            aria-readonly
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Set via <code>NEXT_PUBLIC_API_URL</code> at deploy time.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Authentication</Label>
          <p className="text-xs text-muted-foreground">
            Admin requests are authenticated with a Clerk-issued JWT. No admin
            token is stored in the browser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
