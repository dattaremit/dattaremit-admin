"use client";

import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity as ActivityType } from "@/lib/api";
import { STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatDate, formatActivityType } from "@/lib/utils";

interface RecentActivitiesProps {
  activities: ActivityType[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Recent Activities</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </div>
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand/80 transition-colors"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <div className="flex flex-col">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-accent/60"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {formatActivityType(activity.type)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.user
                    ? `${activity.user.firstName} ${activity.user.lastName}`
                    : "Unknown"}
                  <span className="mx-1.5 text-border">·</span>
                  <span className="tabular">{formatDate(activity.created_at)}</span>
                </p>
              </div>
              <Badge
                variant={STATUS_BADGE_VARIANT[activity.status] ?? "outline"}
                className="capitalize"
              >
                {activity.status}
              </Badge>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No activities yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
