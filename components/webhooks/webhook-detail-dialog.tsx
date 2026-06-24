"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/table/status-badge";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { api, type WebhookEventDetail } from "@/lib/api";
import { WEBHOOK_STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

interface WebhookDetailDialogProps {
  eventId: string | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium" title={value}>
        {value}
      </p>
    </div>
  );
}

function WebhookDetailContent({ eventId }: { eventId: string }) {
  const { data: event, loading, error } = useApiFetch<WebhookEventDetail>(
    async () => (await api.getWebhookEventById(eventId)).data,
    [eventId],
  );

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (error || !event) {
    return (
      <div className="py-10 text-center text-sm text-destructive">
        {error ?? "Failed to load event"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{event.provider}</Badge>
        <StatusBadge
          value={event.status}
          variants={WEBHOOK_STATUS_BADGE_VARIANT}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        <Field label="Event Type" value={event.eventType ?? "—"} />
        <Field label="Category" value={event.eventCategory ?? "—"} />
        <Field label="Provider Status" value={event.eventStatus ?? "—"} />
        <Field label="Attempts" value={String(event.attempts)} />
        <Field label="Idempotency Key" value={event.idempotencyKey} />
        <Field label="Transaction" value={event.transactionId ?? "—"} />
        <Field label="User" value={event.userId ?? "—"} />
        <Field label="Recipient" value={event.recipientId ?? "—"} />
        <Field
          label="First Received"
          value={formatDateTime(event.firstReceivedAt)}
        />
        <Field
          label="Last Attempt"
          value={event.lastAttemptAt ? formatDateTime(event.lastAttemptAt) : "—"}
        />
        <Field
          label="Processed At"
          value={event.processedAt ? formatDateTime(event.processedAt) : "—"}
        />
      </div>

      {event.lastError && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last Error
          </p>
          <pre className="overflow-x-auto rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            {event.lastError}
          </pre>
        </div>
      )}

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Raw Payload
        </p>
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
          {JSON.stringify(event.rawPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function WebhookDetailDialog({
  eventId,
  onClose,
}: WebhookDetailDialogProps) {
  return (
    <Dialog open={Boolean(eventId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Webhook Event</DialogTitle>
          <DialogDescription>
            Raw delivery payload and processing metadata.
          </DialogDescription>
        </DialogHeader>
        {eventId && <WebhookDetailContent eventId={eventId} />}
      </DialogContent>
    </Dialog>
  );
}
