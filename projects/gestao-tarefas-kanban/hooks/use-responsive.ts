"use client";

import { useEffect, useState } from "react";
import { viewModeForWidth, ViewMode, shouldStackColumns } from "@/lib/responsive/breakpoints";

/**
 * T-023 — Hook responsivo.
 *
 * Observa a largura da viewport e expõe o modo de visualização (mobile/tablet/
 * desktop). Atualiza ao redimensionar e funciona em SSR com um valor inicial
 * seguro (desktop).
 */
export function useResponsive(): { width: number; mode: ViewMode; stack: boolean } {
  const [width, setWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    width,
    mode: viewModeForWidth(width),
    stack: shouldStackColumns(width),
  };
}