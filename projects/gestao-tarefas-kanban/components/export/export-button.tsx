"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { TaskWithRelations } from "@/types/task";
import { buildWorkbookBuffer, exportFileName } from "@/lib/export/excel";
import { buildPdfBuffer } from "@/lib/export/pdf";

/**
 * T-020 — Botão de exportação (Excel/PDF).
 *
 * Baixa arquivos REAIS:
 * - Excel: .xlsx gerado com a biblioteca `xlsx` (colunas do AC-038);
 * - PDF: .pdf gerado com a biblioteca `jspdf` (resumo dos indicadores, AC-039).
 */

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportButton({ tasks }: { tasks: TaskWithRelations[] }) {
  const exportExcel = () => {
    const buffer = buildWorkbookBuffer(tasks);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    triggerDownload(blob, exportFileName("tarefas", "xlsx"));
  };

  const exportPdf = () => {
    const buffer = buildPdfBuffer(tasks);
    // buildPdfBuffer já devolve um Uint8Array limpo (cópia); o Blob aceita direto.
    const blob = new Blob([buffer], { type: "application/pdf" });
    triggerDownload(blob, exportFileName("relatorio-gerencial", "pdf"));
  };

  return (
    <div className="flex gap-1">
      <Button variant="outline" size="sm" onClick={exportExcel} title="Exportar Excel (.xlsx)">
        <FileSpreadsheet className="h-4 w-4 mr-1.5 text-green-600 dark:text-green-400" />
        Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportPdf} title="Exportar PDF (.pdf)">
        <FileText className="h-4 w-4 mr-1.5 text-red-600 dark:text-red-400" />
        PDF
      </Button>
    </div>
  );
}