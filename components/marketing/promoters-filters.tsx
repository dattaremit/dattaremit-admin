"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/search-input";

interface PromotersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
}

export function PromotersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
}: PromotersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name..."
        className="flex-1"
      />
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="INFLUENCER">Influencer</SelectItem>
          <SelectItem value="PROMOTER">Promoter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
