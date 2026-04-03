"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import type { StatusCount } from "@/lib/api";
import { PIE_COLORS } from "@/lib/constants";
import { useMemo } from "react";

interface AccountStatusChartProps {
  data: StatusCount[];
}

export function AccountStatusChart({ data }: AccountStatusChartProps) {
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.map((d, i) => [
          d.status,
          { label: d.status, color: PIE_COLORS[i % PIE_COLORS.length] },
        ]),
      ) satisfies ChartConfig,
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Status Distribution</CardTitle>
        <CardDescription>Breakdown of user account statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data.map((d) => ({
                  name: d.status,
                  value: d.count,
                  fill: chartConfig[d.status]?.color,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground py-12 text-center">No data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
