// proxy.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Log opcional para ver o token (útil para depuração)
    console.log('[Middleware] Path:', req.nextUrl.pathname);
    console.log('[Middleware] Token exists:', !!req.nextauth.token);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permite acesso apenas se o token existir (utilizador autenticado)
        const isAuthorized = !!token;
        console.log('[Middleware] Authorized:', isAuthorized);
        return isAuthorized;
      },
    },
  }
);

export const config = {
  matcher: [
    '/modulos/:path*',       // Protege todos os módulos
    '/api/ordens/:path*',    // Protege APIs de ordens
    '/api/admin/:path*',     // Protege APIs administrativas
    // Não inclua '/api/auth' para não interferir com autenticação
  ],
};