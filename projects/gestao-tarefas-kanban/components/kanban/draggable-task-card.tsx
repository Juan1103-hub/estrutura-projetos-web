'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskWithRelations } from '@/types/task';
import { TaskCard } from './task-card';

interface DraggableTaskCardProps {
  task: TaskWithRelations;
  onClick?: (task: TaskWithRelations) => void;
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      suppressHydrationWarning
      className={isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
    >
      <TaskCard task={task} onClick={() => onClick?.(task)} />
    </div>
  );
}
