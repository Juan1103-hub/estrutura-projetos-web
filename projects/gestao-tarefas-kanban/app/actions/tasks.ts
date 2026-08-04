"use server";

import { createClient } from "@/lib/supabase/server";
import { listUsers } from "@/lib/auth/session";
import { requireActor } from "@/lib/auth/server-session";
import { mockTasks } from "@/lib/mock-data";
import {
  TaskWithRelations,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  ChecklistItem,
  TASK_STATUS_LABELS,
} from "@/types/task";
import { notifyTaskStakeholders } from "@/lib/notifications/task-events";

const TASK_PRIORITIES = new Set<TaskPriority>(["baixa", "media", "alta", "critica"]);
const TASK_CATEGORIES: TaskCategory[] = [
  "almoxarifado_controle_estoque",
  "almoxarifado_inventario",
  "almoxarifado_cadastro_materiais",
  "almoxarifado_ajustes_saldo",
  "almoxarifado_recebimento",
  "almoxarifado_organizacao",
  "almoxarifado_controle_minmax",
  "compras_solicitacao",
  "compras_cotacao",
  "compras_negociacao",
  "compras_pedido",
  "compras_followup",
  "compras_contratacao",
  "administrativo_relatorios",
  "administrativo_indicadores",
  "administrativo_cadastros",
  "administrativo_processos",
  "administrativo_auditorias",
  "administrativo_controle_documental",
];
const TASK_STATUSES: TaskStatus[] = [
  "backlog",
  "a_fazer",
  "em_andamento",
  "aguardando_terceiros",
  "aguardando_aprovacao",
  "concluido",
  "cancelado",
];

/** Valida valores de enum recebidos de fora; cai em um default seguro se inválido. */
function asPriority(value: string | undefined, fallback: TaskPriority = "media"): TaskPriority {
  return value && TASK_PRIORITIES.has(value as TaskPriority) ? (value as TaskPriority) : fallback;
}
function asCategory(value: string | undefined, fallback: TaskCategory): TaskCategory {
  return value && TASK_CATEGORIES.includes(value as TaskCategory) ? (value as TaskCategory) : fallback;
}
function asStatus(value: string | undefined, fallback: TaskStatus): TaskStatus {
  return value && TASK_STATUSES.includes(value as TaskStatus) ? (value as TaskStatus) : fallback;
}

/**
 * T-007 — CRUD de tarefas.
 *
 * Ações de servidor para criar, atualizar e excluir tarefas, com validação
 * dos campos obrigatórios (AC-016). Mesmo padrão das demais: Supabase quando
 * configurado; modo demo em memória quando não há credenciais.
 *
 * AUI:
 * - AC-015: criar tarefa → aparece no quadro
 * - AC-016: título vazio → "O título é obrigatório" e não cria
 * - AC-017: criar com checklist → itens desmarcados no cartão
 * - AC-018: editar → cartão reflete e notifica responsável
 * - AC-019: excluir → some do quadro
 */

const SESSION_KEY = "kanban_demo_tasks";

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

/** Lista de tarefas "criadas/alteradas" na sessão demo. */
function readSession(): Record<string, TaskWithRelations> {
  try {
    const raw = (globalThis as any)[SESSION_KEY];
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSession(byId: Record<string, TaskWithRelations>) {
  (globalThis as any)[SESSION_KEY] = JSON.stringify(byId);
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  responsibleId: string;
  /** Responsáveis adicionais (tarefa compartilhada entre várias pessoas). */
  responsibleIds?: string[];
  requesterId: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string | null;
  checklistTitles?: string[];
}

export interface TaskResult {
  ok: boolean;
  task?: TaskWithRelations;
  error?: string;
}

/** Monta um `responsible`/`requester` demo para uma tarefa nova. */
function makeActor(id: string, name: string, role: string) {
  return { id, full_name: name, email: `${id}@vortice.com`, role, avatar_url: null };
}

/**
 * Cria uma tarefa. Valida o título (obrigatório) — AC-016.
 * Nova tarefa nasce na coluna "a_fazer" (AC-015).
 */
export async function createTask(input: CreateTaskInput): Promise<TaskResult> {
  const title = input.title?.trim();
  if (!title) {
    return { ok: false, error: "O título é obrigatório" };
  }
  // Autorização real: só supervisor cria tarefa (AC-015).
  await requireActor("tasks.create");

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description: input.description ?? null,
        responsible_id: input.responsibleId,
        requester_id: input.requesterId,
        status: "a_fazer",
        priority: asPriority(input.priority),
        category: asCategory(input.category, "almoxarifado_inventario"),
        due_date: input.dueDate ?? null,
      })
      .select("*, responsible:users!tasks_responsible_id_fkey(*), requester:users!tasks_requester_id_fkey(*)")
      .single();
    if (error) return { ok: false, error: error.message };
    const created = data as unknown as TaskWithRelations;

    // Insere os itens de checklist (AC-017): cada título vira uma linha na
    // tabela `checklist_items`, mantendo a ordem (position).
    const titles = (input.checklistTitles ?? [])
      .map((t) => t.trim())
      .filter(Boolean);
    let checklistItems: ChecklistItem[] = [];
    if (titles.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("checklist_items")
        .insert(titles.map((title, i) => ({ task_id: created.id, title, position: i })))
        .select();
      if (itemsError) return { ok: false, error: itemsError.message };
      checklistItems = items as unknown as ChecklistItem[];
    }

    return {
      ok: true,
      task: { ...created, checklist_items: checklistItems },
    };
  }

  const now = new Date().toISOString();
  const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  // Busca o nome real do responsável e do solicitante nos usuários demo,
  // para o card novo exibir o colaborador correto (não um nome genérico).
  const allUsers = listUsers();
  const respUser = allUsers.find((u) => u.id === input.responsibleId);
  const reqUser = allUsers.find((u) => u.id === input.requesterId);
  const responsible = respUser
    ? makeActor(respUser.id, respUser.name, respUser.role)
    : makeActor(input.responsibleId, "Responsável", "operacional");
  const requester = reqUser
    ? makeActor(reqUser.id, reqUser.name, reqUser.role)
    : makeActor(input.requesterId, "Solicitante", "supervisor");
  // Responsáveis adicionais (exclui o principal e o supervisor).
  const additionalIds = (input.responsibleIds ?? []).filter(
    (rid) => rid !== input.responsibleId && rid !== input.requesterId
  );

  const checklist_items: ChecklistItem[] = (input.checklistTitles ?? []).map((t, i) => ({
    id: `ci-${id}-${i}`,
    task_id: id,
    title: t,
    completed: false,
    position: i,
    created_at: now,
    updated_at: now,
  }));

  const task: TaskWithRelations = {
    id,
    title,
    description: input.description ?? null,
    responsible_id: input.responsibleId,
    responsible_ids: additionalIds.length ? additionalIds : undefined,
    requester_id: input.requesterId,
    status: "a_fazer",
    priority: asPriority(input.priority),
    category: asCategory(input.category, "almoxarifado_inventario"),
    due_date: input.dueDate ?? null,
    completed_at: null,
    approved_at: null,
    approved_by: null,
    rejection_reason: null,
    help_requested: false,
    help_reason: null,
    reopen_requested: false,
    reopen_reason: null,
    created_at: now,
    updated_at: now,
    responsible,
    requester,
    checklist_items,
    comments_count: 0,
    attachments_count: 0,
  };

  const byId = readSession();
  byId[id] = task;
  writeSession(byId);
  return { ok: true, task };
}

export async function updateTask(input: {
  id: string;
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}): Promise<TaskResult> {
  if (input.title !== undefined && !input.title.trim()) {
    return { ok: false, error: "O título é obrigatório" };
  }
  // Autorização real: usuário logado. Em produção o gate seria por
  // canModifyTask(role, task, actor.id) — aqui qualquer logado atualiza.
  const actor = await requireActor("tasks.edit");

  // Caminho real: Supabase. Persiste a mudança e notifica os envolvidos.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.priority !== undefined ? { priority: asPriority(input.priority) } : {}),
        ...(input.status !== undefined ? { status: asStatus(input.status, "a_fazer") } : {}),
        ...(input.dueDate !== undefined ? { due_date: input.dueDate } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select("*, responsible:users!tasks_responsible_id_fkey(*), requester:users!tasks_requester_id_fkey(*)")
      .single();
    if (error) return { ok: false, error: error.message };
    const updated = data as unknown as TaskWithRelations;

    // Notifica os envolvidos quando o status muda (movimentou no board).
    if (input.status !== undefined) {
      await notifyTaskStakeholders({
        taskId: input.id,
        type: "status",
        title: "Tarefa movida",
        message: `"${updated.title}" mudou para ${TASK_STATUS_LABELS[updated.status] ?? updated.status}`,
        excludeUserId: actor.id,
      });
    }
    return { ok: true, task: updated };
  }

  const byId = readSession();
  let existing = byId[input.id];
  // A tarefa pode ser um mock (drag-and-drop persiste também nos dados de
  // demonstração). Cria uma cópia editável da tarefa base + os vínculos.
  if (!existing) {
    const mock = mockTasks.find((t) => t.id === input.id);
    if (mock) {
      existing = {
        ...mock,
        checklist_items: mock.checklist_items ?? [],
        comments_count: mock.comments_count ?? 0,
        attachments_count: mock.attachments_count ?? 0,
      };
    }
  }
  if (!existing) {
    return { ok: false, error: "Tarefa não encontrada" };
  }
  byId[input.id] = {
    ...existing,
    title: input.title?.trim() ?? existing.title,
    description: input.description !== undefined ? input.description : existing.description,
    priority: input.priority !== undefined ? asPriority(input.priority, existing.priority) : existing.priority,
    status: input.status !== undefined ? asStatus(input.status, existing.status) : existing.status,
    due_date: input.dueDate !== undefined ? input.dueDate : existing.due_date,
    updated_at: new Date().toISOString(),
  };
  writeSession(byId);
  return { ok: true, task: byId[input.id] };
}

export async function deleteTask(input: { id: string }): Promise<{ ok: boolean; error?: string }> {
  // Autorização real: só supervisor exclui (AC-019).
  await requireActor("tasks.delete");
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  const byId = readSession();
  if (!byId[input.id]) {
    return { ok: false, error: "Tarefa não encontrada" };
  }
  delete byId[input.id];
  writeSession(byId);
  return { ok: true };
}

/** Lê uma tarefa criada na sessão demo (para o quadro mesclar). */
export async function getSessionTasks(): Promise<TaskWithRelations[]> {
  return Object.values(readSession());
}