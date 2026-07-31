// Tipos para o módulo de Indicadores de Qualidade
// Rastreabilidade: US-001, US-002, US-005

/** Indicador cadastrado (tabela indicators) */
export interface Indicator {
  id: string
  module: "farmacia" | "laboratorio"
  code: string
  name: string
  measure_method: string
  unit: string
  active: boolean
}

/** Meta vigente de um indicador (tabela indicator_targets) */
export interface IndicatorTarget {
  id: string
  indicator_id: string
  target: number
  comparator: ">=" | "<="
  valid_from: string // YYYY-MM-DD
}

/** Entrada mensal de um indicador (tabela indicator_entries) */
export interface IndicatorEntry {
  id: string
  indicator_id: string
  month: string // YYYY-MM (1º dia)
  value: number
  created_by: string
  created_at: string
}

/** Indicador com sua meta vigente (join indicator + target) */
export interface IndicatorWithTarget extends Indicator {
  target: number
  comparator: ">=" | "<="
}

/** Indicador com valores mensais e meta (para a tabela) */
export interface IndicatorRow extends IndicatorWithTarget {
  entries: Record<string, number> // { "2026-01": 85.5, "2026-02": 90.0, ... }
}

/** Resultado da busca de indicadores para um módulo */
export interface IndicatorsResult {
  indicators: IndicatorRow[]
  months: string[] // ["2026-01", "2026-02", ...] últimos 12 meses
}

/** Dados para gráfico de linha de um indicador */
export interface ChartLineData {
  indicator: IndicatorWithTarget
  data: { month: string; value: number; target: number }[]
}

/** Dados para gráfico de barra consolidado */
export interface ChartBarData {
  indicators: {
    name: string
    fullName: string
    value: number
    target: number
    comparator: ">=" | "<="
    isOutOfTarget: boolean
  }[]
  month: string
}

/** Payload para lançamento de indicador */
export interface IndicatorEntryPayload {
  indicator_id: string
  month: string // YYYY-MM
  value: number
}

/** Erro do lançamento */
export type EntryError =
  | { type: "META_AUSENTE"; message: string }
  | { type: "INDICADOR_DUPLICADO"; message: string }
  | { type: "VALOR_INVALIDO"; message: string }
