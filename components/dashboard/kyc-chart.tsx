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
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import type { TypeCount } from "@/lib/api";
import { PIE_COLORS } from "@/lib/constants";
import { useMemo } from "react";

interface KycChartProps {
  data: TypeCount[];
}

export function KycChart({ data }: KycChartProps) {
  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        data.map((d, i) => [
          d.type,
          { label: d.type.replace("KYC_", ""), color: PIE_COLORS[i % PIE_COLORS.length] },
        ]),
      ) satisfies ChartConfig,
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Activities</CardTitle>
        <CardDescription>KYC verification status breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <RadialBarChart
              data={data.map((d, i) => ({
                name: d.type.replace("KYC_", ""),
                value: d.count,
                fill: PIE_COLORS[i % PIE_COLORS.length],
              }))}
              innerRadius={30}
              outerRadius={140}
              cx="50%"
              cy="50%"
              accessibilityLayer
            >
              <PolarAngleAxis
                type="number"
                domain={[0, Math.max(...data.map((d) => d.count), 1)]}
                tick={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <RadialBar dataKey="value" cornerRadius={5} background />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2"
              />
            </RadialBarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground py-12 text-center">No KYC data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
