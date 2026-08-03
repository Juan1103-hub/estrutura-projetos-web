"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_CATEGORY_LABELS, TASK_PRIORITY_LABELS } from "@/types/task";
import { Search, X, Filter } from "lucide-react";
import { TaskFilters } from "@/lib/tasks/filters";

export const CATEGORY_GROUPS: Record<string, string[]> = {
  Almoxarifado: [
    "almoxarifado_controle_estoque",
    "almoxarifado_inventario",
    "almoxarifado_cadastro_materiais",
    "almoxarifado_ajustes_saldo",
    "almoxarifado_recebimento",
    "almoxarifado_organizacao",
    "almoxarifado_controle_minmax",
  ],
  Compras: [
    "compras_solicitacao",
    "compras_cotacao",
    "compras_negociacao",
    "compras_pedido",
    "compras_followup",
    "compras_contratacao",
  ],
  Administrativo: [
    "administrativo_relatorios",
    "administrativo_indicadores",
    "administrativo_cadastros",
    "administrativo_processos",
    "administrativo_auditorias",
    "administrativo_controle_documental",
  ],
};

interface FiltersBarProps {
  responsibleOptions: { id: string; name: string }[];
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  activeCount: number;
}

export function FiltersBar({ responsibleOptions, filters, onChange, activeCount }: FiltersBarProps) {
  const set = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch });

  const isActive = activeCount > 0;

  return (
    <div className="mb-5 rounded-xl border border-border/60 bg-muted/30 p-3 flex flex-wrap items-end gap-3">
      {/* Busca por texto */}
      <div className="flex flex-col gap-1.5 min-w-[220px] flex-1">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Search className="h-3.5 w-3.5" />
          Buscar
        </Label>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => set({ search: e.target.value || null })}
            placeholder="Título ou descrição..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Responsável */}
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Responsável</Label>
        <Select
          value={filters.responsibleId ?? ""}
          onValueChange={(v) => set({ responsibleId: v || null })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {responsibleOptions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categoria */}
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Categoria</Label>
        <Select
          value={filters.category ?? ""}
          onValueChange={(v) => set({ category: (v || null) as TaskFilters["category"] })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="">Todas</SelectItem>
            {Object.entries(CATEGORY_GROUPS).map(([group, cats]) => (
              <div key={group}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {group}
                </div>
                {cats.map((c) => (
                  <SelectItem key={c} value={c}>
                    {TASK_CATEGORY_LABELS[c as keyof typeof TASK_CATEGORY_LABELS]}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prioridade */}
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Prioridade</Label>
        <Select
          value={filters.priority ?? ""}
          onValueChange={(v) => set({ priority: (v || null) as TaskFilters["priority"] })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Limpar filtros */}
      <div className="flex items-end pb-0.5">
        <Button
          variant={isActive ? "default" : "ghost"}
          size="sm"
          className={isActive ? "" : "text-muted-foreground"}
          onClick={() =>
            onChange({ responsibleId: null, category: null, priority: null, search: null })
          }
        >
          <Filter className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>

      {isActive && (
        <div className="flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400">
          <X className="h-3 w-3" />
          {activeCount} filtro(s) ativo(s)
        </div>
      )}
    </div>
  );
}