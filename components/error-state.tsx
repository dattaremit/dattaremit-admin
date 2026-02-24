import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-4">
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
