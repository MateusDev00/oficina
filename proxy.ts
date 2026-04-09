/* eslint-disable @typescript-eslint/no-unused-vars */
// proxy.ts (or middleware.ts)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Optionally add custom logic
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/modulos/:path*',
    '/api/ordens/:path*',
    '/api/admin/:path*',
    
  ],
};