/**
 * T-022 — Lógica de tema (AC-044/045).
 *
 * Funções puras que leem/escrevem a preferência de tema no armazenamento,
 * de forma testável. O UI real usa next-themes (que grava em localStorage sob
 * a chave configurada); estas funções modelam a mesma regra de persistência.
 *
 * AC-044: alternar tema muda as cores (a UI cuida) e salva a preferência.
 * AC-045: a preferência persiste entre sessões (logout/login carregam o mesmo).
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function isStoredTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

/** Lê a preferência salva (retorna null se nunca configurada). */
export function getStoredTheme(storage: Pick<Storage, "getItem">): Theme | null {
  const value = storage.getItem(STORAGE_KEY);
  return isStoredTheme(value) ? value : null;
}

/** Salva a preferência de tema escolhida. */
export function setStoredTheme(storage: Pick<Storage, "setItem">, theme: Theme): void {
  storage.setItem(STORAGE_KEY, theme);
}