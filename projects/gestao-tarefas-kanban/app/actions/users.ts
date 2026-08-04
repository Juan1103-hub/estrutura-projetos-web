"use server";

import { requireActor } from "@/lib/auth/server-session";
import { UserRole, ROLE_LABELS } from "@/lib/auth/roles";
import { Permission } from "@/lib/auth/roles";
import { listUsers as listDemoUsers } from "@/lib/auth/session";

/**
 * Exige a permissão e retorna uma mensagem de erro se não autorizado.
 * Segue o padrão do projeto: as actions retornam {ok:false} em vez de lançar
 * (diferente do requireActor, que lança). O erro é silencioso — apenas indica
 * que o chamador não tem acesso.
 */
async function authorize(permission: Permission): Promise<string | null> {
  try {
    await requireActor(permission);
    return null;
  } catch {
    return "Não autorizado";
  }
}

/**
 * T-016 — CRUD de usuários (admin).
 *
 * Ações de servidor para o SUPERVISOR gerenciar os usuários do sistema:
 * listar, criar, alterar perfil (role) e excluir.
 *
 * Com Supabase configurado, cria/remove no Supabase Auth via service role
 * (o trigger `handle_new_user` popula `public.users` a partir de
 * `user_metadata`). Sem Supabase (demo), usa um armazenamento em memória.
 *
 * AUI:
 * - AC-054: supervisor lista usuários
 * - AC-055: supervisor cria usuário (nome, e-mail, senha, perfil)
 * - AC-056: supervisor altera o perfil de um usuário
 * - AC-057: supervisor exclui usuário
 */

const USER_ROLES: UserRole[] = [
  "supervisor",
  "almoxarife",
  "comprador",
  "assistente_administrativo",
];

/** Valida um valor de role; cai no fallback se inválido. */
function asRole(value: string | undefined, fallback: UserRole = "almoxarife"): UserRole {
  return value && USER_ROLES.includes(value as UserRole) ? (value as UserRole) : fallback;
}

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return (
    looksLikeUrl &&
    Boolean(key) &&
    key.length > 20 &&
    Boolean(serviceRole) &&
    serviceRole.length > 20 &&
    !placeholder.test(url) &&
    !placeholder.test(key) &&
    !placeholder.test(serviceRole)
  );
}

// ---- Modo demo (em memória) ---------------------------------------------

const DEMO_KEY = "kanban_demo_extra_users";

interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

function readDemo(): DemoUser[] {
  try {
    const raw = (globalThis as any)[DEMO_KEY];
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDemo(users: DemoUser[]) {
  (globalThis as any)[DEMO_KEY] = JSON.stringify(users);
}

// ---- Tipos exportados ---------------------------------------------------

export interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  roleLabel: string;
  created_at: string | null;
}

export interface UserResult {
  ok: boolean;
  user?: ManagedUser;
  error?: string;
}

/** Monta um ManagedUser a partir de uma linha de public.users ou demo. */
function toManagedUser(u: {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string | null;
}): ManagedUser {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    roleLabel: ROLE_LABELS[u.role],
    created_at: u.created_at ?? null,
  };
}

// ---- Ações --------------------------------------------------------------

/** Lista os usuários do sistema (AC-054). Só supervisor. */
export async function listUsers(): Promise<{ ok: boolean; users?: ManagedUser[]; error?: string }> {
  const denied = await authorize("users.manage");
  if (denied) return { ok: false, error: denied };

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin.from("users").select("id, email, full_name, role, created_at").order("created_at");
    if (error) return { ok: false, error: error.message };
    const users = (data ?? []).map((u) => toManagedUser({ ...u, role: asRole(u.role) }));
    return { ok: true, users };
  }

  const demo = listDemoUsers()
    .filter((u) => u.role !== "supervisor" || u.email === "supervisor@vortice.com")
    .map((u, i) => toManagedUser({
      id: u.id,
      email: u.email,
      full_name: u.name,
      role: u.role,
      created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    }));
  const extra = readDemo().map((u) => toManagedUser(u));
  return { ok: true, users: [...extra, ...demo] };
}

/** Cria um usuário real (AC-055). Só supervisor. */
export async function createUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: string;
}): Promise<UserResult> {
  const denied = await authorize("users.manage");
  if (denied) return { ok: false, error: denied };

  const email = input.email?.trim().toLowerCase();
  const fullName = input.fullName?.trim();
  const password = input.password ?? "";
  const role = asRole(input.role);

  if (!email || !/.+@.+\..+/.test(email)) {
    return { ok: false, error: "E-mail inválido" };
  }
  if (!fullName) {
    return { ok: false, error: "O nome é obrigatório" };
  }
  if (password.length < 6) {
    return { ok: false, error: "A senha deve ter pelo menos 6 caracteres" };
  }

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error) return { ok: false, error: error.message };
    const u = data.user;
    if (!u) return { ok: false, error: "Não foi possível criar o usuário" };
    return {
      ok: true,
      user: toManagedUser({
        id: u.id,
        email: u.email ?? email,
        full_name: fullName,
        role,
        created_at: u.created_at ?? null,
      }),
    };
  }

  // Demo
  const extra = readDemo();
  const exists = [...extra, ...listDemoUsers()].some((u) => u.email === email);
  if (exists) return { ok: false, error: "Já existe um usuário com este e-mail" };
  const id = `u-demo-${Date.now()}`;
  const demoUser: DemoUser = { id, email, full_name: fullName, role, created_at: new Date().toISOString() };
  extra.push(demoUser);
  writeDemo(extra);
  return { ok: true, user: toManagedUser(demoUser) };
}

/** Altera o perfil (role) de um usuário (AC-056). Só supervisor. */
export async function updateUserRole(input: { id: string; role: string }): Promise<UserResult> {
  const denied = await authorize("users.manage");
  if (denied) return { ok: false, error: denied };
  const role = asRole(input.role);

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("users")
      .update({ role })
      .eq("id", input.id)
      .select("id, email, full_name, role, created_at")
      .single();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Usuário não encontrado" };
    return { ok: true, user: toManagedUser({ ...data, role }) };
  }

  const extra = readDemo();
  const idx = extra.findIndex((u) => u.id === input.id);
  if (idx === -1) return { ok: false, error: "Usuário não encontrado" };
  extra[idx] = { ...extra[idx], role };
  writeDemo(extra);
  return { ok: true, user: toManagedUser(extra[idx]) };
}

/** Exclui um usuário (AC-057). Só supervisor. */
export async function deleteUser(input: { id: string }): Promise<{ ok: boolean; error?: string }> {
  const denied = await authorize("users.manage");
  if (denied) return { ok: false, error: denied };

  if (isSupabaseConfigured()) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(input.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const extra = readDemo();
  const next = extra.filter((u) => u.id !== input.id);
  if (next.length === extra.length) return { ok: false, error: "Usuário não encontrado" };
  writeDemo(next);
  return { ok: true };
}
