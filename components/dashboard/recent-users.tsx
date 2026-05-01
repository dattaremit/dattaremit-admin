"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Recent Users</CardTitle>
          <CardDescription>Latest registered users</CardDescription>
        </div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand/80 transition-colors"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="flex flex-col">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="group flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-accent/60"
            >
              <Avatar className="h-9 w-9 ring-1 ring-border group-hover:ring-brand/30 transition-all">
                <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium truncate">
                      {user.firstName} {user.lastName}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>{user.email}</TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge
                variant={STATUS_BADGE_VARIANT[user.accountStatus] ?? "outline"}
                className="capitalize"
              >
                {user.accountStatus}
              </Badge>
            </Link>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
