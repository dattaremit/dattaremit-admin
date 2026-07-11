"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type TransferRequest } from "@/lib/api";
import { TRANSFER_REQUEST_STATUS_VARIANT } from "@/lib/constants";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/table/status-badge";
import { EmptyTableRow } from "@/components/table/empty-table-row";

interface TransferRequestsTableProps {
  requests: TransferRequest[];
  onAction: (request: TransferRequest, status: "COMPLETED" | "REJECTED") => void;
}

function fullAccountNumber(req: TransferRequest): string | null {
  const d = req.destination;
  if (!d) return null;
  return d.bankAccountNumber ?? d.accountNumber ?? null;
}

export function TransferRequestsTable({ requests, onAction }: TransferRequestsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount (USD)</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Pay out (INR)</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <EmptyTableRow colSpan={8}>No transfer requests found</EmptyTableRow>
          ) : (
            requests.map((req) => {
              const acct = fullAccountNumber(req);
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.userName ?? "—"}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatAmount(req.amountUsd, "USD")}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    ₹{req.exchangeRate.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {formatAmount(req.endAmountInr, "INR")}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[260px] truncate">{req.destinationLabel}</div>
                    {acct && (
                      <div className="text-xs tabular-nums text-muted-foreground">A/C {acct}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={req.status} variants={TRANSFER_REQUEST_STATUS_VARIANT} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(req.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "PENDING" ? (
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAction(req, "COMPLETED")}
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Mark completed</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAction(req, "REJECTED")}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reject &amp; refund</TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
