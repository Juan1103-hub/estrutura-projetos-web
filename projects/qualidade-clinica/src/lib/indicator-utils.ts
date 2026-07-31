// Funções puras de indicadores — separadas do "use server" para testabilidade
// Rastreabilidade: US-001, US-002

import { indicadoresFAR } from "../data/indicadores"
import { indicadoresLAB } from "../data/indicadores-lab"
import type { IndicatorRow, IndicatorsResult } from "../types/indicators"

const MONTH_MAP: Record<string, string> = {
  Janeiro: "01", Fevereiro: "02", Março: "03", Abril: "04",
  Maio: "05", Junho: "06", Julho: "07", Agosto: "08",
  Setembro: "09", Outubro: "10", Novembro: "11", Dezembro: "12",
}

export function mesToKey(mes: string): string {
  const year = new Date().getFullYear()
  const monthNum = MONTH_MAP[mes]
  return monthNum ? `${year}-${monthNum}` : ""
}

export function getRecentMonths(count: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return months
}

export function isOutOfTarget(value: number, target: number, comparator: ">=" | "<="): boolean {
  return comparator === ">=" ? value < target : value > target
}

export function buildIndicatorsResult(
  module: "farmacia" | "laboratorio"
): IndicatorsResult {
  const months = getRecentMonths(12)
  const source = module === "farmacia" ? indicadoresFAR : indicadoresLAB

  const indicators: IndicatorRow[] = source.map((ind) => {
    const entries: Record<string, number> = {}
    ind.dados.forEach((d) => {
      const key = mesToKey(d.mes)
      if (key && months.includes(key)) {
        entries[key] = module === "farmacia"
          ? (d as { percentual: number }).percentual
          : (d as { valor: number }).valor
      }
    })

    return {
      id: ind.id,
      module,
      code: ind.id.toUpperCase(),
      name: ind.nome,
      measure_method: ind.formula,
      unit: "%",
      active: true,
      target: ind.meta,
      comparator: "<=" as const,
      entries,
    }
  })

  return { indicators, months }
}
