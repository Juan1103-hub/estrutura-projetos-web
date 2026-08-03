import { TaskWithRelations, TaskStatus } from "@/types/task";

/**
 * T-017 — Analytics do dashboard gerencial.
 *
 * Funções puras de métricas (testáveis de forma isolada). Não dependem do
 * backend — recebem as tarefas e calculam contadores, produtividade por
 * colaborador e taxa de conclusão no prazo.
 */

/**
 * Status considerados "abertas" (ainda não iniciadas) para o contador.
 * Os contadores são disjuntos: "abertas" = ainda nem começaram (backlog +
 * a fazer); "em andamento" = em execução (inclui espera de terceiros/aprovação).
 */
const OPEN_STATUSES: TaskStatus[] = ["backlog", "a_fazer"];

export interface TaskCounters {
  abertas: number;
  em_andamento: number;
  concluidas: number;
  atrasadas: number;
}

/**
 * Conta as tarefas por situação (AC-032). "Em andamento" inclui também as
 * colunas de espera (terceiros/aprovação), pois ainda não estão concluídas.
 */
export function countTasks(tasks: TaskWithRelations[]): TaskCounters {
  const now = Date.now();
  let abertas = 0;
  let em_andamento = 0;
  let concluidas = 0;
  let atrasadas = 0;

  tasks.forEach((t) => {
    // Concluídas
    if (t.status === "concluido") {
      concluidas++;
      return;
    }
    // Em andamento (inclui espera de terceiros/aprovação)
    if (t.status === "em_andamento" || t.status === "aguardando_terceiros" || t.status === "aguardando_aprovacao") {
      em_andamento++;
    }
    // Abertas = toda tarefa ainda não concluída/cancelada
    if (OPEN_STATUSES.includes(t.status)) {
      abertas++;
    }
    // Atrasadas = ainda não concluída e com prazo para trás
    if (t.due_date && !t.completed_at && t.status !== "cancelado") {
      if (new Date(t.due_date).getTime() < now) {
        atrasadas++;
      }
    }
  });

  return { abertas, em_andamento, concluidas, atrasadas };
}

export interface CollaboratorProductivity {
  id: string;
  name: string;
  concluidas: number;
}

/**
 * Ranking de produtividade por colaborador (AC-033): quantas tarefas cada um
 * concluiu. Ordena do mais produtivo para o menos.
 */
export function productivityByCollaborator(tasks: TaskWithRelations[]): CollaboratorProductivity[] {
  const map = new Map<string, { id: string; name: string; concluidas: number }>();
  tasks.forEach((t) => {
    if (t.status !== "concluido" || !t.responsible) return;
    const entry = map.get(t.responsible.id) ?? {
      id: t.responsible.id,
      name: t.responsible.full_name,
      concluidas: 0,
    };
    entry.concluidas++;
    map.set(t.responsible.id, entry);
  });
  return [...map.values()].sort((a, b) => b.concluidas - a.concluidas);
}

export interface CompletionRate {
  concluidas: number;
  noPrazo: number;
  atrasadas: number;
  /** percentual 0–100 de conclusões dentro do prazo */
  taxa: number;
}

/**
 * Taxa de conclusão no prazo (AC-034). Uma tarefa concluída está "no prazo"
 * se foi concluída até a data-limite (due_date).
 */
export function completionRateWithinDeadline(tasks: TaskWithRelations[]): CompletionRate {
  const concluidas = tasks.filter((t) => t.status === "concluido");
  let noPrazo = 0;
  let atrasadas = 0;

  concluidas.forEach((t) => {
    // Sem prazo definido não dá pra afirmar atraso; conta como no prazo.
    if (!t.due_date || !t.completed_at) {
      noPrazo++;
      return;
    }
    if (new Date(t.completed_at) <= new Date(t.due_date)) {
      noPrazo++;
    } else {
      atrasadas++;
    }
  });

  const total = concluidas.length;
  const taxa = total > 0 ? Math.round((noPrazo / total) * 100) : 0;
  return { concluidas: total, noPrazo, atrasadas, taxa };
}