"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StatusCount } from "@/lib/api";

interface AccountStatusBreakdownProps {
  data: StatusCount[];
}

export function AccountStatusBreakdown({ data }: AccountStatusBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status Breakdown</CardTitle>
        <CardDescription>Progress of user account statuses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((d) => (
          <div key={d.status} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{d.status}</span>
              <span className="text-muted-foreground">
                {d.count} ({Math.round((d.count / total) * 100)}%)
              </span>
            </div>
            <Progress value={(d.count / total) * 100} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
