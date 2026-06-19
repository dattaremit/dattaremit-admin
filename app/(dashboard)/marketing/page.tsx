"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type User } from "@/lib/api";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { ErrorState } from "@/components/error-state";
import { AddPromoterDialog } from "@/components/marketing/add-promoter-dialog";
import { MarketingStats } from "@/components/marketing/marketing-stats";
import { PromotersFilters } from "@/components/marketing/promoters-filters";
import { PromotersTable } from "@/components/marketing/promoters-table";

export default function MarketingPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: stats } = useApiFetch(async () => {
    const res = await api.getMarketingStats();
    return res.data;
  }, []);

  const {
    data: promoters,
    total,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch,
  } = useFilteredTable<User, { search?: string; role?: string }>(
    async (page, limit, { search, role }) => {
      const res = await api.getPromoters(page, limit, search, role);
      return { data: res.data.promoters ?? [], total: res.data.total };
    },
    { search, role: roleFilter },
  );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">
            Manage influencers, promoters, and referral programs
          </p>
        </div>
        <AddPromoterDialog onSuccess={refetch} />
      </div>

      <MarketingStats
        totalInfluencers={stats?.totalInfluencers ?? 0}
        totalPromoters={stats?.totalPromoters ?? 0}
        totalPromoterReferrals={stats?.totalPromoterReferrals ?? 0}
      />

      <Card>
        <CardHeader>
          <CardTitle>Promoters & Influencers</CardTitle>
          <CardDescription>
            {total} total promoter{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PromotersFilters
            search={search}
            onSearchChange={setSearch}
            role={roleFilter}
            onRoleChange={setRoleFilter}
          />

          {loading ? <TableSkeleton /> : <PromotersTable promoters={promoters} />}

          <PagePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
