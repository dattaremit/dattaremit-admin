"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartDataPoint } from "@/lib/api";
import { formatMonthShort } from "@/lib/utils";

const chartConfig = {
  count: { label: "Registrations", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface RegistrationChartProps {
  data: ChartDataPoint[];
}

export function RegistrationChart({ data }: RegistrationChartProps) {
  const formatted = data.map((d) => ({
    month: formatMonthShort(d.month),
    count: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          User Registrations
        </CardTitle>
        <CardDescription>Monthly registration trend</CardDescription>
      </CardHeader>
      <CardContent>
        {formatted.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={formatted} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="count"
                type="monotone"
                fill="url(#fillReg)"
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground py-12 text-center">No registration data yet</p>
        )}
      </CardContent>
    </Card>
  );
}
