'use client';

import { useDroppable } from '@dnd-kit/core';
import { TaskWithRelations, TaskStatus, TASK_STATUS_LABELS } from '@/types/task';
import { DraggableTaskCard } from './draggable-task-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { classifyDeadline } from '@/lib/tasks/deadlines';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskWithRelations[];
  onTaskClick?: (task: TaskWithRelations) => void;
  /** true no modo empilhado (mobile): a coluna ocupa a largura do board. */
  stack?: boolean;
}

export function KanbanColumn({ status, tasks, onTaskClick, stack = false }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
  });

  // Contador neutro por padrão; vermelho só se a coluna tiver alguma tarefa
  // atrasada/vencida (diretriz 3: destacar atraso, não toda contagem).
  const hasOverdue = tasks.some((t) => classifyDeadline(t) === 'atrasada');

  return (
    <div
      className={cn(
        stack
          ? "flex flex-col gap-4 w-full max-w-2xl"
          : "flex flex-col h-full min-w-[272px] w-[clamp(272px,26vw,336px)] shrink-0 snap-start"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">
            {TASK_STATUS_LABELS[status]}
          </h2>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs transition-colors",
              hasOverdue
                ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                : "bg-muted text-muted-foreground dark:bg-muted/70 dark:text-muted-foreground"
            )}
          >
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Column Content — superfície um tom acima do fundo, borda 1px sutil */}
      <div className="flex-1 min-h-0 pr-2 overflow-y-auto">
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-3 min-h-[200px] rounded-xl border border-border/70 bg-muted/40 p-3 transition-all",
            "dark:bg-muted/25 dark:border-white/10",
            isOver
              ? 'bg-amber-50 dark:bg-amber-950/30 ring-2 ring-orange-300 dark:ring-orange-600'
              : ''
          )}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Nenhuma tarefa
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
