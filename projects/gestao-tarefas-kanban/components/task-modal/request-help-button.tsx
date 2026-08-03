"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LifeBuoy, RotateCcw } from "lucide-react";
import { requestHelp, requestReopen } from "@/app/actions/task-requests";

/**
 * T-024 — Botões de solicitar apoio e reabertura (AC-048/049).
 *
 * - Apoio: visível em tarefas em andamento/travadas; pede justificativa.
 * - Reabertura: visível em tarefas concluídas; pede justificativa.
 */
interface RequestHelpButtonProps {
  taskId: string;
  /** true = tarefa concluída (mostra "Solicitar Reabertura") */
  isCompleted?: boolean;
  onDone?: () => void;
}

export function RequestHelpButton({ taskId, isCompleted = false, onDone }: RequestHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason.trim()) {
      setStatus("error");
      setError("Justificativa é obrigatória");
      return;
    }
    const result = isCompleted
      ? await requestReopen({ taskId, reason })
      : await requestHelp({ taskId, reason });
    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Erro ao enviar");
      return;
    }
    setStatus("idle");
    setReason("");
    setOpen(false);
    onDone?.();
  };

  const label = isCompleted ? "Solicitar Reabertura" : "Solicitar Apoio";
  const Icon = isCompleted ? RotateCcw : LifeBuoy;

  return (
    <div className="space-y-2">
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Icon className="h-4 w-4 mr-1.5" />
          {label}
        </Button>
      ) : (
        <div className="space-y-2 rounded-lg border border-border/60 p-3 bg-muted/30">
          <Label className="text-xs text-muted-foreground">
            {isCompleted ? "Motivo da reabertura" : "Descreva o que precisa"}
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isCompleted ? "Ex: código do material está errado" : "Ex: fornecedor não responde há 3 dias"}
            className="min-h-16 resize-none"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={submit}>
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}