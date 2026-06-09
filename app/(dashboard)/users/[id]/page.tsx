"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { STATUS_BADGE_VARIANT } from "@/lib/constants";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { DeleteUserDialog } from "@/components/delete-user-dialog";
import { ChangeRoleDialog } from "@/components/change-role-dialog";
import { UserProfile } from "@/components/users/user-profile";
import { UserAddresses } from "@/components/users/user-addresses";
import { UserBankDetails } from "@/components/users/user-bank-details";
import { UserActivityHistory } from "@/components/users/user-activity-history";

const USER_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const id = USER_ID_REGEX.test(rawId) ? rawId : "";

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [instantTransferLoading, setInstantTransferLoading] = useState(false);

  async function handleInstantTransferToggle(checked: boolean) {
    setInstantTransferLoading(true);
    try {
      await api.toggleInstantTransfer(id, checked);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle instant transfer");
      refetch();
    } finally {
      setInstantTransferLoading(false);
    }
  }

  const { data: user, loading, error, refetch } = useApiFetch(
    async () => {
      if (!id) throw new Error("Invalid user ID");
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
          <TabsTrigger value="banks">
            Bank Accounts ({user.banks?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="activities">
            Activities ({user.activities?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <UserProfile
            user={user}
            instantTransferLoading={instantTransferLoading}
            onInstantTransferToggle={handleInstantTransferToggle}
          />
        </TabsContent>

        <TabsContent value="addresses">
          <UserAddresses addresses={user.addresses} />
        </TabsContent>

        <TabsContent value="banks">
          <UserBankDetails banks={user.banks} />
        </TabsContent>

        <TabsContent value="activities">
          <UserActivityHistory activities={user.activities} />
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
