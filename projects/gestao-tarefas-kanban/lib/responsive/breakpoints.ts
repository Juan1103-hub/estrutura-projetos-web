/**
 * T-023 — Layout responsivo (AC-052/AC-053).
 *
 * Funções puras que decidem o modo de visualização do quadro a partir da
 * largura da tela. Testáveis de forma isolada.
 *
 * - `>= tablet (768px)`: colunas lado a lado com scroll horizontal suave.
 * - `< mobile (375px)`: modo simplificado com colunas empilhadas verticalmente.
 */

export type ViewMode = "mobile" | "tablet" | "desktop";

export const TABLET_MIN = 768; // px
export const DESKTOP_MIN = 1024; // px

/** Decide o modo de visualização a partir da largura (em px). */
export function viewModeForWidth(width: number): ViewMode {
  if (width < TABLET_MIN) return "mobile";
  if (width < DESKTOP_MIN) return "tablet";
  return "desktop";
}

/** No mobile, o quadro empilha as colunas verticalmente (AC-053).
 * No tablet, mantém colunas lado a lado com scroll horizontal reversível (AC-052). */
export function shouldStackColumns(width: number): boolean {
  return viewModeForWidth(width) === "mobile";
}