import { TaskWithRelations } from "@/types/task";

/**
 * T-015 — Alertas de prazo (AC-030/AC-031).
 *
 * Funções puras que classificam o estado de prazos de uma tarefa:
 * - `vence em breve`  → prazo a até 24h, tarefa ainda não concluída (oipe laranja)
 * - `atrasada`        → prazo já passou, tarefa ainda não concluída (indicador vermelho)
 *
 * Baseado na data de hoje, ajudando a gerar notificações automáticas.
 */

export type DeadlineStatus = "vence-em-breve" | "atrasada" | "no-prazo" | "sem-prazo";

/** Milissegundos em 24 horas. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Classifica o prazo de uma tarefa com base em `now` (injetável p/ teste).
 * Uma tarefa concluída não dispara alerta de atraso/vencimento.
 */
export function classifyDeadline(task: TaskWithRelations, now: number = Date.now()): DeadlineStatus {
  if (task.status === "concluido" || task.status === "cancelado" || !task.due_date) {
    return task.due_date ? "no-prazo" : "sem-prazo";
  }
  const due = new Date(task.due_date).getTime();
  const diff = due - now;

  if (diff < 0) {
    return "atrasada";
  }
  if (diff <= DAY_MS) {
    return "vence-em-breve";
  }
  return "no-prazo";
}

export interface DeadlineAlert {
  task: TaskWithRelations;
  status: Extract<DeadlineStatus, "vence-em-breve" | "atrasada">;
  /** texto legível para a notificação, ex: "vence amanhã" / "atrasada há 1 dia" */
  message: string;
}

function plural(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

/**
 * Gera os alertas de prazo de um conjunto de tarefas (evento "checar prazos").
 * - vence em breve → tarefa com prazo em até ~24h ainda não concluída
 * - atrasada      → tarefa com prazo vencido ainda não concluída
 */
export function collectDeadlineAlerts(tasks: TaskWithRelations[], now: number = Date.now()): DeadlineAlert[] {
  const alerts: DeadlineAlert[] = [];
  const DAY = 24 * 60 * 60 * 1000;

  tasks.forEach((t) => {
    if (t.status === "concluido" || t.status === "cancelado" || !t.due_date) return;
    const due = new Date(t.due_date).getTime();
    const diff = due - now;
    if (diff < 0) {
      const daysLate = Math.abs(Math.floor(diff / DAY)) || 1;
      const lbl = plural(daysLate, '1 dia', `${daysLate} dias`);
      alerts.push({
        task: t,
        status: "atrasada",
        message: `Tarefa '${t.title}' está atrasada há ${lbl}`,
      });
    } else if (diff <= DAY) {
      // Compara por dia de calendário para distinguir "vence hoje" de "vence amanhã".
      const today = new Date(now);
      const dueDay = new Date(due);
      const sameDay =
        dueDay.getFullYear() === today.getFullYear() &&
        dueDay.getMonth() === today.getMonth() &&
        dueDay.getDate() === today.getDate();
      alerts.push({
        task: t,
        status: "vence-em-breve",
        message: `Tarefa '${t.title}' ${sameDay ? 'vence hoje' : 'vence amanhã'}`,
      });
    }
  });
  return alerts;
}