"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReferralStats } from "@/lib/api";

interface ReferralStatsTableProps {
  stats: ReferralStats;
}

export function ReferralStatsTable({ stats }: ReferralStatsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>
          Total referrals: {stats.totalReferrals} users joined via referral
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats.topReferrers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topReferrers.map((referrer, i) => (
                <TableRow key={referrer.id}>
                  <TableCell className="font-medium">#{i + 1}</TableCell>
                  <TableCell>
                    <Link href={`/users/${referrer.id}`} className="hover:underline">
                      {referrer.firstName} {referrer.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {referrer.referCode}
                    </code>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {referrer.referralCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No referral data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
