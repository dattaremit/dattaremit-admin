"use client";

import { Badge } from "@/components/ui/badge";
import { type BadgeVariant } from "@/lib/constants";

interface StatusBadgeProps {
  value: string;
  variants: Record<string, BadgeVariant>;
  className?: string;
}

export function StatusBadge({ value, variants, className }: StatusBadgeProps) {
  return (
    <Badge variant={variants[value] ?? "outline"} className={className}>
      {value}
    </Badge>
  );
}
