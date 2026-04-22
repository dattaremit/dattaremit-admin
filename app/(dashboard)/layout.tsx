import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role =
    (sessionClaims as { publicMetadata?: { role?: string } } | null)?.publicMetadata?.role;
  if (role !== "admin") redirect("/sign-in");

  return <DashboardShell>{children}</DashboardShell>;
}
