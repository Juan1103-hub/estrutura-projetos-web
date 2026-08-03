import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege as rotas autenticadas. O cookie de sessão (`kanban_session`) é
 * httpOnly — só existe quando o login real ocorreu. Sem ele, redireciona para
 * /login. Isso elimina o vetor "abrir /kanban sem login assume supervisor".
 */
const PROTECTED = ["/kanban", "/dashboard", "/export"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("kanban_session")?.value);

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
  matcher: ["/kanban/:path*", "/dashboard/:path*", "/export/:path*"],
};
