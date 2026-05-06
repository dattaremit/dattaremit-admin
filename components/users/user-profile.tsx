"use client";

import { Mail, Phone, Globe, Calendar, Shield, Gift, Zap, Percent } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { InfoRow } from "@/components/info-row";
import { formatDate } from "@/lib/utils";

interface UserProfileProps {
  user: {
    email: string;
    phoneNumberPrefix: string;
    phoneNumber: string;
    dateOfBirth?: string | null;
    nationality?: string | null;
    accountStatus: string;
    role: string;
    referCode?: string | null;
    referredByCode?: string | null;
    referValue?: number;
    rateFlag?: "ZERO" | "SMALL" | "MEDIUM" | "HIGH";
    instantTransfer: boolean;
    created_at: string;
    clerkUserId: string;
    zynkEntityId?: string | null;
  };
  instantTransferLoading: boolean;
  onInstantTransferToggle: (checked: boolean) => void;
}

export function UserProfile({ user, instantTransferLoading, onInstantTransferToggle }: UserProfileProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <Separator />
          <InfoRow
            icon={Phone}
            label="Phone"
            value={`${user.phoneNumberPrefix} ${user.phoneNumber}`}
          />
          <Separator />
          <InfoRow
            icon={Calendar}
            label="Date of Birth"
            value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}
          />
          <Separator />
          <InfoRow
            icon={Globe}
            label="Nationality"
            value={user.nationality || "N/A"}
          />
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow
            icon={Shield}
            label="Account Status"
            value={user.accountStatus}
          />
          <Separator />
          <InfoRow
            icon={Shield}
            label="Role"
            value={user.role}
          />
          <Separator />
          <InfoRow
            icon={Gift}
            label="Referral Code"
            value={user.referCode || "None"}
          />
          <Separator />
          <InfoRow
            icon={Gift}
            label="Referred By"
            value={user.referredByCode || "None"}
          />
          <Separator />
          <InfoRow
            icon={Gift}
            label="Refer Value"
            value={String(user.referValue ?? 1)}
          />
          <Separator />
          <InfoRow
            icon={Percent}
            label="Rate Flag (internal)"
            value={user.rateFlag ?? "HIGH"}
          />
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Instant Transfer</p>
                <p className="text-xs text-muted-foreground">
                  {user.instantTransfer
                    ? "Counterparty risk acknowledged for instant transfers"
                    : "Standard transfer settlement"}
                </p>
              </div>
            </div>
            <Switch
              checked={user.instantTransfer}
              onCheckedChange={onInstantTransferToggle}
              disabled={instantTransferLoading}
            />
          </div>
          <Separator />
          <InfoRow
            icon={Calendar}
            label="Joined"
            value={formatDate(user.created_at)}
          />
          <Separator />
          <details className="space-y-2">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Integration IDs
            </summary>
            <div className="mt-2 space-y-1 text-xs">
              <p>
                <span className="text-muted-foreground">Clerk:</span>{" "}
                <code className="rounded bg-muted px-1">{user.clerkUserId}</code>
              </p>
              <p>
                <span className="text-muted-foreground">Zynk Entity:</span>{" "}
                <code className="rounded bg-muted px-1">
                  {user.zynkEntityId || "N/A"}
                </code>
              </p>
              <p className="text-muted-foreground italic">
                These are third-party processor keys. Do not share outside
                this panel.
              </p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
