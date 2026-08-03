"use client";

import { TaskWithRelations } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Tag, AlertCircle, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TASK_PRIORITY_LABELS, TASK_CATEGORY_LABELS, TASK_STATUS_LABELS, Task } from "@/types/task";

interface TaskInfoSectionProps {
  task: TaskWithRelations;
  onUpdate?: (field: keyof Task, value: any) => void;
  canEdit?: boolean;
}

const priorityColors = {
  baixa: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  media: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
  alta: "bg-orange-500/10 text-orange-800 dark:text-orange-300",
  critica: "bg-red-500/10 text-red-700 dark:text-red-300",
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

function FieldLabel({ icon: Icon, children }: { icon?: typeof User; children: React.ReactNode }) {
  return (
    <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </Label>
  );
}

export function TaskInfoSection({ task, onUpdate, canEdit = false }: TaskInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Grupo 1: Pessoas */}
      <div className="space-y-3">
        <FieldLabel icon={Users}>Responsáveis</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-teal-600 text-white text-xs">
                {task.responsible ? getInitials(task.responsible.full_name) : "—"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Responsável</p>
              <p className="text-sm font-medium truncate">
                {task.responsible?.full_name ?? "Sem responsável"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-slate-600 text-white text-xs">
                {task.requester ? getInitials(task.requester.full_name) : "—"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Solicitante</p>
              <p className="text-sm font-medium truncate">
                {task.requester?.full_name ?? "Sem solicitante"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grupo 2: Datas */}
      <div className="space-y-3">
        <FieldLabel icon={Calendar}>Datas</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Data de Criação</p>
            <p className="text-sm font-medium">
              {format(new Date(task.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          {task.due_date ? (
            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm font-medium">
                {format(new Date(task.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          ) : (
            <div className="space-y-1 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs text-muted-foreground">Prazo</p>
              <p className="text-sm text-muted-foreground">Sem prazo definido</p>
            </div>
          )}
        </div>
      </div>

      {/* Grupo 3: Classificação */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5" />
          Classificação
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Prioridade</p>
            {canEdit ? (
              <Select value={task.priority} onValueChange={(value) => onUpdate?.("priority", value as Task["priority"])}>
                <SelectTrigger className="w-full">
                  <SelectValue>{TASK_PRIORITY_LABELS[task.priority]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={priorityColors[task.priority]}>{TASK_PRIORITY_LABELS[task.priority]}</Badge>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Categoria</p>
            <Badge variant="outline" className="bg-teal-500/10 text-teal-700 dark:text-teal-300 whitespace-normal h-auto min-h-5 overflow-visible text-left">
              {TASK_CATEGORY_LABELS[task.category]}
            </Badge>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="outline" className="whitespace-normal h-auto min-h-5 overflow-visible text-left">
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Apoio Solicitado */}
      {task.help_requested && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            ⚠️ Apoio solicitado
          </p>
          {task.help_reason && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {task.help_reason}
            </p>
          )}
        </div>
      )}

      {/* Reprovação */}
      {task.rejection_reason && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
            Tarefa reprovada
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {task.rejection_reason}
          </p>
        </div>
      )}
    </div>
  );
}