"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActor, getServerActor } from "@/lib/auth/server-session";
import { ChecklistItem } from "@/types/task";

/**
 * T-013 — Checklist.
 *
 * Camada de persistência dos itens de checklist de uma tarefa. Mesmo padrão da
 * T-011 (comentários): se o Supabase estiver configurado, usa a tabela
 * `checklist_items`; sem credenciais (modo demo), guarda num armazenamento em
 * memória para a demonstração funcionar antes do banco existir.
 *
 * AUI: marcar item -> mantém o estado concluído e o progresso no modal.
 */

const SESSION_KEY = "kanban_demo_checklist";

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

/** Estado demo persistido numa sessão: mapa taskId -> ChecklistItem[]. */
function readSession(): Record<string, ChecklistItem[]> {
  try {
    const raw = (globalThis as any)[SESSION_KEY];
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSession(byTask: Record<string, ChecklistItem[]>) {
  (globalThis as any)[SESSION_KEY] = JSON.stringify(byTask);
}

/**
 * Mescla os itens base (mock/demo da tarefa) com os itens persistidos na
 * sessão atual: os persistidos sobrescrevem por id, e itens novos (não na
 * base) são adicionados. Assim uma tarefa com checklist no mock continua o
 * que o usuário marcou durante a sessão.
 */
export async function getChecklist(taskId: string, baseItems: ChecklistItem[] = []): Promise<ChecklistItem[]> {
  const persisted = readSession()[taskId] ?? [];
  const merged = new Map<string, ChecklistItem>();
  baseItems.forEach((i) => merged.set(i.id, i));
  persisted.forEach((i) => merged.set(i.id, i));
  const list = [...merged.values()];
  list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return list;
}

export async function updateChecklistItem(input: {
  taskId: string;
  itemId: string;
  completed: boolean;
  baseItems?: ChecklistItem[];
}): Promise<ChecklistItem> {
  // Marcar item como concluído: qualquer usuário autenticado que participe da
  // tarefa (o RLS valida task_visible_to). Operacional executa o trabalho.
  const actor = await getServerActor();
  if (!actor) throw new Error("Não autorizado: faça login para continuar.");

  // Caminho real: Supabase — persiste o estado concluído no banco.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("checklist_items")
      .update({ completed: input.completed, updated_at: new Date().toISOString() })
      .eq("id", input.itemId)
      .eq("task_id", input.taskId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as ChecklistItem;
  }

  const byTask = readSession();
  const current = byTask[input.taskId] ?? [];
  // Procura primeiro na sessão; se for um item base (mock/demo), usa a base
  // como fallback para não perder o título ao togglar.
  const sessionItem = current.find((i) => i.id === input.itemId);
  const baseItem = (input.baseItems ?? []).find((i) => i.id === input.itemId);
  const item = sessionItem ?? baseItem;

  const updated: ChecklistItem = {
    id: input.itemId,
    task_id: input.taskId,
    title: item?.title ?? "Item",
    completed: input.completed,
    position: item?.position ?? current.length,
    created_at: item?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (item) {
    const idx = current.findIndex((i) => i.id === input.itemId);
    current[idx] = updated;
  } else {
    current.push(updated);
  }
  byTask[input.taskId] = current;
  writeSession(byTask);
  return updated;
}

export async function addChecklistItem(input: {
  taskId: string;
  title: string;
  position?: number;
}): Promise<ChecklistItem> {
  const title = input.title.trim();
  if (!title) throw new Error("Título vazio");

  // Adicionar item: apenas supervisor (tasks.edit — só supervisor tem).
  await requireActor("tasks.edit");

  // Caminho real: Supabase configurado
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("checklist_items")
      .insert({ task_id: input.taskId, title })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as ChecklistItem;
  }

  const byTask = readSession();
  const current = byTask[input.taskId] ?? [];
  const newItem: ChecklistItem = {
    id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    task_id: input.taskId,
    title,
    completed: false,
    position: input.position ?? current.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  current.push(newItem);
  byTask[input.taskId] = current;
  writeSession(byTask);
  return newItem;
}

export async function deleteChecklistItem(input: {
  taskId: string;
  itemId: string;
}): Promise<void> {
  // Remover item: apenas supervisor.
  await requireActor("tasks.edit");

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", input.itemId)
      .eq("task_id", input.taskId);
    if (error) throw new Error(error.message);
    return;
  }

  const byTask = readSession();
  byTask[input.taskId] = (byTask[input.taskId] ?? []).filter(
    (i) => i.id !== input.itemId
  );
  writeSession(byTask);
}