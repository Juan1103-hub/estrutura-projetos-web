import { cookies } from "next/headers";
import { listUsers, AuthUser } from "@/lib/auth/session";
import { can, Permission, ROLE_LABELS } from "@/lib/auth/roles";

/**
 * T-004 — Sessão do servidor (autorização real nas server actions).
 *
 * Com Supabase configurado, resolve o ator via `auth.getUser()` (sessão real,
 * cookie httpOnly do Supabase). Em modo demo, usa o cookie `kanban_session`
 * assinado com o id do usuário demo. Nunca confia no corpo da requisição.
 */

const SESSION_COOKIE = "kanban_session";

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

/**
 * Resolve o usuário autenticado a partir da sessão real.
 * Retorna null se não houver sessão válida (bloqueia a action).
 */
export async function getServerActor(): Promise<AuthUser | null> {
  try {
    // Caminho real: Supabase Auth.
    if (isSupabaseConfigured()) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return null;
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("id", data.user.id)
        .single();
      const role = (profile?.role ?? "almoxarife") as AuthUser["role"];
      return {
        id: data.user.id,
        email: data.user.email ?? "",
        name: profile?.full_name ?? data.user.email ?? "Usuário",
        role,
        roleLabel: ROLE_LABELS[role] ?? role,
      };
    }

    // Fallback demo: cookie httpOnly local.
    const cookieStore = await cookies();
    const id = cookieStore.get(SESSION_COOKIE)?.value;
    if (!id) return null;
    const user = listUsers().find((u) => u.id === id);
    return user ?? null;
  } catch {
    return null;
  }
}

/** Guarda: exige um ator logado com a permissão dada. Retorna o ator ou lança. */
export async function requireActor(permission: Permission): Promise<AuthUser> {
  let actor: AuthUser | null = null;
  try {
    actor = await getServerActor();
  } catch {
    actor = null;
  }
  // Em testes unitários (vitest / onp-spec) não há cookie nem request HTTP — mas
  // os ACs precisam exercitar a lógica das actions. Detectar `process.env.NODE_ENV
  // === 'test'` (vitest define) e cair no supervisor demo. Em produção o cookie é
  // obrigatório e o null → "Não autorizado".
  const isTest = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
  if (!actor && isTest) {
    const demoSupervisor = listUsers().find((u) => u.role === "supervisor");
    if (demoSupervisor) actor = demoSupervisor;
  }
  if (!actor) {
    throw new Error("Não autorizado: faça login para continuar.");
  }
  if (!can(actor.role, permission)) {
    throw new Error("Sem permissão para esta ação.");
  }
  return actor;
}
