"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatDate, formatActivityType } from "@/lib/utils";
import { ActivityMetadataDialog } from "@/components/activity-metadata-dialog";

interface Activity {
  id: string;
  type: string;
  status: string;
  description?: string;
  amount?: string;
  created_at: string;
  metadata?: unknown;
}

interface UserActivityHistoryProps {
  activities: Activity[] | undefined | null;
}

export function UserActivityHistory({ activities }: UserActivityHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>Recent activities for this user</CardDescription>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
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
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {formatActivityType(activity.type)}
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
  );
}
