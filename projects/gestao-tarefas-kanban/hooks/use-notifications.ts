"use client";

import { useEffect, useState } from "react";
import { mockTasks } from "@/lib/mock-data";
import { getSessionTasks } from "@/app/actions/tasks";
import {
  AppNotification,
  commentNotification,
  deadlineNotifications,
  newTaskNotification,
  getNotifications,
} from "@/lib/notifications/realtime";

/**
 * T-015 — Hook que "escuta" os eventos de tempo real do app e alimenta o sino.
 *
 * No modo demo, os eventos já existentes (`kanban:comment`, `kanban:approval`)
 * são capturados no window e convertidos em notificações na fila. Alertas de
 * prazo (vencimento/atraso) são computados dos prazos das tarefas.
 *
 * Em produção, o `escuta` viraria uma subscription ao Supabase Realtime nas
 * tabelas `notifications`/`tasks`.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // Seed: alertas de prazo das tarefas pendentes (AC-030/031).
    const seedDeadlines = () => {
      getSessionTasks().then((sessionTasks) => {
        deadlineNotifications([...mockTasks, ...sessionTasks]);
        setNotifications(getNotifications());
      });
    };
    seedDeadlines();
    // Re-checa prazos periodicamente para "Vence em breve" virar "Atrasada"
    // sem interação (AC-030/031). Eventos de comentário/aprovação continuam
    // atualizando a fila em tempo real.
    const deadlineTimer = window.setInterval(seedDeadlines, 60_000);
    const sync = () => setNotifications(getNotifications());

    // Comentário em tarefa → notificação (AC-043)
    const onComment = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      commentNotification({
        taskId: detail.taskId,
        taskTitle: detail.taskTitle ?? "tarefa",
        author: detail.by ?? "Alguém",
      });
      sync();
    };

    // Nova tarefa atribuída (AC-042) — notifica no demo.
    const onNewTask = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      if (detail.taskTitle) {
        newTaskNotification({
          taskId: detail.taskId,
          taskTitle: detail.taskTitle,
        });
        sync();
      }
    };

    const onApproval = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      commentNotification({
        taskId: detail.taskId,
        taskTitle: detail.taskTitle ?? "tarefa",
        author: detail.action === "approved" ? "Supervisor" : "Supervisor",
      });
      sync();
    };

    window.addEventListener("kanban:comment", onComment);
    window.addEventListener("kanban:approval", onApproval);
    window.addEventListener("kanban:new-task", onNewTask);

    return () => {
      window.clearInterval(deadlineTimer);
      window.removeEventListener("kanban:comment", onComment);
      window.removeEventListener("kanban:approval", onApproval);
      window.removeEventListener("kanban:new-task", onNewTask);
    };
    // Intencional: roda uma vez ao montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return notifications;
}