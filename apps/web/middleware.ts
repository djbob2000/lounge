import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware для захисту адмін-маршрутів та інтеграції з Clerk
 */
export default authMiddleware({
  /**
   * Список маршрутів, які не потребують аутентифікації
   */
  publicRoutes: [
    "/",
    "/api/webhook/clerk",
    "/:categorySlug",
    "/:categorySlug/:albumSlug",
  ],

  /**
   * Функція для визначення, чи має користувач доступ до адмін-маршрутів
   */
  async afterAuth(auth, req, evt) {
    // Доступ до API дозволений лише для аутентифікованих запитів
    if (
      req.nextUrl.pathname.startsWith("/api/") &&
      !req.nextUrl.pathname.startsWith("/api/webhook/") &&
      !auth.isPublicRoute &&
      !auth.userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Маршрути адміністратора потребують аутентифікації
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!auth.userId) {
        const loginUrl = new URL("/sign-in", req.url);
        loginUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Опціонально: перевірка ролі користувача
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
 * Конфігурація для middleware
 */
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
