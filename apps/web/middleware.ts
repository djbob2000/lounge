import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for protecting admin routes and integrating with Clerk
 */
export default authMiddleware({
  /**
   * List of routes that do not require authentication
   */
  publicRoutes: [
    "/",
    "/api/webhook/clerk",
    "/:categorySlug",
    "/:categorySlug/:albumSlug",
  ],

  /**
   * Function to determine if a user has access to admin routes
   */
  async afterAuth(auth, req, evt) {
    // API access is allowed only for authenticated requests
    if (
      req.nextUrl.pathname.startsWith("/api/") &&
      !req.nextUrl.pathname.startsWith("/api/webhook/") &&
      !auth.isPublicRoute &&
      !auth.userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin routes require authentication
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!auth.userId) {
        const loginUrl = new URL("/sign-in", req.url);
        loginUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Optional: checking user role
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        const isAdmin = user.privateMetadata.role === "admin";

        if (!isAdmin) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
});

/**
 * Configuration for middleware
 */
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
