"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type User } from "@/lib/api";
import { ROLE_BADGE_VARIANT } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/table/status-badge";
import { EmptyTableRow } from "@/components/table/empty-table-row";

interface PromotersTableProps {
  promoters: User[];
}

export function PromotersTable({ promoters }: PromotersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead>Refer Value</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoters.length === 0 ? (
            <EmptyTableRow colSpan={6}>No promoters found</EmptyTableRow>
          ) : (
            promoters.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <StatusBadge value={user.role} variants={ROLE_BADGE_VARIANT} />
                </TableCell>
                <TableCell>
                  {user.referCode ? (
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {user.referCode}
                    </code>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{user.referValue}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(user.created_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
