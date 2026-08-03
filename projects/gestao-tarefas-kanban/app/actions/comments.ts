"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActor } from "@/lib/auth/server-session";
import { CommentWithUser } from "@/types/comment";

/**
 * T-011 — Comentários.
 *
 * Camada de persistência de comentários. Se o Supabase estiver configurado
 * (.env.local preenchido), grava na tabela `comments` e retorna com a junção
 * do usuário. Sem credenciais (modo demo), serve um armazenamento em memória —
 * os comentários funcionam na sessão para a timeline poder ser demonstrada
 * mesmo antes do banco existir.
 *
 * AUI: comentário -> timeline + notificação ao supervisor.
 */

const SESSION_KEY = "kanban_demo_comments";

interface StoredComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_role: string;
}

/**
 * Só usa o caminho Supabase quando há credenciais REAIS. O `.env.local` de
 * exemplo traz placeholders ("your_supabase_project_url") — tratá-los como
 * válidos quebraria a action com URL inválida. Aqui validamos URL HTTP/HTTPS
 * de verdade e descartamos placeholders conhecidos.
 */
function isSupabaseConfigured() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const placeholder = /(placeholder|your_|xxxx|SUPABASE_URL|\*{3}|<>)/i;
  const looksLikeUrl = /^https?:\/\/.+/.test(url);
  return looksLikeUrl && Boolean(key) && key.length > 20 && !placeholder.test(url) && !placeholder.test(key);
}

/** Lê os comentários demo persistidos na sessão (server). */
function readSessionComments(): Record<string, StoredComment[]> {
  try {
    if (typeof globalThis === "undefined") return {};
    const raw = (globalThis as any)[SESSION_KEY];
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function getComments(taskId: string): Promise<CommentWithUser[]> {
  const session = readSessionComments();
  return (session[taskId] ?? []).map((c) => ({
    id: c.id,
    task_id: c.task_id,
    user_id: c.user_id,
    content: c.content,
    created_at: c.created_at,
    updated_at: c.updated_at,
    user: {
      id: c.user_id,
      full_name: c.user_name,
      email: `${c.user_id}@vortice.com`,
      role: c.user_role,
      avatar_url: null,
    },
  }));
}

export async function addComment(input: {
  taskId: string;
  content: string;
}): Promise<CommentWithUser> {
  const content = input.content.trim();
  if (!content) throw new Error("Comentário vazio");

  // Autorização real: o ator vem do cookie httpOnly, não do corpo. Qualquer
  // usuário logado pode comentar, mas a identidade NÃO é forjável.
  const actor = await requireActor("tasks.edit");

  // Caminho real: Supabase configurado
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        task_id: input.taskId,
        user_id: actor.id,
        content,
      })
      .select("*, user:users(*)")
      .single();

    if (error) throw new Error(error.message);
    const comment = data as unknown as CommentWithUser;
    // TODO T-015 onp: emitir notificação ao supervisor (Realtime).
    return comment;
  }

  // Fallback demo: armazena na sessão do servidor.
  const byId = readSessionComments();
  const taskComments = byId[input.taskId] ?? [];
  const newComment: StoredComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    task_id: input.taskId,
    user_id: actor.id,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_name: actor.name,
    user_role: actor.role,
  };
  taskComments.push(newComment);
  byId[input.taskId] = taskComments;
  (globalThis as any)[SESSION_KEY] = JSON.stringify(byId);

  return {
    id: newComment.id,
    task_id: newComment.task_id,
    user_id: newComment.user_id,
    content: newComment.content,
    created_at: newComment.created_at,
    updated_at: newComment.updated_at,
    user: {
      id: newComment.user_id,
      full_name: newComment.user_name,
      email: `${newComment.user_id}@vortice.com`,
      role: newComment.user_role,
      avatar_url: null,
    },
  };
}