"use client";

import { TaskHistoryEntryWithUser } from "@/types/history";
import { HISTORY_ACTION_LABELS } from "@/types/history";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";

interface TaskHistorySectionProps {
  history: TaskHistoryEntryWithUser[];
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

const getActionColor = (action: string) => {
  if (action === "created") return "bg-green-500/10 text-green-700 dark:text-green-300";
  if (action === "approved") return "bg-teal-500/10 text-teal-700 dark:text-teal-300";
  if (action === "rejected") return "bg-red-500/10 text-red-700 dark:text-red-300";
  if (action === "requested_help") return "bg-amber-500/10 text-amber-800 dark:text-amber-300";
  return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
};

export function TaskHistorySection({ history }: TaskHistorySectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Histórico de Alterações
      </h3>

      <div className="relative space-y-4">
        {/* Linha vertical do timeline */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-muted dark:bg-muted" />

        {history.map((entry) => (
          <div key={entry.id} className="relative flex gap-3">
            {/* Avatar com ponto do timeline */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-8 w-8 border-2 border-card dark:border-card">
                <AvatarFallback className="bg-gradient-to-br from-teal-600 to-slate-700 text-white text-xs">
                  {getInitials(entry.user.full_name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{entry.user.full_name}</span>
                    <Badge variant="outline" className={getActionColor(entry.action)}>
                      {HISTORY_ACTION_LABELS[entry.action] || entry.action}
                    </Badge>
                  </div>
                  {(entry.old_value || entry.new_value) && (
                    <div className="text-sm text-muted-foreground">
                      {entry.field_name}:{" "}
                      {entry.old_value && (
                        <>
                          <span className="line-through text-muted-foreground">{entry.old_value}</span>
                          {" → "}
                        </>
                      )}
                      <span className="text-foreground">{entry.new_value}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {history.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma alteração registrada
          </p>
        )}
      </div>
    </div>
  );
}
