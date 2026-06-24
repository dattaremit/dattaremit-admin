"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type WebhookEventListItem, type WebhookFilters } from "@/lib/api";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { ErrorState } from "@/components/error-state";
import { WebhooksTable } from "@/components/webhooks/webhooks-table";
import { WebhooksFilters } from "@/components/webhooks/webhooks-filters";

export default function WebhooksPage() {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: events, total, page, setPage, totalPages, loading, error } =
    useFilteredTable<WebhookEventListItem, WebhookFilters>(
      async (page, limit, filters) => {
        const res = await api.getWebhookEvents(page, limit, filters);
        return { data: res.data.webhookEvents ?? [], total: res.data.total };
      },
      { search, provider, status },
    );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-muted-foreground">
          Inbound provider webhook deliveries and their processing status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>
            {total} total event{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WebhooksFilters
            search={search}
            onSearchChange={setSearch}
            provider={provider}
            onProviderChange={setProvider}
            status={status}
            onStatusChange={setStatus}
          />

          {loading ? (
            <TableSkeleton />
          ) : (
            <WebhooksTable events={events} />
          )}

          <PagePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
