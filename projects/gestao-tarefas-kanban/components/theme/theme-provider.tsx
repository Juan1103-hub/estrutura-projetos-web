"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * T-022 — Provedor de tema (claro/escuro).
 *
 * Envolve o app com next-themes, que persiste a preferência e evita o flash
 * de tema incorreto durante a hidratação. `attribute="class"` faz o dark
 * mode via classe `.dark` no <html> (como nosso globals.css define).
 *
 * A preferência de tema é POR PERFIL: cada usuário tem sua própria chave no
 * localStorage (ex: `theme:u-sup`, `theme:u-joao`). Assim, "deixar mais claro"
 * num perfil não afeta o outro. O usuário é lido de `kanban_session_user`
 * (mesma origem do board). Sem usuário, cai no tema global (público).
 */
function getStorageKey(): string {
  if (typeof window === "undefined") return "theme";
  try {
    const raw = window.localStorage.getItem("kanban_session_user");
    if (raw) {
      const user = JSON.parse(raw) as { id?: string };
      if (user?.id) return `theme:${user.id}`;
    }
  } catch {
    // localStorage indisponível ou JSON inválido — usa chave global.
  }
  return "theme";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storageKey = getStorageKey();
  return (
    // `key={storageKey}` força o next-themes a re-montar quando o usuário muda
    // (login/logout/troca de perfil), relendo a preferência daquele perfil.
    <NextThemesProvider
      key={storageKey}
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}