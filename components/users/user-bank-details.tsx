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
} from "lucide-react";
import { InfoRow } from "@/components/info-row";
import type { BankDetailsPublic } from "@/lib/api";

interface UserBankDetailsProps {
  banks: BankDetailsPublic[] | undefined | null;
}

export function UserBankDetails({ banks }: UserBankDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Accounts</CardTitle>
        <CardDescription>Bank accounts the user has added</CardDescription>
      </CardHeader>
      <CardContent>
        {banks && banks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {banks.map((bank) => (
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
                    value={bank.bankAccountNumberMasked ?? "—"}
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
          <p className="py-8 text-center text-muted-foreground">
            No bank accounts added
          </p>
        )}
      </CardContent>
    </Card>
  );
}
