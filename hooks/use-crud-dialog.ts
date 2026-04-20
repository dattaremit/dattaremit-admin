"use client";

import { useState } from "react";

interface CrudDialogBindings<T> {
  target: T | null;
  open: (target: T) => void;
  close: () => void;
  bindProps: (onSuccess: () => void) => {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess: () => void;
  };
}

/**
 * Manages the open/close state of a CRUD dialog that operates on a
 * specific row. Pair with controlled dialogs (EditUserDialog etc.)
 * by spreading `bindProps(refetch)` onto the dialog and gating the
 * render on `target`.
 */
export function useCrudDialog<T>(): CrudDialogBindings<T> {
  const [target, setTarget] = useState<T | null>(null);

  return {
    target,
    open: (next) => setTarget(next),
    close: () => setTarget(null),
    bindProps: (onSuccess) => ({
      open: target !== null,
      onOpenChange: (isOpen) => {
        if (!isOpen) setTarget(null);
      },
      onSuccess,
    }),
  };
}
