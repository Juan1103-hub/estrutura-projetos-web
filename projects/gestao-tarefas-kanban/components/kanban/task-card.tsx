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

// Cores de prioridade — HIERARQUIA RÍGIDA (diretriz 1):
// Alta e Crítica = cor saturada (vermelho/laranja) e única a chamar atenção forte.
// Baixa e Média = neutro discreto (sem preenchimento saturado).
// Contraste AA no dark mode: texto claro (L≥0.85) sobre fundo escuro (L≤0.30).
const priorityColors = {
  // Baixa/Média: neutro — não competem com Alta/Crítica.
  baixa: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent',
  media: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent',
  // Alta: vermelho saturado (danger), a única prioridade que grita.
  alta: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-900/60',
  // Crítica: vermelho ainda mais forte, com peso (semibold).
  critica: 'bg-red-200 text-red-900 border-red-400 font-semibold dark:bg-red-900/80 dark:text-red-100 dark:border-red-700/60',
};

// Categorias são RÓTULO DISCRETO: fundo neutro cinza translúcido, texto em tom
// neutro levemente entonado. NUNCA cor saturada — não competem com prioridade.
const CATEGORY_COLORS: { prefix: string; classes: string }[] = [
  { prefix: 'almoxarifado_inventario', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'almoxarifado_ajustes_saldo', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'almoxarifado', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'compras_cotacao', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'compras_pedido', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'compras', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'administrativo_relatorios', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'administrativo_indicadores', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'administrativo_processos', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
  { prefix: 'administrativo', classes: 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent' },
];

function categoryColor(category: string): string {
  const match = CATEGORY_COLORS.find((c) => category.startsWith(c.prefix));
  return match?.classes ?? 'bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 dark:border-transparent';
}

const DEADLINE_BADGE = {
  'vence-em-breve': { label: 'Vence em breve', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-900/60' },
  atrasada: { label: 'Atrasada', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-900/60' },
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
        "p-3 cursor-pointer transition-colors",
        "flex flex-col h-full",
        // Hover: leve destaque de luminosidade (eleva o card)
        "hover:bg-card/90 hover:ring-1 hover:ring-foreground/15 dark:hover:bg-white/[0.03] dark:hover:ring-white/15",
        // Atrasada: destaque forte — anel vermelho 2px (sobrepõe o anel cinza do Card)
        isOverdue && "ring-2 ring-red-500/70 dark:ring-red-500/80",
        // Vence em breve: destaque médio — anel laranja 1px, menos agressivo que atrasada
        isDueSoon && "ring-1 ring-orange-400/60 dark:ring-orange-500/70"
      )}
      onClick={onClick}
    >
      {/* Header: Title + tags — espaçamento compacto */}
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground">
          {task.title}
        </h3>

        {/* Tags: uma linha, gap reduzido — prioridade tem peso próprio */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-auto leading-4", categoryColor(task.category))}>
            {categoryLabel}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-[10px] px-2 py-0 h-auto leading-4 shrink-0", priorityClass)}
          >
            {priorityLabel}
          </Badge>
          {task.help_requested && (
            <Badge variant="outline" className="text-[10px] px-2 py-0 h-auto leading-4 shrink-0 bg-muted/80 text-slate-700 border-transparent dark:bg-white/5 dark:text-slate-300 flex items-center gap-1">
              <Flag className="w-2.5 h-2.5" />
              Apoio
            </Badge>
          )}
        </div>
      </div>

      {/* Body: Checklist progress — respiro menor entre seções */}
      {totalChecklist > 0 && (
        <div className="mt-2.5 flex flex-col gap-1">
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
                // Verde quando 100%, âmbar em progresso
                progressPercent >= 100 ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Due Date + Deadline indicator */}
      {(dueDate || deadlineBadge) && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                // Atrasada: vermelho saturado; vence em breve: laranja; resto neutro
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
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0 h-auto leading-4 shrink-0", deadlineBadge.color)}>
              {deadlineBadge.label}
            </Badge>
          )}
        </div>
      )}

      {/* Footer: avatar + comentários + anexos numa única linha, sem quebrar */}
      <div className="mt-auto pt-2 border-t flex items-center justify-between gap-2">
        {/* Responsável */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Avatar className="w-5 h-5 flex-shrink-0">
            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground dark:bg-white/10 dark:text-slate-300">
              {responsibleInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {responsibleName.split(' ')[0]}
          </span>
        </div>

        {/* Contadores: comentários + anexos, sem wrap */}
        <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
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