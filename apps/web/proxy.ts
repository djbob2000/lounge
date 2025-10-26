import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/uploadthing',
  '/:categorySlug',
  '/:categorySlug/:albumSlug',
  '/api/debug-user',
]);

// Create configured middleware
const middleware = clerkMiddleware(async (auth, req) => {
  // Bypass public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For /admin routes, ensure user is authenticated
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { userId, redirectToSignIn } = await auth();

    if (!userId) {
      return redirectToSignIn();
    }
  }

  return NextResponse.next();
}, {});

// Expose proxy for use in Next.js
export function proxy(request: NextRequest, event: NextFetchEvent) {
  return middleware(request, event);
}

// Configure Next.js proxy
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
