"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { setTokenGetter, api } from "@/lib/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShieldX, LogOut, WifiOff } from "lucide-react";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const breadcrumbs = useBreadcrumbs();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    setTokenGetter(() => getTokenRef.current());

    let cancelled = false;

    async function verifyAdmin() {
      try {
        const token = await getTokenRef.current();
        if (!token) {
          if (!cancelled) {
            setAuthError("No auth token received. Please sign out and sign in again.");
            setIsAdmin(false);
          }
          return;
        }
        await api.getDashboardStats();
        if (!cancelled) setIsAdmin(true);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unknown error";
          setAuthError(message);
          setIsAdmin(false);
        }
      }
    }

    verifyAdmin();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    const isAuthError = authError === "Unauthorized" || authError === "Forbidden";
    const isTokenError = authError?.startsWith("No auth token");
    const isNetworkError = authError && !isAuthError && !isTokenError;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center text-center space-y-6 max-w-md">
          <Image src="/logo.png" alt="DattaRemit" width={56} height={56} priority />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            {isNetworkError ? (
              <WifiOff className="h-7 w-7 text-destructive" />
            ) : (
              <ShieldX className="h-7 w-7 text-destructive" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {isNetworkError ? "Connection Error" : "Access Denied"}
            </h1>
            <p className="text-muted-foreground">
              {isNetworkError
                ? "Unable to reach the server. Please check your internet connection and try again."
                : `Sorry${user?.firstName ? `, ${user.firstName}` : ""}. Your account does not have admin privileges. If you believe this is a mistake, please contact an administrator to request access.`}
            </p>
            {authError && !isNetworkError && (
              <p className="text-xs text-destructive mt-2">
                Error: {authError}
              </p>
            )}
          </div>
          {user?.primaryEmailAddress && (
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user.primaryEmailAddress.emailAddress}</span>
            </p>
          )}
          <div className="flex gap-3">
            {isNetworkError && (
              <Button
                variant="default"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-ambient">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <Breadcrumb>
            <BreadcrumbList className="gap-1.5">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb) => (
                <span key={crumb.label} className="contents">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              All systems normal
            </span>
          </div>
        </header>
        <main className="relative flex-1 p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
            <div
              className="ambient-blob"
              style={{
                top: "-120px",
                left: "-80px",
                width: "420px",
                height: "420px",
                background:
                  "radial-gradient(circle at 30% 30%, oklch(from var(--brand) l c h / 0.18), transparent 70%)",
              }}
            />
            <div
              className="ambient-blob"
              style={{
                top: "-160px",
                right: "-120px",
                width: "520px",
                height: "520px",
                background:
                  "radial-gradient(circle at 70% 30%, oklch(from var(--success) l c h / 0.14), transparent 70%)",
              }}
            />
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
