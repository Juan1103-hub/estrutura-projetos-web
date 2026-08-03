'use client';

import { TaskWithRelations, TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Paperclip, AlertCircle, CheckSquare, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { classifyDeadline } from '@/lib/tasks/deadlines';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: TaskWithRelations;
  onClick?: () => void;
}

// Cores de prioridade com distinção clara — SÃO AS ÚNICAS a chamar atenção
// forte (diretriz 2). Dessaturadas ~30% (tons pastel escuros p/ dark mode).
const priorityColors = {
  baixa: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800/80',
  media: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/60 dark:text-yellow-100 dark:border-yellow-800/80',
  alta: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/60 dark:text-red-200 dark:border-red-800/80',
  critica: 'bg-red-200 text-red-900 border-red-400 font-semibold dark:bg-red-900/70 dark:text-red-100 dark:border-red-700/80',
};

// Categorias são RÓTULO DISCRETO (diretriz 1): fundo neutro cinza translúcido,
// texto colorido sutil, SEM preenchimento saturado — não competem com prioridade.
const CATEGORY_COLORS: { prefix: string; classes: string }[] = [
  { prefix: 'almoxarifado_inventario', classes: 'bg-white/50 text-teal-800 border-transparent dark:bg-white/5 dark:text-teal-300/90 dark:border-transparent' },
  { prefix: 'almoxarifado_ajustes_saldo', classes: 'bg-white/50 text-cyan-800 border-transparent dark:bg-white/5 dark:text-cyan-300/90 dark:border-transparent' },
  { prefix: 'almoxarifado', classes: 'bg-white/50 text-teal-800 border-transparent dark:bg-white/5 dark:text-teal-300/90 dark:border-transparent' },
  { prefix: 'compras_cotacao', classes: 'bg-white/50 text-sky-800 border-transparent dark:bg-white/5 dark:text-sky-300/90 dark:border-transparent' },
  { prefix: 'compras_pedido', classes: 'bg-white/50 text-indigo-800 border-transparent dark:bg-white/5 dark:text-indigo-300/90 dark:border-transparent' },
  { prefix: 'compras', classes: 'bg-white/50 text-sky-800 border-transparent dark:bg-white/5 dark:text-sky-300/90 dark:border-transparent' },
  { prefix: 'administrativo_relatorios', classes: 'bg-white/50 text-violet-800 border-transparent dark:bg-white/5 dark:text-violet-300/90 dark:border-transparent' },
  { prefix: 'administrativo_indicadores', classes: 'bg-white/50 text-fuchsia-800 border-transparent dark:bg-white/5 dark:text-fuchsia-300/90 dark:border-transparent' },
  { prefix: 'administrativo_processos', classes: 'bg-white/50 text-purple-800 border-transparent dark:bg-white/5 dark:text-purple-300/90 dark:border-transparent' },
  { prefix: 'administrativo', classes: 'bg-white/50 text-violet-800 border-transparent dark:bg-white/5 dark:text-violet-300/90 dark:border-transparent' },
];

function categoryColor(category: string): string {
  const match = CATEGORY_COLORS.find((c) => category.startsWith(c.prefix));
  return match?.classes ?? 'bg-white/50 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300/90 dark:border-transparent';
}

const DEADLINE_BADGE = {
  'vence-em-breve': { label: 'Vence em breve', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  atrasada: { label: 'Atrasada', color: 'bg-red-100 text-red-800 border-red-300' },
} as const;

export function TaskCard({ task, onClick }: TaskCardProps) {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const deadlineStatus = classifyDeadline(task);
  // Guardas de null/inválido: responsável pode faltar (FK nula no Supabase) e
  // categoria/prioridade podem chegar com valor desconhecido da API.
  const responsibleName = task.responsible?.full_name ?? "Sem responsável";
  const responsibleInitials =
    task.responsible?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "—";
  const categoryLabel = TASK_CATEGORY_LABELS[task.category] ?? "Geral";
  const priorityLabel = TASK_PRIORITY_LABELS[task.priority] ?? task.priority ?? "—";
  const priorityClass = priorityColors[task.priority] ?? "bg-muted text-muted-foreground border-border";
  const isOverdue = deadlineStatus === 'atrasada';
  const isDueSoon = deadlineStatus === 'vence-em-breve';
  const deadlineBadge =
    deadlineStatus === 'atrasada' || deadlineStatus === 'vence-em-breve'
      ? DEADLINE_BADGE[deadlineStatus]
      : null;

  const completedChecklist = task.checklist_items.filter(item => item.completed).length;
  const totalChecklist = task.checklist_items.length;
  const progressPercent = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  return (
    <Card
      className={cn(
        "p-3.5 cursor-pointer transition-colors",
        "flex flex-col h-full",
        // Diretriz 1: hover dá leve destaque de luminosidade (eleva o card)
        "hover:bg-card/90 hover:ring-1 hover:ring-foreground/15 dark:hover:bg-white/[0.03] dark:hover:ring-white/15",
        isOverdue && "ring-1 ring-red-200 dark:ring-red-900/30",
        isDueSoon && "ring-1 ring-orange-200 dark:ring-orange-900/30"
      )}
      onClick={onClick}
    >
      {/* Header: Title + Priority inline */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
          {task.title}
        </h3>

        {/* Category + Priority row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-auto", categoryColor(task.category))}>
            {categoryLabel}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0.5 h-auto shrink-0", priorityClass)}
          >
            {priorityLabel}
          </Badge>
          {task.help_requested && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-auto shrink-0 bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
              <Flag className="w-2.5 h-2.5" />
              Apoio
            </Badge>
          )}
        </div>
      </div>

      {/* Body: Checklist progress */}
      {totalChecklist > 0 && (
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              Checklist
            </span>
            <span className="font-medium text-foreground">{completedChecklist}/{totalChecklist}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                // Diretriz 5: verde quando 100%, âmbar em progresso
                progressPercent >= 100 ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Due Date + Deadline indicator */}
      {(dueDate || deadlineBadge) && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {dueDate && (
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                isOverdue ? 'text-red-600 dark:text-red-400' :
                isDueSoon ? 'text-orange-600 dark:text-orange-400' :
                'text-muted-foreground'
              )}
            >
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formatDistanceToNow(dueDate, { addSuffix: true, locale: ptBR })}
            </span>
          )}
          {deadlineBadge && (
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-auto shrink-0", deadlineBadge.color)}>
              {deadlineBadge.label}
            </Badge>
          )}
        </div>
      )}

      {/* Footer: Responsible + Counts */}
      <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2 flex-wrap">
        {/* Responsible */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
              {responsibleInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {responsibleName.split(' ')[0]}
          </span>
        </div>

        {/* Counts */}
        <div className="flex items-center gap-2.5 text-muted-foreground flex-shrink-0">
          {task.comments_count > 0 && (
            <span className="flex items-center gap-1 text-xs" title={`${task.comments_count} comentário(s)`}>
              <MessageSquare className="w-3.5 h-3.5" />
              {task.comments_count}
            </span>
          )}
          {task.attachments_count > 0 && (
            <span className="flex items-center gap-1 text-xs" title={`${task.attachments_count} anexo(s)`}>
              <Paperclip className="w-3.5 h-3.5" />
              {task.attachments_count}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}