import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about(.*)',
  '/faq(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/how-it-works(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/cron(.*)', // Keep cron public for Vercel, but secured by secret
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Handle Clerk Auth - Redirect to sign-in if not public
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 2. Add Security Headers (CSP)
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.io https://*.clerk.dev https://*.clerk.accounts.dev https://us.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co https://*.clerk.dev https://*.clerk.accounts.dev https://api.clerk.dev https://us.i.posthog.com https://*.sentry.io https://generativelanguage.googleapis.com",
      "frame-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev",
      "worker-src 'self' blob:",
    ].join('; ')
  );

  return response;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
