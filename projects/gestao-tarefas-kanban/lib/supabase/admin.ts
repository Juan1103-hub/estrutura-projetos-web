import { createClient } from "@supabase/supabase-js";

/**
 * T-016 — Client de administração do Supabase (service role).
 *
 * Usa a `SUPABASE_SERVICE_ROLE_KEY` para operações de admin (criar/excluir
 * usuários no Auth, contornar RLS quando necessário). NUNCA importe este
 * módulo num componente client — a service role dá acesso total ao banco e
 * deve existir apenas no servidor (server actions).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(url, serviceRole);
}
