"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, type Activity } from "@/lib/api";
import { STATUS_BADGE_VARIANT, ACTIVITY_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { ActivityMetadataDialog } from "@/components/activity-metadata-dialog";
import { ErrorState } from "@/components/error-state";

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: activities, total, page, setPage, totalPages, loading, error } =
    usePaginatedFetch<Activity>(
      async (page, limit) => {
        const type = typeFilter === "all" ? undefined : typeFilter;
        const status = statusFilter === "all" ? undefined : statusFilter;
        const res = await api.getActivities(page, limit, type, status);
        return { data: res.data.activities ?? [], total: res.data.total };
      },
      [typeFilter, statusFilter],
    );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">
          View all platform activities and transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Activities</CardTitle>
          <CardDescription>
            {total} total activit{total !== 1 ? "ies" : "y"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETE">Complete</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No activities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {activity.user ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/users/${activity.userId}`}
                                  className="flex items-center gap-2 hover:underline"
                                >
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs">
                                      {activity.user.firstName?.[0]}
                                      {activity.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {activity.user.firstName}{" "}
                                    {activity.user.lastName}
                                  </span>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                {activity.user.email}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Unknown
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {activity.type.replace(/_/g, " ")}
                          </Badge>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <PagePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
