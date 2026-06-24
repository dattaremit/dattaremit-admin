"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { type WebhookEventListItem } from "@/lib/api";
import { WEBHOOK_STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/table/status-badge";
import { EmptyTableRow } from "@/components/table/empty-table-row";
import { WebhookDetailDialog } from "@/components/webhooks/webhook-detail-dialog";

interface WebhooksTableProps {
  events: WebhookEventListItem[];
}

export function WebhooksTable({ events }: WebhooksTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Attempts</TableHead>
              <TableHead>Linked</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <EmptyTableRow colSpan={7}>No webhook events found</EmptyTableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant="outline">{event.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[220px] truncate font-medium">
                      {event.eventType ?? "—"}
                    </div>
                    {event.eventCategory && (
                      <div className="text-xs text-muted-foreground">
                        {event.eventCategory}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      value={event.status}
                      variants={WEBHOOK_STATUS_BADGE_VARIANT}
                    />
                    {event.lastError && (
                      <div className="mt-0.5 max-w-[220px] truncate text-xs text-destructive">
                        {event.lastError}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {event.attempts}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {event.transactionId
                      ? "Transaction"
                      : event.userId
                        ? "User"
                        : event.recipientId
                          ? "Recipient"
                          : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(event.firstReceivedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedId(event.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View payload</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <WebhookDetailDialog
        eventId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
