import type { Metadata } from "next";
import { headers } from "next/headers";
import { Poppins, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DattaRemit Admin",
  description: "Admin dashboard for DattaRemit",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <ClerkProvider nonce={nonce}>
      <html lang="en">
        <body
          className={`${poppins.variable} ${geistMono.variable} antialiased`}
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
