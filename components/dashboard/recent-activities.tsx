"use client";

import { Activity } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest platform activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {formatActivityType(activity.type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.user
                    ? `${activity.user.firstName} ${activity.user.lastName}`
                    : "Unknown"}
                  {" - "}
                  {formatDate(activity.created_at)}
                </p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[activity.status] ?? "outline"}>
                {activity.status}
              </Badge>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No activities yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
