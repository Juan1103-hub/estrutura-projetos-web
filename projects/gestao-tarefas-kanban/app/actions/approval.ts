"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActor } from "@/lib/auth/server-session";
import { TaskWithRelations } from "@/types/task";

/**
 * T-014 — Aprovar/reprovar tarefas.
 *
 * Fluxo de aprovação do supervisor:
 * - Aprovar: tarefa vai pra "Concluído", notifica o responsável, trava edição.
 * - Reprovar: tarefa volta pra "Em Andamento", notifica com justificativa.
 *
 * No modo demo (sem Supabase), atualiza o estado em memória para demonstração.
 */

const SESSION_KEY = "kanban_demo_approvals";

interface ApprovalState {
  [taskId: string]: {
    status: "concluido" | "em_andamento";
    rejection_reason?: string;
    rejected_by?: string;
    approved_by?: string;
    approved_at?: string;
  };
}

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

function readState(): ApprovalState {
  try {
    const raw = (globalThis as any)[SESSION_KEY];
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeState(state: ApprovalState) {
  (globalThis as any)[SESSION_KEY] = JSON.stringify(state);
}

/**
 * Aprova uma tarefa. Só supervisor pode aprovar.
 * Retorna a tarefa atualizada (com status "concluído").
 */
export async function approveTask(input: {
  taskId: string;
}): Promise<{ success: boolean; task?: TaskWithRelations; error?: string }> {
  // Autorização real: só supervisor pode aprovar (tasks.approve). O ator vem
  // do cookie httpOnly, não do corpo da requisição.
  const actor = await requireActor("tasks.approve");

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "concluido",
        approved_at: new Date().toISOString(),
        approved_by: actor.id,
      })
      .eq("id", input.taskId);
    if (error) return { success: false, error: error.message };
    // TODO T-015: emitir notificação ao responsável.
    return { success: true };
  }

  // Modo demo: atualiza estado em memória
  const state = readState();
  state[input.taskId] = {
    status: "concluido",
    approved_by: actor.id,
    approved_at: new Date().toISOString(),
  };
  writeState(state);
  return { success: true };
}

/**
 * Reprova uma tarefa com justificativa. Só supervisor pode reprovar.
 * A tarefa volta para "Em Andamento" para o responsável continuar.
 */
export async function rejectTask(input: {
  taskId: string;
  reason: string;
}): Promise<{ success: boolean; task?: TaskWithRelations; error?: string }> {
  const reason = input.reason?.trim();
  if (!reason) {
    return { success: false, error: "Justificativa é obrigatória" };
  }
  // Autorização real: só supervisor pode reprovar (tasks.approve).
  const actor = await requireActor("tasks.approve");

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "em_andamento",
        rejection_reason: reason,
        approved_at: null,
        approved_by: null,
        rejected_by: actor.id,
      })
      .eq("id", input.taskId);
    if (error) return { success: false, error: error.message };
    // TODO T-015: emitir notificação ao responsável com a justificativa.
    return { success: true };
  }

  // Modo demo
  const state = readState();
  state[input.taskId] = {
    status: "em_andamento",
    rejection_reason: reason,
    rejected_by: actor.id,
  };
  writeState(state);
  return { success: true };
}

/**
 * Retorna o estado de aprovação de uma tarefa (se foi aprovada/reprovada na sessão).
 */
export async function getApprovalState(taskId: string): Promise<{
  status?: "concluido" | "em_andamento";
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
}> {
  const state = readState();
  return state[taskId] ?? {};
}
