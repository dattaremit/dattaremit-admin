"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/search-input";
import {
  TRANSACTION_STATUSES,
  TRANSACTION_PAYOUT_PROVIDERS,
} from "@/lib/constants";

interface TransactionsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  payoutProvider: string;
  onPayoutProviderChange: (value: string) => void;
}

export function TransactionsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  payoutProvider,
  onPayoutProviderChange,
}: TransactionsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by destination or Zynk txn id..."
        className="flex-1"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {TRANSACTION_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={payoutProvider} onValueChange={onPayoutProviderChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by route" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Routes</SelectItem>
          {TRANSACTION_PAYOUT_PROVIDERS.map((p) => (
            <SelectItem key={p} value={p}>
              {p.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
