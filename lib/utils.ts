import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy")
}

export function formatMonthShort(dateStr: string): string {
  return format(new Date(dateStr), "MMM ''yy")
}

export function formatActivityType(type: string): string {
  return type.replace(/_/g, " ")
}
