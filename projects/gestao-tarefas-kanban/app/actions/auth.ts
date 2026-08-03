"use server";

import { cookies } from "next/headers";
import { authenticate } from "@/lib/auth/session";
import { AuthUser } from "@/lib/auth/session";

/**
 * T-004 — Login real no servidor.
 *
 * Valida credenciais demo e grava um cookie httpOnly (`kanban_session`)
 * com o id do usuário. As server actions (aprovação, edição, comentário)
 * resolvem o ator por esse cookie — nunca pelo corpo da requisição.
 *
 * AC-012: credenciais válidas → sessão criada.
 * AC-013: credenciais inválidas → erro.
 */
export async function login(email: string, password: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  const result = authenticate(email, password);
  if (!result.ok || !result.user) {
    return { ok: false, error: result.error };
  }
  const cookieStore = await cookies();
  cookieStore.set("kanban_session", result.user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 7 dias — suficiente para a sessão demo.
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true, user: result.user };
}

/** Encerra a sessão: remove o cookie httpOnly. */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("kanban_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
