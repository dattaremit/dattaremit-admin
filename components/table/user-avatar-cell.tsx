"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserAvatarCellProps {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  href?: string;
  tooltip?: string;
  avatarSize?: "sm" | "md";
}

export function UserAvatarCell({
  firstName,
  lastName,
  href,
  tooltip,
  avatarSize = "md",
}: UserAvatarCellProps) {
  const avatarClass = avatarSize === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textClass = avatarSize === "sm" ? "text-sm" : "font-medium";

  const inner = (
    <>
      <Avatar className={avatarClass}>
        <AvatarFallback className="text-xs">
          {firstName?.[0]}
          {lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <span className={textClass}>
        {firstName} {lastName}
      </span>
    </>
  );

  const row = href ? (
    <Link href={href} className="flex items-center gap-2 hover:underline">
      {inner}
    </Link>
  ) : (
    <div className="flex items-center gap-3">{inner}</div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{row}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return row;
}
