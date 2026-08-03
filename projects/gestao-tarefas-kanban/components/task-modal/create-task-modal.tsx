"use client";

import { useState } from "react";
import { TaskWithRelations, TaskPriority, TaskCategory, TASK_CATEGORY_LABELS } from "@/types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTask } from "@/app/actions/tasks";
import { listUsers } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const CATEGORY_GROUPS: { label: string; value: TaskCategory }[] = [
  { label: "Inventário", value: "almoxarifado_inventario" },
  { label: "Ajustes de Saldo", value: "almoxarifado_ajustes_saldo" },
  { label: "Controle de Estoque", value: "almoxarifado_controle_estoque" },
  { label: "Recebimento de Materiais", value: "almoxarifado_recebimento" },
  { label: "Organização Física", value: "almoxarifado_organizacao" },
  { label: "Cadastro de Materiais", value: "almoxarifado_cadastro_materiais" },
  { label: "Cotação", value: "compras_cotacao" },
  { label: "Pedido de Compra", value: "compras_pedido" },
  { label: "Negociação", value: "compras_negociacao" },
  { label: "Solicitação de Compra", value: "compras_solicitacao" },
  { label: "Follow-up com Fornecedores", value: "compras_followup" },
  { label: "Relatórios", value: "administrativo_relatorios" },
  { label: "Indicadores", value: "administrativo_indicadores" },
  { label: "Cadastros", value: "administrativo_cadastros" },
  { label: "Processos Internos", value: "administrativo_processos" },
  { label: "Controle Documental", value: "administrativo_controle_documental" },
];

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: "Baixa", value: "baixa" },
  { label: "Média", value: "media" },
  { label: "Alta", value: "alta" },
  { label: "Crítica", value: "critica" },
];

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (task: TaskWithRelations) => void;
  /** Supervisor que está criando a tarefa. */
  requester: { id: string; name: string };
}

export function CreateTaskModal({ open, onClose, onCreated, requester }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Um ou mais responsáveis (primeiro selecionado vira o principal).
  const [responsibleIds, setResponsibleIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [category, setCategory] = useState<TaskCategory>("almoxarifado_inventario");
  const [dueDate, setDueDate] = useState("");
  const [checklistTitles, setChecklistTitles] = useState<string[]>([]);
  const [checklistInput, setChecklistInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const users = listUsers().filter((u) => u.role !== "supervisor");

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setResponsibleIds([]);
    setPriority("media");
    setCategory("almoxarifado_inventario");
    setDueDate("");
    setChecklistTitles([]);
    setChecklistInput("");
    setError(null);
    onClose();
  };

  const addChecklistItem = () => {
    const t = checklistInput.trim();
    if (!t) return;
    setChecklistTitles((prev) => [...prev, t]);
    setChecklistInput("");
  };

  const handleSubmit = async () => {
    setError(null);
    if (!title.trim()) {
      setError("O título é obrigatório");
      return;
    }
    if (responsibleIds.length === 0) {
      setError("Selecione pelo menos um responsável pela tarefa");
      return;
    }
    setSubmitting(true);
    const result = await createTask({
      title,
      description: description || null,
      responsibleId: responsibleIds[0],
      responsibleIds: responsibleIds.length > 1 ? responsibleIds.slice(1) : undefined,
      requesterId: requester.id,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      checklistTitles: checklistTitles.length ? checklistTitles : undefined,
    });
    setSubmitting(false);
    if (!result.ok || !result.task) {
      setError(result.error ?? "Erro ao criar tarefa");
      return;
    }
    onCreated(result.task);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Nova Tarefa</DialogTitle>
          <span className="text-sm text-muted-foreground">
            Atribua uma atividade a um colaborador
          </span>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 pb-6 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300" role="alert">
                {error}
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="create-title" className="text-sm font-medium">Título *</Label>
              <Input
                id="create-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Inventário Setor C, Cotação Fornecedor X, Pedido de Compra #1234"
                aria-required="true"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="create-desc" className="text-sm font-medium">Descrição</Label>
              <Textarea
                id="create-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes da tarefa..."
                className="min-h-24 resize-none"
              />
            </div>

            {/* Responsável (lista completa) e Prioridade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-medium">Responsável(is) *</Label>
                <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
                  {users.map((u) => {
                    const checked = responsibleIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm cursor-pointer transition-colors",
                          checked
                            ? "bg-primary/10 ring-1 ring-primary/30 dark:bg-primary/15"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setResponsibleIds((prev) => [...prev, u.id]);
                            } else {
                              setResponsibleIds((prev) => prev.filter((id) => id !== u.id));
                            }
                          }}
                        />
                        <span className="flex-1">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.roleLabel}</span>
                      </label>
                    );
                  })}
                  <p className="px-2.5 pt-1 text-[11px] text-muted-foreground">
                    {responsibleIds.length === 0
                      ? "Selecione ao menos um responsável"
                      : `${responsibleIds.length} responsável(is) selecionado(s)`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-priority" className="text-sm font-medium">Prioridade</Label>
                <Select value={priority} onValueChange={(v) => setPriority((v ?? "media") as TaskPriority)}>
                  <SelectTrigger id="create-priority" className="w-full">
                    <SelectValue>{PRIORITIES.find((p) => p.value === priority)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Categoria e Prazo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-category" className="text-sm font-medium">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory((v ?? "almoxarifado_inventario") as TaskCategory)}>
                  <SelectTrigger id="create-category" className="w-full">
                    <SelectValue>{TASK_CATEGORY_LABELS[category]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_GROUPS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-due" className="text-sm font-medium">Prazo</Label>
                <Input
                  id="create-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Checklist</Label>
              <div className="flex gap-2">
                <Input
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  placeholder="Ex: Contar itens"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addChecklistItem} disabled={!checklistInput.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {checklistTitles.length > 0 && (
                <ul className="space-y-1.5">
                  {checklistTitles.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                      <span className="flex-1">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        aria-label={`Remover item "${item}"`}
                        onClick={() => setChecklistTitles((prev) => prev.filter((_, j) => j !== i))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-2 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Criando..." : "Criar Tarefa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
