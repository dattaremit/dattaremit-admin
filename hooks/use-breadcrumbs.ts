"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface Breadcrumb {
  label: string;
  href?: string;
}

const LABELS: Record<string, string> = {
  users: "Users",
  activities: "Activities",
  referrals: "Referrals",
  settings: "Settings",
};

export function useBreadcrumbs(): Breadcrumb[] {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname === "/") return [];

    const segments = pathname.split("/").filter(Boolean);
    const crumbs: Breadcrumb[] = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const label = LABELS[segment] || segment;
      const href = isLast ? undefined : `/${segments.slice(0, i + 1).join("/")}`;
      crumbs.push({ label, href });
    }

    return crumbs;
  }, [pathname]);
}
