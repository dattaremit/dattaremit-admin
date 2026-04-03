"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TypeCount } from "@/lib/api";
import { formatActivityType } from "@/lib/utils";

const chartConfig = {
  count: { label: "Count", color: "var(--chart-2)" },
} satisfies ChartConfig;

interface ActivityTypeChartProps {
  data: TypeCount[];
}

export function ActivityTypeChart({ data }: ActivityTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Types</CardTitle>
        <CardDescription>Distribution of activity types</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              data={data.map((d) => ({
                type: formatActivityType(d.type),
                count: d.count,
              }))}
              layout="vertical"
              accessibilityLayer
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                dataKey="type"
                type="category"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground py-12 text-center">No activity data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
