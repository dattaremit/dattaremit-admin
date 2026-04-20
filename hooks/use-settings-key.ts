"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UseSettingsKeyResult<T> {
  value: T;
  setValue: (value: T) => void;
  loading: boolean;
  lastUpdated: string | null;
  setLastUpdated: (ts: string | null) => void;
}

/**
 * Loads a single key from `api.getSettings()` on mount, parses its raw
 * string value into T, and tracks the last-updated timestamp alongside it.
 * Errors while loading surface as a toast.
 */
export function useSettingsKey<T>(
  key: string,
  parse: (raw: string) => T,
  initial: T,
  errorMessage = "Failed to load setting",
): UseSettingsKeyResult<T> {
  const [value, setValue] = useState<T>(initial);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.getSettings();
        if (cancelled) return;
        const setting = res.data[key];
        if (setting) {
          setValue(parse(setting.value));
          setLastUpdated(setting.updated_at);
        }
      } catch {
        if (!cancelled) toast.error(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, setValue, loading, lastUpdated, setLastUpdated };
}
