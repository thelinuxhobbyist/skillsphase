import {
  getClerkSignInUrl,
  getClerkSignUpUrl,
  isClerkMiddlewareEnabled,
} from "@/lib/clerk-config";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerk = isClerkMiddlewareEnabled();

/** Admin uses local session cookies — never Clerk. */
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/contacts(.*)",
  "/settings(.*)",
  "/employer(.*)",
  "/onboarding(.*)",
]);

export default hasClerk
  ? clerkMiddleware(
      async (auth, req) => {
        if (isAdminRoute(req)) {
          return NextResponse.next();
        }

        if (isProtectedRoute(req)) {
          const { userId, redirectToSignIn } = await auth();
          // auth.protect() answers 404 for signed-out page requests; send people
          // to sign-in and back to where they were heading instead.
          if (!userId) {
            return redirectToSignIn({ returnBackUrl: req.url });
          }
        }
      },
      {
        signInUrl: getClerkSignInUrl(),
        signUpUrl: getClerkSignUpUrl(),
      },
    )
  : function passthrough() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
