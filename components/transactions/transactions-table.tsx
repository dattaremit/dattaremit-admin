"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type TransactionListItem } from "@/lib/api";
import { TRANSACTION_STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/table/status-badge";
import { EmptyTableRow } from "@/components/table/empty-table-row";

interface TransactionsTableProps {
  transactions: TransactionListItem[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sender</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Send</TableHead>
            <TableHead>Receive</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <EmptyTableRow colSpan={8}>No transactions found</EmptyTableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{tx.sender.name}</div>
                  {tx.sender.email && (
                    <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {tx.sender.email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px] truncate">
                    {tx.counterparty.name}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {tx.counterparty.type}
                  </div>
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {formatAmount(tx.sendAmount, tx.sendCurrency)}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {formatAmount(tx.receiveAmount, tx.receiveCurrency)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {tx.payoutProvider.replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    value={tx.status}
                    variants={TRANSACTION_STATUS_BADGE_VARIANT}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(tx.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/transactions/${tx.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View details</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
