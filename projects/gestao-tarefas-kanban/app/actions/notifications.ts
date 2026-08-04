"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppNotification } from "@/lib/notifications/realtime";

/**
 * Server actions para notificações (T-015).
 *
 * Integra o sistema de notificações com o Supabase Realtime.
 * - fetchUnreadNotifications: busca notificações não lidas do banco
 * - markNotificationRead: marca uma notificação como lida
 * - markAllNotificationsRead: marca todas como lidas
 * - createNotification: cria notificação no banco (dispara Realtime)
 */

/**
 * Busca notificações não lidas do usuário logado.
 * Retorna as últimas 20 (mais recentes primeiro).
 */
export async function fetchUnreadNotifications(): Promise<AppNotification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, task_id, type, title, message, read, created_at")
    .eq("user_id", user.id)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    taskId: row.task_id || undefined,
    type: row.type as AppNotification["type"],
    title: row.title,
    body: row.message,
    read: row.read,
    createdAt: row.created_at,
  }));
}

/**
 * Marca uma notificação específica como lida.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    throw new Error("Não foi possível marcar como lida");
  }
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    throw new Error("Não foi possível marcar todas como lidas");
  }
}

/**
 * Cria uma notificação no banco (dispara Realtime para o usuário).
 * Usa service_role para bypass do RLS de INSERT.
 */
export async function createNotification(input: {
  userId: string;
  taskId?: string;
  type: AppNotification["type"];
  title: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    task_id: input.taskId || null,
    type: input.type,
    title: input.title,
    message: input.message,
    read: false,
  });

  if (error) {
    console.error("Erro ao criar notificação:", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
