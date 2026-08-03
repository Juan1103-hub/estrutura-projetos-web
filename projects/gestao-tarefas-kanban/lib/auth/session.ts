import { UserRole, ROLE_LABELS } from "@/lib/auth/roles";

/**
 * T-004 — Autenticação (AC-012/AC-013).
 *
 * Lógica de login em modo demo: valida credenciais contra uma lista de
 * usuários conhecidos. Em produção isso vira Supabase Auth (signInWithPassword).
 *
 * AC-012: credenciais válidas → login OK (redireciona + mostra nome).
 * AC-013: credenciais inválidas → "E-mail ou senha incorretos".
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
}

/** Usuários demo (sem senha real; validação simples). */
const DEMO_USERS: { email: string; password: string; id: string; name: string; role: UserRole }[] = [
  { email: "supervisor@vortice.com", password: "123456", id: "u-sup", name: "Maria Santos", role: "supervisor" },
  { email: "joao@vortice.com", password: "123456", id: "u-joao", name: "João Silva", role: "almoxarife" },
  { email: "carlos@vortice.com", password: "123456", id: "u-carlos", name: "Carlos Oliveira", role: "comprador" },
  { email: "ana@vortice.com", password: "123456", id: "u-ana", name: "Ana Costa", role: "assistente_administrativo" },
];

export interface LoginResult {
  ok: boolean;
  user?: AuthUser;
  error?: string;
}

/** Valida credenciais. AC-013: credenciais erradas → erro. */
export function authenticate(email: string, password: string): LoginResult {
  const found = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) {
    return { ok: false, error: "E-mail ou senha incorretos" };
  }
  return {
    ok: true,
    user: {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
      roleLabel: ROLE_LABELS[found.role],
    },
  };
}

/** Lista os e-mails demo (para a tela de login sugerir). */
export function demoAccounts(): string[] {
  return DEMO_USERS.map((u) => u.email);
}

/** Lista os usuários demo (para o supervisor atribuir tarefas no formulário). */
export function listUsers(): AuthUser[] {
  return DEMO_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    roleLabel: ROLE_LABELS[u.role],
  }));
}