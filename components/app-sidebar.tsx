"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  UserSearch,
  Activity,
  Settings,
  LogOut,
  Gift,
  Megaphone,
  ShieldCheck,
  ArrowLeftRight,
  Webhook,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navSections: {
  label: string;
  items: { title: string; href: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Users", href: "/users", icon: Users },
      { title: "Recipients", href: "/recipients", icon: UserSearch },
      { title: "Activities", href: "/activities", icon: Activity },
    ],
  },
  {
    label: "Money",
    items: [
      { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "System",
    items: [{ title: "Webhooks", href: "/webhooks", icon: Webhook }],
  },
  {
    label: "Growth",
    items: [
      { title: "Marketing", href: "/marketing", icon: Megaphone },
      { title: "Referrals", href: "/referrals", icon: Gift },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Access Control", href: "/access-control", icon: ShieldCheck },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    "A";

  return (
    <Sidebar className="border-r border-sidebar-border/70">
      <SidebarHeader className="px-4 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-brand/30 via-brand-soft/30 to-success/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border/60 bg-card shadow-sm">
              <Image src="/logo.png" alt="DattaRemit" width={26} height={26} />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              DattaRemit
            </span>
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Admin Console
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-2">
        {navSections.map((section) => (
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          "group/item relative h-9 rounded-lg px-2.5 text-sm font-medium transition-colors " +
                          "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground " +
                          "data-[active=true]:shadow-[inset_0_0_0_1px_oklch(from_var(--brand)_l_c_h/0.15)]"
                        }
                      >
                        <Link href={item.href}>
                          <span
                            aria-hidden
                            className={
                              "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand transition-all " +
                              (isActive
                                ? "opacity-100 scale-y-100"
                                : "opacity-0 scale-y-50 group-hover/item:opacity-40 group-hover/item:scale-y-75")
                            }
                          />
                          <item.icon
                            className={
                              "h-4 w-4 transition-colors " +
                              (isActive
                                ? "text-brand"
                                : "text-muted-foreground group-hover/item:text-foreground")
                            }
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/50 bg-sidebar-accent/40 p-2.5">
                <Avatar className="h-9 w-9 ring-1 ring-sidebar-border">
                  <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {user.fullName ?? "Admin"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className="h-9 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
