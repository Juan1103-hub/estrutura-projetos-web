"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { AuthUser } from "@/lib/auth/session";

/**
 * T-004 — Login real no servidor.
 *
 * Com Supabase configurado, autentica via `signInWithPassword` (Supabase Auth)
 * e o cliente SSR gerencia a sessão (cookie httpOnly). As server actions
 * resolvem o ator por essa sessão.
 *
 * Sem Supabase (demo), valida contra os usuários demo e grava um cookie
 * httpOnly `kanban_session` com o id do usuário.
 *
 * AC-012: credenciais válidas → sessão criada.
 * AC-013: credenciais inválidas → erro.
 */

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

export async function login(email: string, password: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  // Caminho real: Supabase Auth.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "E-mail ou senha incorretos" };
    }
    // Resolve o perfil (nome/role) na tabela public.users.
    const user = data.user;
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    // O role no banco é o valor cru do enum; o roleLabel é o nome amigável
    // (ex: "supervisor" → "Supervisor"). Sem isso o localStorage guarda o
    // valor cru e causa mismatch de hydration no header do board.
    const role = (profile?.role ?? "almoxarife") as keyof typeof ROLE_LABELS;
    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email ?? email,
        name: profile?.full_name ?? user.email ?? email,
        role: role as AuthUser["role"],
        roleLabel: ROLE_LABELS[role] ?? role,
      },
    };
  }

  // Fallback demo: usuários locais.
  const { authenticate } = await import("@/lib/auth/session");
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
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const cookieStore = await cookies();
  cookieStore.set("kanban_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Lista usuários para o formulário de criação (demo ou Supabase). */
export async function listUsersForCreate(): Promise<AuthUser[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("users").select("id, email, full_name, role");
    return (data ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.full_name,
      role: u.role,
      roleLabel: u.role,
    }));
  }
  return listUsers();
}
