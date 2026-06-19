"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { api, type Activity, type ActivityFilters } from "@/lib/api";
import { STATUS_BADGE_VARIANT, ACTIVITY_TYPES } from "@/lib/constants";
import { formatDate, formatActivityType } from "@/lib/utils";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { ActivityMetadataDialog } from "@/components/activities/activity-metadata-dialog";
import { ErrorState } from "@/components/error-state";
import { UserAvatarCell } from "@/components/table/user-avatar-cell";
import { StatusBadge } from "@/components/table/status-badge";
import { EmptyTableRow } from "@/components/table/empty-table-row";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actorId, setActorId] = useState<string>("");
  const [subjectUserId, setSubjectUserId] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  // Only forward UUIDs to the API; raw input lets the user paste partial values
  // without triggering a 400 round-trip on every keystroke.
  const validUuid = (v: string) => (v && UUID_RE.test(v) ? v : undefined);
  const filters: ActivityFilters = {
    type: typeFilter,
    status: statusFilter,
    actorId: validUuid(actorId),
    subjectUserId: validUuid(subjectUserId),
    referenceId: validUuid(referenceId),
    from: from || undefined,
    to: to || undefined,
  };

  const { data: activities, total, page, setPage, totalPages, loading, error } =
    useFilteredTable<Activity, ActivityFilters>(
      async (page, limit, f) => {
        const res = await api.getActivities(page, limit, f);
        return { data: res.data.activities ?? [], total: res.data.total };
      },
      filters,
    );

  async function handleExport() {
    setExporting(true);
    try {
      const { blob, filename, truncated, total } = await api.downloadActivitiesCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (truncated) {
        toast.warning(
          `Export truncated: returned 10,000 of ${total.toLocaleString()} matching rows. Narrow filters to capture the rest.`,
        );
      } else {
        toast.success(`Exported ${total.toLocaleString()} activities`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

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
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Activities</CardTitle>
            <CardDescription>
              {total} total activit{total !== 1 ? "ies" : "y"}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || total === 0}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatActivityType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETE">Complete</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Actor user ID (UUID)"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
            />
            <Input
              placeholder="Subject user ID (UUID)"
              value={subjectUserId}
              onChange={(e) => setSubjectUserId(e.target.value)}
            />
            <Input
              placeholder="Reference ID (UUID)"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
            <Input
              type="datetime-local"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              type="datetime-local"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <EmptyTableRow colSpan={9}>No activities found</EmptyTableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {activity.user ? (
                            <UserAvatarCell
                              firstName={activity.user.firstName}
                              lastName={activity.user.lastName}
                              href={`/users/${activity.userId}`}
                              tooltip={activity.user.email}
                              avatarSize="sm"
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Unknown
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {activity.actorType ?? "USER"}
                          </Badge>
                          {activity.actorId && activity.actorId !== activity.userId && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {activity.actorId.slice(0, 8)}…
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {formatActivityType(activity.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            value={activity.status}
                            variants={STATUS_BADGE_VARIANT}
                          />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {activity.description || "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {activity.amount || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {activity.resultCode || "-"}
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
