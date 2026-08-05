"use client";

import { useState } from "react";
import { ChecklistItem } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, X } from "lucide-react";

interface TaskChecklistSectionProps {
  items: ChecklistItem[];
  /** toggla o estado concluído de um item (persistida via action) */
  onUpdate?: (itemId: string) => void;
  /** adiciona um item ao checklist */
  onAdd?: (title: string) => void;
  /** remove um item do checklist */
  onDelete?: (itemId: string) => void;
  /** pode marcar/desmarcar itens (quem participa da tarefa — executa o trabalho) */
  canUpdate?: boolean;
  /** pode ADICIONAR/REMOVER itens (apenas supervisor) */
  canManage?: boolean;
}

export function TaskChecklistSection({
  items,
  onUpdate,
  onAdd,
  onDelete,
  canUpdate = false,
  canManage = false,
}: TaskChecklistSectionProps) {
  const [newItemText, setNewItemText] = useState("");

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggle = (itemId: string) => {
    if (!canUpdate || !onUpdate) return;
    onUpdate(itemId);
  };

  const handleAdd = () => {
    if (!newItemText.trim() || !onAdd) return;
    onAdd(newItemText.trim());
    setNewItemText("");
  };

  const handleDelete = (itemId: string) => {
    if (!canManage || !onDelete) return;
    onDelete(itemId);
  };

  return (
    <div className="space-y-4">
      {/* Header com progresso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Checklist</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} concluídos
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Lista de itens */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => handleToggle(item.id)}
              disabled={!canUpdate}
              className="mt-0.5"
            />
            <span
              className={`flex-1 text-sm ${
                item.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {item.title}
            </span>
            {/* Remover item: apenas supervisor (canManage) */}
            {canManage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
                aria-label={`Remover item "${item.title}"`}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum item no checklist
          </p>
        )}
      </div>

      {/* Adicionar novo item: apenas supervisor (canManage) */}
      {canManage && (
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleAdd} size="sm" disabled={!newItemText.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Aviso para quem não é supervisor: só marca, não adiciona/remove */}
      {!canManage && canUpdate && (
        <p className="text-xs text-muted-foreground">
          Apenas o supervisor pode adicionar ou remover itens do checklist.
        </p>
      )}
    </div>
  );
}