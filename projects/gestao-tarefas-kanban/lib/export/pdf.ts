import { jsPDF } from "jspdf";
import { TaskWithRelations } from "@/types/task";
import {
  countTasks,
  productivityByCollaborator,
  completionRateWithinDeadline,
} from "@/lib/analytics/metrics";

/**
 * T-020 — Exportação para PDF (AC-039).
 *
 * Gera um arquivo PDF REAL com a biblioteca jspdf, contendo o resumo dos
 * indicadores do dashboard: contadores, taxa de conclusão no prazo e ranking
 * de produtividade.
 */

export interface PdfReport {
  title: string;
  generatedAt: string;
  /** conteúdo textual do relatório (para teste/inspeção). */
  content: string;
}

/** Monta as linhas do relatório (base de texto do PDF). */
function buildReportLines(tasks: TaskWithRelations[]): string[] {
  const counters = countTasks(tasks);
  const rate = completionRateWithinDeadline(tasks);
  const ranking = productivityByCollaborator(tasks);

  return [
    "RELATORIO GERENCIAL — VORTICE MINERAL",
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    "",
    "INDICADORES",
    `  Abertas: ${counters.abertas}`,
    `  Em andamento: ${counters.em_andamento}`,
    `  Concluidas: ${counters.concluidas}`,
    `  Atrasadas: ${counters.atrasadas}`,
    `  Taxa de conclusao no prazo: ${rate.taxa}%`,
    "",
    "PRODUTIVIDADE POR COLABORADOR",
    ...ranking.map((r, i) => `  ${i + 1}. ${r.name} - ${r.concluidas} tarefa(s)`),
  ];
}

/** Monta o relatório em PDF (AC-039). Retorna o PDF serializado (ArrayBuffer). */
export function buildPdfBuffer(tasks: TaskWithRelations[]): ArrayBuffer {
  const lines = buildReportLines(tasks);
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RELATORIO GERENCIAL", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Vortice Mineral - ${new Date().toLocaleDateString("pt-BR")}`, 14, 26);

  let y = 36;
  lines.slice(2).forEach((line) => {
    // quebra linha se passar do fim da página
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    const isSection = line && line === line.toUpperCase() && !line.startsWith(" ");
    if (isSection) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }
    doc.text(line, 14, y);
    y += isSection ? 7 : 5;
  });

  // doc.output("arraybuffer") retorna um ArrayBuffer; copiamos para um
  // ArrayBuffer "limpo" (mesmo tamanho) para o navegador montar o Blob
  // sem perder bytes nem reter o pool de memória do jspdf.
  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  return arrayBuffer.slice(0);
}

/** Conteúdo textual do relatório (para o teste AC-039). */
export function buildPdfReport(tasks: TaskWithRelations[]): PdfReport {
  const lines = buildReportLines(tasks);
  return {
    title: "Relatório Gerencial",
    generatedAt: new Date().toISOString(),
    content: lines.join("\n"),
  };
}