import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

// Server-side admin-role guard. The claim lives at
// sessionClaims.publicMetadata.role and must be provisioned per admin user
// via the Clerk Dashboard (or users.updateUser). Falling back to sign-in
// fails closed: the separate server-side requireRole("ADMIN") middleware
// in the API still blocks unauthorized API calls.
export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const { userId, sessionClaims } = await auth.protect();

  const role =
    (sessionClaims as { publicMetadata?: { role?: string } } | null)?.publicMetadata?.role;

  if (!userId || role !== "admin") {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
