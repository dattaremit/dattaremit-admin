"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Landmark,
  User as UserIcon,
  CreditCard,
  Hash,
  MapPin,
  Wallet,
  Globe,
  Coins,
} from "lucide-react";
import { InfoRow } from "@/components/info-row";
import type { BankDetailsAdmin, NreBankAccountAdmin } from "@/lib/api";

interface UserBankDetailsProps {
  banks: BankDetailsAdmin[] | undefined | null;
  nreBankAccount: NreBankAccountAdmin | undefined | null;
}

export function UserBankDetails({ banks, nreBankAccount }: UserBankDetailsProps) {
  const hasBanks = banks && banks.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Accounts</CardTitle>
        <CardDescription>Bank accounts the user has added</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NRE bank account — separate model, at most one per user. */}
        {nreBankAccount && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              NRE Bank Account
            </p>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {nreBankAccount.bankName || "NRE Account"}
                  </Badge>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {nreBankAccount.accountType || "NRE"}
                    </Badge>
                    {nreBankAccount.isPrimary && (
                      <Badge variant="secondary">Primary</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                <InfoRow
                  icon={Landmark}
                  label="Bank"
                  value={nreBankAccount.bankName ?? "—"}
                />
                <InfoRow
                  icon={UserIcon}
                  label="Account Holder"
                  value={nreBankAccount.accountHolderName ?? "—"}
                />
                <InfoRow
                  icon={CreditCard}
                  label="Account Number"
                  value={nreBankAccount.accountNumber ?? "—"}
                />
                <InfoRow
                  icon={Hash}
                  label="IFSC"
                  value={nreBankAccount.ifscCode ?? "—"}
                />
                <InfoRow
                  icon={Globe}
                  label="SWIFT"
                  value={nreBankAccount.swiftCode ?? "—"}
                />
                <InfoRow
                  icon={MapPin}
                  label="Branch"
                  value={nreBankAccount.branchName ?? "—"}
                />
                <InfoRow
                  icon={Coins}
                  label="Currency"
                  value={nreBankAccount.currency ?? "—"}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* The user's saved (non-NRE) bank accounts. */}
        <div className="space-y-3">
          {nreBankAccount && hasBanks && (
            <p className="text-sm font-medium text-muted-foreground">
              Saved Bank Accounts
            </p>
          )}
          {hasBanks ? (
            <div className="grid gap-4 md:grid-cols-2">
              {banks!.map((bank) => (
                <Card key={bank.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {bank.label || bank.bankName || "Bank Account"}
                      </Badge>
                      {bank.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <InfoRow
                      icon={Landmark}
                      label="Bank"
                      value={bank.bankName ?? "—"}
                    />
                    <InfoRow
                      icon={UserIcon}
                      label="Account Name"
                      value={bank.bankAccountName ?? "—"}
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="Account Number"
                      value={bank.bankAccountNumber ?? "—"}
                    />
                    <InfoRow
                      icon={Hash}
                      label="IFSC"
                      value={bank.bankIfsc ?? "—"}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Branch"
                      value={bank.branchName ?? "—"}
                    />
                    <InfoRow
                      icon={Wallet}
                      label="Account Type"
                      value={bank.bankAccountType ?? "—"}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !nreBankAccount && (
              <p className="py-8 text-center text-muted-foreground">
                No bank accounts added
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
