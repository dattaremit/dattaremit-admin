import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "brand" | "success" | "warning" | "neutral";

const accentStyles: Record<
  Accent,
  { iconWrap: string; ring: string; glow: string }
> = {
  brand: {
    iconWrap: "bg-brand/10 text-brand",
    ring: "ring-1 ring-brand/15",
    glow:
      "before:bg-[radial-gradient(circle_at_top_right,oklch(from_var(--brand)_l_c_h/0.10),transparent_60%)]",
  },
  success: {
    iconWrap: "bg-success/10 text-success",
    ring: "ring-1 ring-success/15",
    glow:
      "before:bg-[radial-gradient(circle_at_top_right,oklch(from_var(--success)_l_c_h/0.10),transparent_60%)]",
  },
  warning: {
    iconWrap: "bg-warning/15 text-[color:oklch(from_var(--warning)_calc(l-0.18)_c_h)] dark:text-warning",
    ring: "ring-1 ring-warning/20",
    glow:
      "before:bg-[radial-gradient(circle_at_top_right,oklch(from_var(--warning)_l_c_h/0.12),transparent_60%)]",
  },
  neutral: {
    iconWrap: "bg-muted text-muted-foreground",
    ring: "ring-1 ring-border",
    glow:
      "before:bg-[radial-gradient(circle_at_top_right,oklch(from_var(--foreground)_l_c_h/0.04),transparent_60%)]",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "neutral",
  trend,
  children,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  accent?: Accent;
  trend?: { value: string; positive?: boolean };
  children?: React.ReactNode;
}) {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_oklch(from_var(--foreground)_l_c_h/0.18)]",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
        styles.glow
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105",
            styles.iconWrap,
            styles.ring
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-semibold tracking-tight tabular">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {trend && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular",
                trend.positive
                  ? "bg-success/12 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.positive ? "▲" : "▼"} {trend.value}
            </span>
          )}
        </div>
        {children}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
