import { collectDeadlineAlerts } from "@/lib/tasks/deadlines";
import { TaskWithRelations } from "@/types/task";

/**
 * T-015 — Notificações.
 *
 * Fila de notificações do usuário. Em produção isso viraria um canal
 * Supabase Realtime (a tabela `notifications` + subscription). Aqui,
 * no modo demonstração, um barramento em memória agrega os eventos que o
 * app já emite (`kanban:comment`, `kanban:approval`) e os alertas de prazo.
 *
 * A interface é síncrona e testável: as funções puras transformam eventos em
 * notificações com texto, tipo e ícone.
 */

export type NotificationType = "new_task" | "comment" | "approval" | "deadline" | "status";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** id da tarefa relacionada (para navegação/destaque) */
  taskId?: string;
}

let seq = 0;
/** Fila em memória (sessão). */
const queue: AppNotification[] = [];

/**
 * Tipos que deduplicam: alertas de prazo repetem a cada ciclo de 60s e não
 * devem empilhar. Comentários/aprovações são eventos únicos — sempre geram
 * uma entrada nova (dois comentários seguidos são duas notificações).
 */
const DEDUP_TYPES: NotificationType[] = ["deadline"];

/**
 * Monta uma notificação nova no topo da fila.
 *
 * Para tipos que deduplicam (ex: deadline), se já existir uma notificação
 * NÃO-LIDA com a mesma chave (tipo+tarefa), reusa a entrada existente
 * (atualiza o timestamp) em vez de criar outra — evita a "chuva" de
 * notificações repetidas a cada ciclo de 60s.
 */
export function pushNotification(input: Omit<AppNotification, "id" | "createdAt" | "read">): AppNotification {
  if (DEDUP_TYPES.includes(input.type)) {
    const existing = queue.find((n) => n.type === input.type && n.taskId === input.taskId && !n.read);
    if (existing) {
      // Atualiza o conteúdo (ex: "Vence em breve" → "Atrasada" entre ciclos)
      // além do timestamp — evita texto stale no sino.
      existing.createdAt = new Date().toISOString();
      existing.title = input.title;
      existing.body = input.body;
      return existing;
    }
  }
  seq += 1;
  const n: AppNotification = {
    ...input,
    id: `n-${seq}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  queue.unshift(n);
  return n;
}

/**
 * Versão deduplicada dos alertas de prazo: em vez de sempre criar notificações
 * (o que empilhava duplicatas a cada ciclo de 60s), só cria/atualiza quando o
 * estado mudou. Mantém o limite de uma notificação de prazo por tarefa.
 */
export function deadlineNotifications(tasks: TaskWithRelations[], now = Date.now()): AppNotification[] {
  return collectDeadlineAlerts(tasks, now).map((a) =>
    pushNotification({
      type: "deadline",
      title: a.status === "atrasada" ? "Tarefa atrasada" : "Vence em breve",
      body: a.message,
      taskId: a.task.id,
    })
  );
}

/** Lê a fila (mais recente primeiro). */
export function getNotifications(): AppNotification[] {
  return [...queue];
}

export function markAllRead(): void {
  queue.forEach((n) => (n.read = true));
}

/** Marca uma notificação específica como lida (por id). */
export function markAsRead(id: string): void {
  const n = queue.find((n) => n.id === id);
  if (n) n.read = true;
}

export function countUnread(notifications: AppNotification[] = queue): number {
  return notifications.filter((n) => !n.read).length;
}

/** Evento a partir de um comentário (AC-043). */
export function commentNotification(input: {
  taskTitle: string;
  author: string;
  taskId: string;
}): AppNotification {
  return pushNotification({
    type: "comment",
    title: `${input.author} comentou`,
    body: `${input.author} comentou em ${input.taskTitle}`,
    taskId: input.taskId,
  });
}

/** Evento a partir de uma nova tarefa atribuída (AC-042). */
export function newTaskNotification(input: {
  taskTitle: string;
  taskId: string;
}): AppNotification {
  return pushNotification({
    type: "new_task",
    title: "Nova tarefa",
    body: `Nova tarefa: ${input.taskTitle}`,
    taskId: input.taskId,
  });
}