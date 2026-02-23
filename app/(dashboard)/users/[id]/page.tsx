"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Globe, Calendar, Shield, Gift } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, type User } from "@/lib/api";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  PENDING: "secondary",
  INITIAL: "outline",
  REJECTED: "destructive",
  COMPLETE: "default",
  FAILED: "destructive",
};

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.getUserById(id);
        setUser(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

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
          variant={statusVariant[user.accountStatus] ?? "outline"}
          className="ml-auto"
        >
          {user.accountStatus}
        </Badge>
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
                  value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
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
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
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
                            <Badge variant={statusVariant[activity.status] ?? "outline"}>
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
                            {new Date(activity.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {activity.metadata && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Activity Metadata</DialogTitle>
                                    <DialogDescription>
                                      Raw metadata for {activity.type}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[400px]">
                                    <pre className="rounded-md bg-muted p-4 text-xs">
                                      {JSON.stringify(activity.metadata, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            )}
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
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
