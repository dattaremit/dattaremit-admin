import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

function apiOrigin(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const api = apiOrigin();

  const scriptSrc = isDev
    ? "'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://challenges.cloudflare.com"
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`;

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://img.clerk.com https:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${api} https://*.clerk.accounts.dev https://clerk-telemetry.com https://api.clerk.com wss://*.clerk.accounts.dev`,
    `frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ];

  if (!isDev) directives.push(`upgrade-insecure-requests`);

  return directives.join("; ").replace(/\s{2,}/g, " ").trim();
}

// Auth gate: requires a signed-in user. Admin role is enforced server-side
// against the DB via requireRole("ADMIN") in the API; DashboardShell calls
// /admin/stats on mount and surfaces "Access Denied" on 403.
export default clerkMiddleware(async (auth, request) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const withCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
