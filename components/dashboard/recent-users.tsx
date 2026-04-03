"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { User } from "@/lib/api";
import { STATUS_BADGE_VARIANT } from "@/lib/constants";

interface RecentUsersProps {
  users: User[];
}

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Latest registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/users/${user.id}`}
                      className="text-sm font-medium truncate block hover:underline"
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{user.email}</TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[user.accountStatus] ?? "outline"}>
                {user.accountStatus}
              </Badge>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
