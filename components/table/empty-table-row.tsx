"use client";

import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyTableRowProps {
  colSpan: number;
  children: React.ReactNode;
}

export function EmptyTableRow({ colSpan, children }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        {children}
      </TableCell>
    </TableRow>
  );
}
