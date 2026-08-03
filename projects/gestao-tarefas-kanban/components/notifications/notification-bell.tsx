"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bell,
  MessageSquare,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import {
  AppNotification,
  countUnread,
  markAllRead,
  getNotifications,
} from "@/lib/notifications/realtime";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * T-015 — Sino de notificações (AC-042/043).
 *
 * Mostra um ícone de sino com badge de não-lidas. Ao clicar, abre o painel
 * com a lista de notificações. Consome a fila do `realtime` (em memória no
 * modo demo) e pode ser nutrido por eventos globais (`kanban:comment`,
 * `kanban:approval`) — ver hook `useNotifications`.
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
  const unread = countUnread(notifications);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      markAllRead();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative"
        aria-label="Notificações"
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
        <div className="absolute right-0 top-9 z-50 w-80 rounded-xl border border-border bg-card dark:bg-clate-900 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
            <span className="text-sm font-semibold">Notificações</span>
            {unread > 0 && (
              <span className="text-xs text-muted-foreground">{unread} não lida(s)</span>
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
                <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-muted/40">
                  <Icon className="h-5 w-5 mt-0.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}