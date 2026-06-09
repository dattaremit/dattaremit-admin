"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type TransactionListItem, type TransactionFilters } from "@/lib/api";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { ErrorState } from "@/components/error-state";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionsFilters } from "@/components/transactions/transactions-filters";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [payoutProvider, setPayoutProvider] = useState("all");

  const { data: transactions, total, page, setPage, totalPages, loading, error } =
    useFilteredTable<TransactionListItem, TransactionFilters>(
      async (page, limit, filters) => {
        const res = await api.getTransactions(page, limit, filters);
        return { data: res.data.transactions ?? [], total: res.data.total };
      },
      { search, status, payoutProvider },
    );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Every transfer across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {total} total transaction{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionsFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            payoutProvider={payoutProvider}
            onPayoutProviderChange={setPayoutProvider}
          />

          {loading ? (
            <TableSkeleton />
          ) : (
            <TransactionsTable transactions={transactions} />
          )}

          <PagePagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
