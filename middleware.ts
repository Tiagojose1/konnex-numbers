// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica se existe um cookie de sessão do Supabase
  const hasSession = request.cookies.getAll().some(cookie => cookie.name.includes('auth-token'));

  const path = request.nextUrl.pathname;
  
  // Rotas que precisam de login
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/pedidos') || 
                           path.startsWith('/saldo') || 
                           path.startsWith('/perfil') || 
                           path.startsWith('/historico') ||
                           path.startsWith('/servicos');

  // Se tentar aceder a uma rota protegida sem sessão, vai para o Login
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};