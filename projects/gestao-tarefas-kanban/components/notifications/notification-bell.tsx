"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  MessageSquare,
  CalendarClock,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import {
  AppNotification,
  countUnread,
  markAllRead,
  markAsRead,
} from "@/lib/notifications/realtime";
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * T-015 — Sino de notificações (AC-042/043).
 *
 * Mostra um ícone de sino com badge de não-lidas. Ao clicar, abre o painel
 * com a lista de notificações. O painel fecha ao clicar FORA dele (document
 * click) ou ao navegar para uma tarefa. Clique numa notificação não-lida
 * marca como lida (local + banco) e navega para a tarefa.
 */

const TYPE_ICONS: Record<AppNotification["type"], typeof Bell> = {
  new_task: CheckCircle2,
  comment: MessageSquare,
  approval: CheckCircle2,
  deadline: CalendarClock,
  status: CalendarClock,
};

export function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const unread = countUnread(notifications);

  // Fecha o painel ao clicar fora dele (qualquer clique no documento que não
  // seja dentro do container do sino).
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleToggle = () => setOpen((v) => !v);

  const handleMarkAll = async () => {
    markAllRead();
    await markAllNotificationsRead().catch(() => {});
  };

  const handleNotificationClick = async (n: AppNotification) => {
    // Marca como lida (local + banco) se ainda não estava.
    if (!n.read) {
      markAsRead(n.id);
      await markNotificationRead(n.id).catch(() => {});
    }
    // Navega para a tarefa se houver taskId; fecha o painel.
    if (n.taskId) {
      router.push(`/kanban?task=${n.taskId}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative"
        aria-label="Notificações"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-amber-500 px-1 text-[10px] font-bold text-white ring-2 ring-background dark:bg-amber-400 dark:text-black"
            aria-label={`${unread} notificações não lidas`}
          >
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden dark:bg-slate-900">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
            <span className="text-sm font-semibold">Notificações</span>
            {unread > 0 ? (
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas como lidas
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">Tudo lido</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-center text-muted-foreground">
                Nenhuma notificação
              </p>
            )}
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "w-full flex gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors",
                    !n.read && "bg-amber-50/60 dark:bg-amber-500/5"
                  )}
                >
                  <Icon className="h-5 w-5 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm truncate", n.read ? "font-medium text-muted-foreground" : "font-semibold text-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" aria-label="não lida" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
