"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { AppNotification } from "@/lib/notifications/realtime";

/**
 * Notificações ligadas a uma tarefa (T-015).
 *
 * Cria uma notificação REAL no banco (`notifications`), o que dispara o
 * Supabase Realtime para o sino do usuário. O destinatário é quem está
 * "ligado ao perfil" da tarefa: responsável principal, responsáveis adicionais
 * e o solicitante. Usa o service_role (bypass RLS) porque o INSERT em
 * `notifications` é controlado pela policy "System can create notifications".
 */

/** Busca os envolvidos (responsável + adicionais + solicitante) de uma tarefa. */
export async function getTaskStakeholders(taskId: string): Promise<string[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("responsible_id, responsible_ids, requester_id")
      .eq("id", taskId)
      .single();
    if (error || !data) return [];
    const ids = new Set<string>();
    if (data.responsible_id) ids.add(data.responsible_id);
    (data.responsible_ids ?? []).forEach((id: string) => ids.add(id));
    if (data.requester_id) ids.add(data.requester_id);
    return [...ids];
  } catch {
    return [];
  }
}

export interface TaskEventInput {
  taskId: string;
  type: AppNotification["type"];
  title: string;
  message: string;
  /** Quem gerou o evento (não recebe a própria notificação). */
  excludeUserId?: string;
}

/**
 * Notifica todos os envolvidos na tarefa, exceto o autor do evento.
 * Cada envolvido recebe uma linha na tabela `notifications` → Realtime.
 */
export async function notifyTaskStakeholders(input: TaskEventInput): Promise<void> {
  const userIds = await getTaskStakeholders(input.taskId);
  const targets = userIds.filter((id) => id !== input.excludeUserId);
  if (targets.length === 0) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from("notifications").insert(
    targets.map((userId) => ({
      user_id: userId,
      task_id: input.taskId,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
    }))
  );
  if (error) {
    console.error("Erro ao criar notificação de tarefa:", error);
  }
}
