"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle } from "lucide-react";

interface ApprovalSectionProps {
  onApprove: () => void;
  onReject: (reason: string) => void;
  hasApprovalPending?: boolean;
}

/**
 * T-014 — Seção de aprovação/reprovação exibida ao supervisor quando a tarefa
 * está em "Aguardando Aprovação". Aprovar move pra "Concluído"; reprovar pede
 * justificativa e move de volta pra "Em Andamento".
 */
export function ApprovalSection({ onApprove, onReject, hasApprovalPending = false }: ApprovalSectionProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!hasApprovalPending) return null;

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(reason.trim());
    setReason("");
    setRejectOpen(false);
  };

  return (
    <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Revisão de aprovação
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Analise a tarefa antes de aprovar ou reprovar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
            onClick={() => setRejectOpen((v) => !v)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reprovar
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Aprovar
          </Button>
        </div>
      </div>

      {rejectOpen && (
        <div className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-800">
          <Label className="text-xs text-amber-800 dark:text-amber-200">
            Justificativa da reprovação
          </Label>
          <Textarea
            placeholder="Ex: faltam evidências fotográficas"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-20 resize-none bg-background"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" variant="destructive" disabled={!reason.trim()} onClick={handleReject}>
              Confirmar Reprovação
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}