"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UsePaginatedFetchResult<T> {
  data: T[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export function usePaginatedFetch<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  filterDeps: unknown[] = [],
  limit = 20,
): UsePaginatedFetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, filterDeps);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(page, limit);
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, ...filterDeps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  return { data, total, page, setPage, totalPages, loading, error };
}
