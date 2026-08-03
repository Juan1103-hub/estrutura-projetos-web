import { TaskStatus } from "@/types/task";
import { HISTORY_ACTION_LABELS } from "@/types/history";

/**
 * T-021 — Auditoria: timeline de alterações (AC-040/AC-041).
 *
 * Funções puras que constroem o histórico de uma tarefa a partir de eventos
 * registrados. Cada evento vira uma entrada com ação legível, autor e horário.
 *
 * AC-040: timeline cronológica (criar → mover → comentar → concluir).
 * AC-041: rastrear alteração de campo (prazo de X para Y).
 */

export type HistoryEventType =
  | "created"
  | "status_changed"
  | "commented"
  | "field_changed"
  | "approved"
  | "rejected";

export interface HistoryEvent {
  type: HistoryEventType;
  /** autor da ação */
  author: string;
  /** timestamp ISO */
  at: string;
  /** preenchido em status_changed */
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  /** preenchido em field_changed */
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface HistoryEntry {
  /** texto legível da linha da timeline, ex: "João Silva moveu para Em Andamento" */
  label: string;
  author: string;
  at: string;
}

/** Rótulo legível para um status (usa o mapeamento de status da spec). */
const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  a_fazer: "A Fazer",
  em_andamento: "Em Andamento",
  aguardando_terceiros: "Aguardando Terceiros",
  aguardando_aprovacao: "Aguardando Aprovação",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const FIELD_LABEL: Record<string, string> = {
  due_date: "prazo",
  priority: "prioridade",
  description: "descrição",
  title: "título",
};

/** Formata um valor (prazo etc.) para o registro. */
function formatValue(field: string, value?: string): string {
  if (!value) return "";
  if (field === "due_date") {
    return new Date(value).toLocaleDateString("pt-BR");
  }
  return value;
}

/**
 * Converte um evento em uma linha legível da timeline.
 * Ex: { type: "status_changed", toStatus: "em_andamento" } → "moveu para Em Andamento"
 */
export function eventToLabel(event: HistoryEvent): HistoryEntry {
  const at = event.at;

  switch (event.type) {
    case "created":
      return { label: `${event.author} criou a tarefa`, author: event.author, at };
    case "status_changed":
      return {
        label: `${event.author} moveu para ${STATUS_LABEL[event.toStatus ?? ""] ?? event.toStatus}`,
        author: event.author,
        at,
      };
    case "commented":
      return { label: `${event.author} comentou`, author: event.author, at };
    case "approved":
      return { label: `${event.author} aprovou a tarefa`, author: event.author, at };
    case "rejected":
      return { label: `${event.author} reprovou a tarefa`, author: event.author, at };
    case "field_changed": {
      const fieldName = FIELD_LABEL[event.field ?? ""] ?? event.field;
      return {
        label: `${event.author} alterou ${fieldName} de ${formatValue(event.field ?? "", event.oldValue)} para ${formatValue(event.field ?? "", event.newValue)}`,
        author: event.author,
        at,
      };
    }
  }
}

/**
 * Monta a timeline cronológica (mais antiga primeiro) a partir dos eventos.
 * AC-040: ordena por data e converte cada evento em linha legível.
 */
export function buildTimeline(events: HistoryEvent[]): HistoryEntry[] {
  return [...events]
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    .map(eventToLabel);
}

/** Re-exporta o rótulo da ação (compat com HISTORY_ACTION_LABELS da spec). */
export { HISTORY_ACTION_LABELS };