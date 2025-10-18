import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
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

// Expose middleware for use in Next.js
export default clerkMiddleware(async (auth, req) => {
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
});

// Configure Next.js middleware
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
