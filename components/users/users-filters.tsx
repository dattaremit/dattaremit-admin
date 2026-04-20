"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/search-input";

interface UsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function UsersFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name..."
        className="flex-1"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="INITIAL">Initial</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
