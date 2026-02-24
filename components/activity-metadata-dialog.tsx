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

export function ActivityMetadataDialog({
  metadata,
  activityType,
}: {
  metadata: Record<string, unknown> | null;
  activityType: string;
}) {
  if (!metadata) return null;

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
            Raw metadata for {activityType}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <pre className="rounded-md bg-muted p-4 text-xs">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
