"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type TransactionDetail } from "@/lib/api";
import { TRANSACTION_STATUS_BADGE_VARIANT } from "@/lib/constants";
import { formatAmount, formatDateTime } from "@/lib/utils";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { StatusBadge } from "@/components/table/status-badge";

const ID_REGEX = /^[0-9a-fA-F-]{36}$/;

/** One label/value row. Values that are null render as a muted dash. */
function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-right text-sm font-medium ${mono ? "break-all font-mono text-xs" : ""} ${
          empty ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {empty ? "—" : value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 pt-0">{children}</CardContent>
    </Card>
  );
}

function RawJson({ title, value }: { title: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <details className="rounded-md border bg-muted/30 p-3">
      <summary className="cursor-pointer text-sm font-medium">{title}</summary>
      <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-all text-xs text-muted-foreground">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

export default function TransactionDetailPage() {
  const params = useParams();
  const rawId = params.id as string;
  const id = ID_REGEX.test(rawId) ? rawId : "";

  const { data: tx, loading, error } = useApiFetch<TransactionDetail>(
    async () => {
      if (!id) throw new Error("Invalid transaction ID");
      const res = await api.getTransactionById(id);
      return res.data;
    },
    [id],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{error || "Transaction not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const a = tx.amounts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/transactions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transaction</h1>
            <p className="font-mono text-xs text-muted-foreground">{tx.id}</p>
          </div>
          <StatusBadge value={tx.status} variants={TRANSACTION_STATUS_BADGE_VARIANT} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Overview">
          <Row label="Status" value={tx.status} />
          <Row label="Payout route" value={tx.payoutProvider.replace(/_/g, " ")} />
          <Row label="Destination label" value={tx.destinationEntity} />
          <Row label="Note / memo" value={tx.depositMemo} />
          <Row label="Failure reason" value={tx.failureReason} />
          <Row label="Zynk transaction id" value={tx.zynkTransactionId} mono />
          <Row label="Zynk execution id" value={tx.zynkExecutionId} mono />
          <Row label="Created" value={formatDateTime(tx.created_at)} />
          <Row label="Updated" value={formatDateTime(tx.updated_at)} />
        </Section>

        <Section title="Amounts, fees & rates">
          <Row label="Send amount" value={formatAmount(a.sendAmount, a.sendCurrency)} />
          <Row label="Receive amount" value={formatAmount(a.receiveAmount, a.receiveCurrency)} />
          <Row label="FX rate (at transfer)" value={a.exchangeRate} />
          <Row label="Live rate (at transfer)" value={a.liveRate} />
          <Row
            label="Zynk / provider fee"
            value={a.totalFees != null ? formatAmount(a.totalFees, a.feeCurrency) : null}
          />
          <Row
            label="Developer fee"
            value={
              a.developerFeeAmount != null
                ? `${formatAmount(a.developerFeeAmount)}${
                    a.developerFeeRate != null
                      ? ` (${(a.developerFeeRate * 100).toFixed(4)}%)`
                      : ""
                  }`
                : null
            }
          />
        </Section>

        <Section title="Sender (from)">
          <Row label="Name" value={tx.sender?.name} />
          <Row label="Email" value={tx.sender?.email} />
          <Row label="Phone" value={tx.sender?.phone} />
          <Row label="Zynk entity id" value={tx.sender?.zynkEntityId} mono />
          <Row label="Zynk account id" value={tx.sender?.zynkExternalAccountId} mono />
          <Row label="Credible deposit wallet" value={tx.sender?.credibleExternalAccountId} mono />
          {tx.sender && (
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/users/${tx.sender.id}`}>View sender profile</Link>
              </Button>
            </div>
          )}
        </Section>

        {tx.recipient && (
          <Section title="Recipient (to)">
            <Row label="Name" value={tx.recipient.name} />
            <Row label="Email" value={tx.recipient.email} />
            <Row label="KYC status" value={tx.recipient.kycStatus} />
            <Row label="Zynk entity id" value={tx.recipient.zynkEntityId} mono />
            <Row
              label="Credible deposit wallet"
              value={tx.recipient.credibleExternalAccountId}
              mono
            />
          </Section>
        )}

        {tx.receiver && (
          <Section title="Receiver (to)">
            <Row label="Name" value={tx.receiver.name} />
            <Row label="Email" value={tx.receiver.email} />
          </Section>
        )}

        {tx.bankDetails && (
          <Section title="Destination bank">
            <Row label="Bank name" value={tx.bankDetails.bankName} />
            <Row label="Account holder" value={tx.bankDetails.bankAccountName} />
            <Row label="Account number" value={tx.bankDetails.bankAccountNumber} mono />
            <Row label="IFSC" value={tx.bankDetails.bankIfsc} mono />
            <Row label="Branch" value={tx.bankDetails.branchName} />
            <Row label="Account type" value={tx.bankDetails.bankAccountType} />
          </Section>
        )}

        {tx.nreBankAccount && (
          <Section title="Destination NRE bank">
            <Row label="Bank name" value={tx.nreBankAccount.bankName} />
            <Row label="Account holder" value={tx.nreBankAccount.accountHolderName} />
            <Row label="Account number" value={tx.nreBankAccount.accountNumber} mono />
            <Row label="IFSC" value={tx.nreBankAccount.ifscCode} mono />
            <Row label="SWIFT" value={tx.nreBankAccount.swiftCode} mono />
            <Row label="Branch" value={tx.nreBankAccount.branchName} />
            <Row label="Currency" value={tx.nreBankAccount.currency} />
          </Section>
        )}

        {tx.credible && (
          <Section title="Credible payout (second leg)">
            <Row label="Purpose" value={tx.credible.purpose} />
            <Row label="Status" value={tx.credible.status} />
            <Row
              label="Input (into wallet)"
              value={formatAmount(tx.credible.inputAmount, tx.credible.inputCurrency)}
            />
            <Row
              label="Output (to bank)"
              value={formatAmount(tx.credible.outputAmount, tx.credible.outputCurrency)}
            />
            <Row label="FX rate (at payout)" value={tx.credible.fxRateAtPayout} />
            <Row label="Self transfer" value={tx.credible.isSelfTransfer ? "Yes" : "No"} />
            <Row label="Bank reference (UTR)" value={tx.credible.transactionReferenceNo} mono />
            <Row label="Credible payout id" value={tx.credible.crediblePayoutId} mono />
            <Row label="Merchant payout id" value={tx.credible.merchantPayoutId} mono />
            <Row label="Sender customer id" value={tx.credible.senderCustomerId} mono />
            <Row label="Receiver customer id" value={tx.credible.receiverCustomerId} mono />
            <Row label="Failure reason" value={tx.credible.failureReason} />
            <Row
              label="Completed"
              value={tx.credible.completedAt ? formatDateTime(tx.credible.completedAt) : null}
            />
          </Section>
        )}
      </div>

      <div className="space-y-3">
        <RawJson title="Zynk simulate snapshot" value={tx.simulateResponse} />
        <RawJson title="Zynk transfer snapshot" value={tx.transferResponse} />
      </div>
    </div>
  );
}
