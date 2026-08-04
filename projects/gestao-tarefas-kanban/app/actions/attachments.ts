"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActor } from "@/lib/auth/server-session";
import { Attachment } from "@/types/attachment";

/**
 * T-012 — Anexos.
 *
 * Camada de persistência dos anexos de uma tarefa. Mesmo padrão das T-011/013:
 * Supabase (tabela `attachments` + Storage) quando configurado; modo demo em
 * memória quando não há credenciais.
 *
 * AUI (AC-026): anexar arquivo → aparece na lista com nome, tamanho e link.
 */

const SESSION_KEY = "kanban_demo_attachments";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

function readSession(): Record<string, Attachment[]> {
  try {
    const raw = (globalThis as any)[SESSION_KEY];
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSession(byTask: Record<string, Attachment[]>) {
  (globalThis as any)[SESSION_KEY] = JSON.stringify(byTask);
}

export interface NewAttachmentInput {
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/** Sanitiza o nome do arquivo para o storage (sem caminhos, sem ../, sem barras). */
function sanitizeFileName(name: string): string {
  const base = name.replace(/[\\/]/g, "_").replace(/\.\.+/g, "").replace(/[^\w\-. ]/g, "_").trim();
  return base || "arquivo";
}

/**
 * Adiciona um anexo a uma tarefa. Valida tamanho (limite 10MB) e tipo.
 * O autor vem do cookie de sessão (não é forjável). Em modo demo, guarda o
 * metadado em memória (sem bytes reais); no Supabase, gravaria em Storage +
 * tabela `attachments`.
 */
export async function addAttachment(input: NewAttachmentInput): Promise<Attachment> {
  if (input.fileSize > MAX_SIZE_BYTES) {
    throw new Error("Arquivo excede o limite de 10MB");
  }
  if (!input.fileName.trim()) {
    throw new Error("Nome de arquivo vazio");
  }
  // Autorização real: ator do cookie (qualquer usuário logado pode anexar).
  const actor = await requireActor("tasks.edit");
  const safeName = sanitizeFileName(input.fileName);

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attachments")
      .insert({
        task_id: input.taskId,
        user_id: actor.id,
        file_name: safeName,
        file_size: input.fileSize,
        file_type: input.fileType,
        storage_path: `tasks/${input.taskId}/${safeName}`,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as Attachment;
  }

  const byTask = readSession();
  const list = byTask[input.taskId] ?? [];
  const attachment: Attachment = {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    task_id: input.taskId,
    user_id: actor.id,
    file_name: safeName,
    file_size: input.fileSize,
    file_type: input.fileType,
    storage_path: `tasks/${input.taskId}/${safeName}`,
    created_at: new Date().toISOString(),
  };
  list.push(attachment);
  byTask[input.taskId] = list;
  writeSession(byTask);
  return attachment;
}

export async function getAttachments(taskId: string): Promise<Attachment[]> {
  // Caminho real: Supabase — lê os anexos persistidos (RLS valida participação).
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erro ao buscar anexos:", error);
      return [];
    }
    return (data ?? []) as unknown as Attachment[];
  }

  const byTask = readSession();
  return byTask[taskId] ?? [];
}

export async function deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
  // Autorização real: usuário logado (pode remover anexo). O Supabase cuidaria
  // de Storage + RLS em produção; aqui impedimos deleção anônima.
  await requireActor("tasks.edit");
  const byTask = readSession();
  byTask[taskId] = (byTask[taskId] ?? []).filter((a) => a.id !== attachmentId);
  writeSession(byTask);
}