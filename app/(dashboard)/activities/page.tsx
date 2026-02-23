"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { api, type Activity } from "@/lib/api";

const ACTIVITY_TYPES = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYMENT",
  "REFUND",
  "KYC_SUBMITTED",
  "KYC_APPROVED",
  "KYC_REJECTED",
  "KYC_PENDING",
  "KYC_VERIFIED",
  "KYC_FAILED",
  "ACCOUNT_APPROVED",
  "ACCOUNT_ACTIVATED",
  "ACCOUNT_DEACTIVATED",
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  COMPLETE: "default",
  PENDING: "secondary",
  FAILED: "destructive",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const type = typeFilter === "all" ? undefined : typeFilter;
      const status = statusFilter === "all" ? undefined : statusFilter;
      const res = await api.getActivities(page, limit, type, status);
      setActivities(res.data.activities ?? []);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter]);

  const totalPages = Math.ceil(total / limit);

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
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
