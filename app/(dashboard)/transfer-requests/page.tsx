"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type TransferRequest, type TransferRequestFilters } from "@/lib/api";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { ErrorState } from "@/components/error-state";
import { TransferRequestsTable } from "@/components/transfer-requests/transfer-requests-table";
import { TransferRequestsFilters } from "@/components/transfer-requests/transfer-requests-filters";
import { UpdateStatusDialog } from "@/components/transfer-requests/update-status-dialog";

export default function TransferRequestsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [action, setAction] = useState<{
    request: TransferRequest;
    status: "COMPLETED" | "REJECTED";
  } | null>(null);

  const { data: requests, total, page, setPage, totalPages, loading, error, refetch } =
    useFilteredTable<TransferRequest, TransferRequestFilters>(
      async (page, limit, filters) => {
        const res = await api.getTransferRequests(page, limit, filters);
        return { data: res.data.transferRequests ?? [], total: res.data.total };
      },
      { search, status },
    );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Requests</h1>
        <p className="text-muted-foreground">
          Balance sends users filed for you to pay out manually
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transfer Requests</CardTitle>
          <CardDescription>
            {total} total request{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransferRequestsFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
          />

          {loading ? (
            <TableSkeleton />
          ) : (
            <TransferRequestsTable
              requests={requests}
              onAction={(request, status) => setAction({ request, status })}
            />
          )}

          <PagePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>

      {action && (
        <UpdateStatusDialog
          request={action.request}
          status={action.status}
          open={true}
          onOpenChange={(open) => {
            if (!open) setAction(null);
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
