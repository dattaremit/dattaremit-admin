"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseDialogActionOptions {
  successMessage: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Wraps the common dialog action lifecycle: setLoading -> await action ->
 * toast success/error -> close dialog -> refetch. The `action` receives
 * whatever args the caller passes through `run`.
 */
export function useDialogAction<TArgs extends unknown[] = []>(
  action: (...args: TArgs) => Promise<unknown>,
  options: UseDialogActionOptions,
) {
  const [loading, setLoading] = useState(false);

  async function run(...args: TArgs) {
    setLoading(true);
    try {
      await action(...args);
      toast.success(options.successMessage);
      options.onOpenChange?.(false);
      options.onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : options.errorMessage ?? "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  return { loading, run };
}
