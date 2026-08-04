"use client";

import { useEffect, useState } from "react";
import { mockTasks } from "@/lib/mock-data";
import { getSessionTasks } from "@/app/actions/tasks";
import {
  AppNotification,
  commentNotification,
  deadlineNotifications,
  getNotifications,
  pushNotification,
} from "@/lib/notifications/realtime";
import { subscribeNotifications, getBrowserClient } from "@/lib/supabase/realtime";
import { fetchUnreadNotifications } from "@/app/actions/notifications";
import { getStoredUser } from "@/components/auth/login-form";

/**
 * Hook híbrido de notificações (T-015).
 *
 * Combina 2 fontes:
 * 1. **Supabase Realtime** — escuta o canal `notifications` (se configurado)
 *    e recebe novas notificações em tempo real do banco.
 * 2. **Eventos locais** — fallback para demo/SSR (kanban:comment, kanban:new-task).
 *
 * No mount, busca as notificações não-lidas do banco para popular o sino.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof subscribeNotifications> | null = null;

    // 1. Seed inicial: busca notificações não-lidas do Supabase
    const loadUnread = async () => {
      const unread = await fetchUnreadNotifications();
      if (unread.length > 0) {
        unread.forEach(pushNotification);
        setNotifications(getNotifications());
      }
    };
    loadUnread();

    // 2. Realtime: inscreve-se no canal de notificações (se Supabase estiver configurado)
    const user = getStoredUser();
    const supabase = getBrowserClient();
    if (user && supabase) {
      channel = subscribeNotifications(
        user.id,
        (payload) => {
          // Nova notificação chegou pelo Realtime
          const notification: AppNotification = {
            id: payload.id,
            type: payload.type as AppNotification["type"],
            title: payload.title,
            body: payload.message,
            createdAt: payload.created_at,
            read: payload.read,
            taskId: payload.task_id || undefined,
          };
          pushNotification(notification);
          setNotifications(getNotifications());

          // Dispara evento local para compatibilidade com outros listeners
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("kanban:notification", { detail: notification })
            );
          }
        }
      );
    }

    // 3. Deadlines locais: recalcula prazos das tarefas a cada 60s
    const seedDeadlines = () => {
      getSessionTasks().then((sessionTasks) => {
        deadlineNotifications([...mockTasks, ...sessionTasks]);
        setNotifications(getNotifications());
      });
    };
    seedDeadlines();
    const deadlineTimer = window.setInterval(seedDeadlines, 60_000);

    // 4. Eventos locais (fallback/demo)
    const sync = () => setNotifications(getNotifications());

    const onComment = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      commentNotification({
        taskId: detail.taskId,
        taskTitle: detail.taskTitle ?? "tarefa",
        author: detail.by ?? "Alguém",
      });
      sync();
    };

    const onNewTask = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      if (detail.taskTitle) {
        commentNotification({
          taskId: detail.taskId,
          taskTitle: detail.taskTitle,
          author: "Sistema",
        });
        sync();
      }
    };

    window.addEventListener("kanban:comment", onComment);
    window.addEventListener("kanban:new-task", onNewTask);

    return () => {
      window.clearInterval(deadlineTimer);
      window.removeEventListener("kanban:comment", onComment);
      window.removeEventListener("kanban:new-task", onNewTask);
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, []);

  return notifications;
}
