"use client";

import Link from "next/link";
import { use } from "react";
import { Banknote, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type RecipientDetail } from "@/lib/api";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { ErrorState } from "@/components/error-state";

const KYC_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
  FAILED: "destructive",
};

export default function AdminRecipientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error } = useApiFetch<RecipientDetail>(
    async () => {
      const res = await api.getRecipientById(id);
      return res.data;
    },
    [id],
  );

  if (error) return <ErrorState message={error} />;
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }
  if (!data) return <ErrorState message="Recipient not found" />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/recipients"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to recipients
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {data.firstName} {data.lastName}
        </h1>
        <p className="text-muted-foreground">{data.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Shared identity — one row per real-world recipient.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              {data.phoneNumberPrefix} {data.phoneNumber}
            </Field>
            <Field label="KYC">
              <Badge variant={KYC_VARIANT[data.kycStatus ?? ""] ?? "secondary"}>
                {data.kycStatus ?? "—"}
              </Badge>
            </Field>
            <Field label="Nationality">{data.nationality}</Field>
            <Field label="Added">
              {new Date(data.created_at).toLocaleString()}
            </Field>
            <Field label="Address" className="sm:col-span-2">
              {data.addressLine1}
              {data.addressLine2 ? `, ${data.addressLine2}` : ""}
              <br />
              {data.city}, {data.state} {data.postalCode}
              <br />
              {data.country}
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Linked users ({data.linkedUsers.length})
          </CardTitle>
          <CardDescription>
            Every sender who has added this recipient to their list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.linkedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No users linked. Soft-deletable if no transactions reference it.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Linked at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.linkedUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/users/${u.id}`}
                        className="hover:underline"
                      >
                        {u.firstName} {u.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.accountStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.linkedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Bank accounts ({data.banks.length})
          </CardTitle>
          <CardDescription>
            Destination accounts available to linked senders. The default is
            used when a sender doesn&rsquo;t explicitly pick a bank.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.banks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bank accounts linked yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label / Bank</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>IFSC</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.banks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium">
                        {b.label ?? b.bankName ?? "Bank account"}
                      </div>
                      {b.bankName && (
                        <div className="text-xs text-muted-foreground">
                          {b.bankName}
                          {b.branchName ? ` · ${b.branchName}` : ""}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {b.bankAccountNumberMasked ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {b.bankIfsc ?? "—"}
                    </TableCell>
                    <TableCell>{b.bankAccountType ?? "—"}</TableCell>
                    <TableCell>
                      {b.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
