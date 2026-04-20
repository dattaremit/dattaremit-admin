import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const BLOCKED_KEYS = new Set([
  "ssn",
  "pan",
  "pannumber",
  "aadhaar",
  "aadhar",
  "aadharnumber",
  "cvv",
  "accountnumber",
  "routingnumber",
  "iban",
  "ifsc",
  "publickey",
  "privatekey",
  "token",
  "secret",
  "password",
]);

function redactMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      if (BLOCKED_KEYS.has(key.toLowerCase())) return [key, "[redacted]"];
      return [key, value];
    }),
  );
}

export function ActivityMetadataDialog({
  metadata,
  activityType,
}: {
  metadata: Record<string, unknown> | null;
  activityType: string;
}) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const safe = redactMetadata(metadata);

  return (
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
            Metadata for {activityType}. Sensitive fields are redacted.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <pre className="rounded-md bg-muted p-4 text-xs">
            {JSON.stringify(safe, null, 2)}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
