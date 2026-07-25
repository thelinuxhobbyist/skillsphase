import { isClerkConfigured } from "@/lib/clerk-config";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerk = isClerkConfigured();

/** Admin uses local session cookies — never Clerk. */
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/applications(.*)",
  "/settings(.*)",
  "/employer(.*)",
  "/onboarding(.*)",
]);

export default hasClerk
  ? clerkMiddleware(async (auth, req) => {
      if (isAdminRoute(req)) {
        return NextResponse.next();
      }

      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function passthrough() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
