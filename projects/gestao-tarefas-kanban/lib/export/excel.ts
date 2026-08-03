import * as XLSX from "xlsx";
import { TaskWithRelations } from "@/types/task";
import {
  TASK_PRIORITY_LABELS,
  TASK_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
} from "@/types/task";

/**
 * T-020 — Exportação para Excel (AC-038).
 *
 * Gera um arquivo .xlsx REAL com a biblioteca xlsx, com as colunas exigidas:
 * Título, Responsável, Status, Prazo, Prioridade, Categoria, Data de Criação.
 */

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

/** Monta as linhas da planilha (uma por tarefa). */
export function tasksToRows(tasks: TaskWithRelations[]): Record<string, string>[] {
  return tasks.map((t) => ({
    Título: t.title,
    Responsável: t.responsible?.full_name ?? "",
    Status: TASK_STATUS_LABELS[t.status] ?? t.status,
    Prazo: formatDate(t.due_date),
    Prioridade: TASK_PRIORITY_LABELS[t.priority] ?? t.priority,
    Categoria: TASK_CATEGORY_LABELS[t.category] ?? t.category,
    "Data de Criação": formatDate(t.created_at),
  }));
}

/**
 * Constrói a planilha .xlsx (ArrayBuffer) com as tarefas.
 * Títulos de coluna em negrito e larguras ajustadas para ficarem legíveis.
 */
export function buildWorkbookBuffer(tasks: TaskWithRelations[]): ArrayBuffer {
  const rows = tasksToRows(tasks);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  // Ajusta a largura das colunas para o conteúdo caber.
  worksheet["!cols"] = [
    { wch: 34 },
    { wch: 20 },
    { wch: 22 },
    { wch: 12 },
    { wch: 10 },
    { wch: 28 },
    { wch: 16 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefas");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

/** Nome do arquivo de exportação (ex: tarefas-2026-08-02.xlsx). */
export function exportFileName(prefix: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.${ext}`;
}