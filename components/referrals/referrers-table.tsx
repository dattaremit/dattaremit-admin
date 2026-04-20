"use client";

import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatarCell } from "@/components/table/user-avatar-cell";

export interface Referrer {
  id: string;
  firstName: string;
  lastName: string;
  referCode: string;
  referralCount: number;
}

interface ReferrersTableProps {
  referrers: Referrer[];
  page: number;
  pageSize?: number;
  totalReferrals: number;
  searchActive: boolean;
}

export function ReferrersTable({
  referrers,
  page,
  pageSize = 20,
  totalReferrals,
  searchActive,
}: ReferrersTableProps) {
  if (referrers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No referral data yet</p>
        <p className="text-sm text-muted-foreground/70">
          {searchActive
            ? "No referrers match your search"
            : "Referral stats will appear once users start referring others"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Referrer</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead className="text-right">Referrals</TableHead>
            <TableHead className="text-right">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrers.map((referrer, i) => (
            <TableRow key={referrer.id}>
              <TableCell>
                <Badge
                  variant={page === 1 && i === 0 ? "default" : "outline"}
                  className="w-8 justify-center"
                >
                  {(page - 1) * pageSize + i + 1}
                </Badge>
              </TableCell>
              <TableCell>
                <UserAvatarCell
                  firstName={referrer.firstName}
                  lastName={referrer.lastName}
                  href={`/users/${referrer.id}`}
                />
              </TableCell>
              <TableCell>
                <code className="rounded bg-muted px-2 py-1 text-xs">
                  {referrer.referCode}
                </code>
              </TableCell>
              <TableCell className="text-right font-medium">
                {referrer.referralCount}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {totalReferrals > 0
                  ? `${Math.round((referrer.referralCount / totalReferrals) * 100)}%`
                  : "0%"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
