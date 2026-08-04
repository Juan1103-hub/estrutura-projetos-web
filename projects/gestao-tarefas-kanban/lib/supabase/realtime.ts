"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * T-015 — Client Supabase com Realtime habilitado (browser).
 *
 * Usa a anon key (segura no client) e expõe helpers para subscription ao
 * canal `notifications`. O RLS do Supabase garante que cada usuário só vê
 * as próprias notificações.
 */

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Retorna o client browser do Supabase (singleton). Reutiliza a instância
 * para evitar múltiplas conexões Realtime.
 */
export function getBrowserClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) {
    // Sem Supabase configurado — retorna null para o hook fazer fallback.
    return null;
  }
  client = createBrowserClient(url, key);
  return client;
}

export interface NotificationPayload {
  id: string;
  user_id: string;
  task_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

/**
 * Assina o canal `notifications` filtrando pelo usuário logado.
 * Retorna o canal para unsubscribe posterior.
 *
 * @param userId - ID do usuário autenticado (auth.uid())
 * @param onInsert - callback quando uma nova notificação é inserida
 * @param onUpdate - callback quando uma notificação é atualizada (ex: marcada como lida)
 */
export function subscribeNotifications(
  userId: string,
  onInsert: (notification: NotificationPayload) => void,
  onUpdate?: (notification: NotificationPayload) => void
): RealtimeChannel | null {
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const n = payload.new as NotificationPayload;
        onInsert(n);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const n = payload.new as NotificationPayload;
        onUpdate?.(n);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`[realtime] Inscrito em notifications:${userId}`);
      } else if (status === "CHANNEL_ERROR") {
        console.warn(`[realtime] Erro ao inscrever em notifications:${userId}`);
      }
    });

  return channel;
}

/**
 * Remove a subscription do canal.
 */
export function unsubscribeNotifications(channel: RealtimeChannel | null): void {
  if (!channel) return;
  const supabase = getBrowserClient();
  if (!supabase) return;
  supabase.removeChannel(channel);
}
