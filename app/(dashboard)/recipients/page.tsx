"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type RecipientSummary } from "@/lib/api";
import { useFilteredTable } from "@/hooks/use-filtered-table";
import { PagePagination } from "@/components/page-pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { ErrorState } from "@/components/error-state";

const KYC_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
  FAILED: "destructive",
};

export default function RecipientsPage() {
  const [search, setSearch] = useState("");
  const [kyc, setKyc] = useState<string>("all");

  const { data, total, page, setPage, totalPages, loading, error } =
    useFilteredTable<
      RecipientSummary,
      { search?: string; kycStatus?: string }
    >(
      async (page, limit, { search, kycStatus }) => {
        const res = await api.getRecipients(page, limit, search, kycStatus);
        return { data: res.data.recipients ?? [], total: res.data.total };
      },
      { search, kycStatus: kyc },
    );

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recipients</h1>
        <p className="text-muted-foreground">
          Recipients registered across all senders. Shared identities surface
          once here and are linked to each sender via the junction.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All recipients</CardTitle>
          <CardDescription>
            {total} total recipient{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={kyc} onValueChange={setKyc}>
              <SelectTrigger className="max-w-[200px]">
                <SelectValue placeholder="All KYC statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Linked users</TableHead>
                  <TableHead>Banks</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No recipients match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/recipients/${r.id}`}
                          className="hover:underline"
                        >
                          {r.firstName} {r.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{r.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.phoneNumberPrefix} {r.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={KYC_VARIANT[r.kycStatus ?? ""] ?? "secondary"}>
                          {r.kycStatus ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.linkedUserCount}</TableCell>
                      <TableCell>{r.bankCount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

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
