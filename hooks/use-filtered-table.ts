"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { DEBOUNCE_MS, DEFAULT_PAGE_SIZE } from "@/lib/constants";

const ALL_SENTINEL = "all";

export type FilterMap = Record<string, string | undefined>;

interface UseFilteredTableOptions<F extends FilterMap> {
  debounceMs?: number;
  limit?: number;
  searchKey?: keyof F & string;
}

/**
 * Wraps useDebounce + usePaginatedFetch and normalises filter values:
 *   - the search field is debounced
 *   - empty strings and the literal "all" become undefined before reaching the fetcher
 */
export function useFilteredTable<T, F extends FilterMap>(
  fetcher: (
    page: number,
    limit: number,
    filters: F,
  ) => Promise<{ data: T[]; total: number }>,
  filters: F,
  options: UseFilteredTableOptions<F> = {},
) {
  const {
    debounceMs = DEBOUNCE_MS,
    limit = DEFAULT_PAGE_SIZE,
    searchKey = "search" as keyof F & string,
  } = options;

  const searchRaw = (filters[searchKey] ?? "") as string;
  const debouncedSearch = useDebounce(searchRaw, debounceMs);

  const resolved = {} as F;
  const sortedKeys = Object.keys(filters).sort() as Array<keyof F & string>;
  const deps: Array<string | undefined> = [];

  for (const key of sortedKeys) {
    if (key === searchKey) {
      const trimmed = debouncedSearch.trim();
      resolved[key] = (trimmed || undefined) as F[typeof key];
      deps.push(debouncedSearch);
    } else {
      const v = filters[key];
      resolved[key] = (!v || v === ALL_SENTINEL ? undefined : v) as F[typeof key];
      deps.push(v);
    }
  }

  return usePaginatedFetch<T>(
    (page, lim) => fetcher(page, lim, resolved),
    deps,
    limit,
  );
}
