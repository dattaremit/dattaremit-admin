"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Globe, Calendar, Shield, Gift, Pencil, Trash2, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { InfoRow } from "@/components/info-row";
import { ActivityMetadataDialog } from "@/components/activity-metadata-dialog";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { ChangeRoleDialog } from "@/components/change-role-dialog";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [achPushLoading, setAchPushLoading] = useState(false);

  async function handleAchPushToggle(checked: boolean) {
    setAchPushLoading(true);
    try {
      await api.toggleAchPush(id, checked);
      refetch();
    } catch {
      // refetch to reset switch state
      refetch();
    } finally {
      setAchPushLoading(false);
    }
  }

  const { data: user, loading, error, refetch } = useApiFetch(
    async () => {
      const res = await api.getUserById(id);
      return res.data;
    },
    [id],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{error || "User not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Badge
          variant={STATUS_BADGE_VARIANT[user.accountStatus] ?? "outline"}
          className="ml-auto"
        >
          {user.accountStatus}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit User
        </Button>
        <Button variant="outline" size="sm" onClick={() => setChangeRoleOpen(true)}>
          <Shield className="mr-2 h-4 w-4" />
          Change Role
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">
            Addresses ({user.addresses?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({user.activities?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fast Transfer (ACH Push)</p>
                      <p className="text-xs text-muted-foreground">
                        {user.achPushEnabled
                          ? "User can select fast ACH push transfers"
                          : "User limited to regular ACH pull transfers"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={user.achPushEnabled}
                    onCheckedChange={handleAchPushToggle}
                    disabled={achPushLoading}
                  />
                </div>
                <Separator />
                <InfoRow
                  icon={Calendar}
                  label="Joined"
                  value={formatDate(user.created_at)}
                />
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Integration IDs</p>
                  <div className="space-y-1 text-xs">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>User registered addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {user.addresses.map((addr) => (
                    <Card key={addr.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{addr.type}</Badge>
                          {addr.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p>{addr.country}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No addresses registered
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent activities for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.activities && user.activities.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            {activity.type.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_BADGE_VARIANT[activity.status] ?? "outline"}>
                              {activity.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {activity.description || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {activity.amount || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </TableCell>
                          <TableCell>
                            <ActivityMetadataDialog
                              metadata={activity.metadata}
                              activityType={activity.type}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No activities recorded
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditUserDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={refetch}
      />

      <DeleteUserDialog
        user={user}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.push("/users")}
      />

      <ChangeRoleDialog
        user={user}
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
