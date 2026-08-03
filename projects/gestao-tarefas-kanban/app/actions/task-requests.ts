"use server";

import { requireActor } from "@/lib/auth/server-session";

/**
 * T-024 — Solicitar apoio e reabertura (AC-048/AC-049).
 *
 * Ações para o operacional pedir ajuda numa tarefa travada ou pedir
 * reabertura de uma concluída que tem erro. A justificativa fica registrada
 * na tarefa para o supervisor ver.
 *
 * - AC-048: solicitar apoio → flag "Apoio Solicitado" + justificativa.
 * - AC-049: solicitar reabertura → flag de reabertura + justificativa.
 *
 * Modo demo em memória (mesmo padrão das demais ações).
 */

const SESSION_KEY = "kanban_demo_requests";

export interface RequestResult {
  ok: boolean;
  error?: string;
  /** estado atualizado do pedido */
  state?: {
    help_requested?: boolean;
    help_reason?: string | null;
    reopen_requested?: boolean;
    reopen_reason?: string | null;
  };
}

function readSession(): Record<string, RequestResult["state"]> {
  try {
    const raw = (globalThis as any)[SESSION_KEY];
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSession(byId: Record<string, RequestResult["state"]>) {
  (globalThis as any)[SESSION_KEY] = JSON.stringify(byId);
}

function validateReason(reason?: string): string | null {
  const r = reason?.trim();
  if (!r) return "Justificativa é obrigatória";
  return null;
}

/** Solicita apoio numa tarefa (AC-048). Exige justificativa. */
export async function requestHelp(input: {
  taskId: string;
  reason: string;
}): Promise<RequestResult> {
  const invalid = validateReason(input.reason);
  if (invalid) return { ok: false, error: invalid };
  // Autorização real: usuário logado (em produção, gate por canModifyTask).
  await requireActor("tasks.edit");

  const state = readSession();
  state[input.taskId] = {
    ...state[input.taskId],
    help_requested: true,
    help_reason: input.reason.trim(),
  };
  writeSession(state);
  // TODO T-015: notificar supervisor.
  return { ok: true, state: state[input.taskId] };
}

/** Solicita reabertura de tarefa concluída (AC-049). Exige justificativa. */
export async function requestReopen(input: {
  taskId: string;
  reason: string;
}): Promise<RequestResult> {
  const invalid = validateReason(input.reason);
  if (invalid) return { ok: false, error: invalid };
  // Autorização real: usuário logado (em produção, gate por canModifyTask).
  await requireActor("tasks.edit");

  const state = readSession();
  state[input.taskId] = {
    ...state[input.taskId],
    reopen_requested: true,
    reopen_reason: input.reason.trim(),
  };
  writeSession(state);
  // TODO T-015: notificar supervisor.
  return { ok: true, state: state[input.taskId] };
}

/** Lê o estado de pedidos de uma tarefa. */
export async function getRequestState(taskId: string): Promise<RequestResult["state"]> {
  const state = readSession();
  return state[taskId] ?? {};
}