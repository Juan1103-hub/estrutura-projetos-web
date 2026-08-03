import { TaskStatus } from "@/types/task";

/**
 * T-015 — Máquina de estados das transições de status (drag-and-drop).
 *
 * Define quais transições são VÁLIDAS entre as colunas do Kanban. O arrasto
 * de um card só pode ir para um destino permitido pelo status atual; destinos
 * inválidos são bloqueados (o card volta para a coluna de origem).
 *
 * Fluxo esperado de negócio:
 *   backlog → a_fazer → em_andamento → aguardando_terceiros
 *   em_andamento → aguardando_aprovacao → concluido
 *   aguardando_aprovacao → em_andamento (reprovado, com justificativa)
 *
 * `concluido` e `cancelado` são terminais: não é possível arrastar de volta
 * para uma coluna de trabalho (a reabertura seria um fluxo de negócio à parte).
 */

/** Status terminais: um card não pode sair deles por drag. */
export const TERMINAL_STATUSES: TaskStatus[] = ["concluido", "cancelado"];

export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  backlog: ["a_fazer"],
  a_fazer: ["backlog", "em_andamento"],
  em_andamento: ["a_fazer", "aguardando_terceiros", "aguardando_aprovacao"],
  aguardando_terceiros: ["em_andamento"],
  aguardando_aprovacao: ["em_andamento"],
  concluido: [],
  cancelado: [],
};

/** True se `from → to` é uma transição válida (ou já está na mesma coluna). */
export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  return (STATUS_TRANSITIONS[from] ?? []).includes(to);
}
