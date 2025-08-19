import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public pages (no login required)
const isPublicRoute = createRouteMatcher([
  '/sign-in',
  '/sign-up',
  '/home',
  '/', // homepage
]);

// Public API routes
const isPublicApiRoute = createRouteMatcher([
  '/api/videos',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const pathname = currentUrl.pathname;

  const isAccessingDashboard = pathname === '/home';
  const isApiRequest = pathname.startsWith('/api');

  

  // If logged in
  if (userId) {
    if (isPublicRoute(req) && !isAccessingDashboard) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
    return NextResponse.next();
  }

  // If not logged in
  if (!isPublicApiRoute(req) && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (isApiRequest && !isPublicApiRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|app|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
