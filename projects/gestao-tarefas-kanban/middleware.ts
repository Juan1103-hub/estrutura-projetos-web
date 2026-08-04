import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege as rotas autenticadas. Reconhece a sessão:
 * - Supabase Auth (cookies `sb-*`, quando configurado) — via Supabase SSR middleware;
 * - fallback demo (`kanban_session` httpOnly) quando sem Supabase.
 * Sem sessão, redireciona para /login. Isso elimina o vetor "abrir /kanban
 * sem login assume supervisor".
 */
const PROTECTED = ["/kanban", "/dashboard", "/export", "/usuarios", "/perfil"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allCookies = request.cookies.getAll();
  const hasSupabaseSession = allCookies.some(
    (c) => c.name.startsWith("sb-") && Boolean(c.value)
  );
  const hasDemoSession = Boolean(request.cookies.get("kanban_session")?.value);
  const hasSession = hasSupabaseSession || hasDemoSession;

  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Aplica nas rotas protegidas e nas estáticas necessárias.
  matcher: ["/kanban/:path*", "/dashboard/:path*", "/export/:path*", "/usuarios/:path*", "/perfil/:path*"],
};
