"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * T-022 — Provedor de tema (claro/escuro).
 *
 * Envolve o app com next-themes, que persiste a preferência e evita o flash
 * de tema incorreto durante a hidratação. `attribute="class"` faz o dark
 * mode via classe `.dark` no <html> (como nosso globals.css define).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}