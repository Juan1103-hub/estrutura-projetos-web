"use server"

// Server actions para o módulo de Indicadores de Qualidade
// Rastreabilidade: US-001 (AC-001, AC-002, AC-003), US-002 (AC-004, AC-005, AC-006)
//
// NOTA: Atualmente usa dados mock. Quando o Supabase client estiver configurado,
// substituir as queries por Supabase com RLS (conforme schema do projeto).

import { indicadoresFAR } from "@/data/indicadores"
import { indicadoresLAB } from "@/data/indicadores-lab"
import type {
  IndicatorRow,
  IndicatorsResult,
  IndicatorEntryPayload,
  EntryError,
} from "@/types/indicators"

// ── Helpers ──────────────────────────────────────────────────────────

/** Gera os últimos N meses no formato YYYY-MM */
function getRecentMonths(count: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return months
}

/** Mapeamento de nomes de mês PT-BR para YYYY-MM */
const MONTH_MAP: Record<string, string> = {
  Janeiro: "01", Fevereiro: "02", Março: "03", Abril: "04",
  Maio: "05", Junho: "06", Julho: "07", Agosto: "08",
  Setembro: "09", Outubro: "10", Novembro: "11", Dezembro: "12",
}

/** Converte nome de mês PT-BR para YYYY-MM do ano corrente */
function mesToKey(mes: string): string {
  const year = new Date().getFullYear()
  const monthNum = MONTH_MAP[mes]
  return monthNum ? `${year}-${monthNum}` : ""
}

// ── T-001: Buscar indicadores com metas vigentes ────────────────────

/**
 * Busca indicadores de um módulo com suas metas vigentes.
 * Implementação mock — substituir por query Supabase:
 *   indicators JOIN indicator_targets ON ...
 *   WHERE indicators.module = module AND indicators.active = true
 *   AND indicator_targets.valid_from <= CURRENT_DATE
 */
export async function fetchIndicatorsWithTarget(
  module: "farmacia" | "laboratorio"
): Promise<IndicatorsResult> {
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

// ── T-002: Buscar entradas dos últimos 12 meses ─────────────────────

/**
 * Retorna as entradas de um indicador específico nos últimos 12 meses.
 * Implementação mock — substituir por:
 *   SELECT * FROM indicator_entries
 *   WHERE indicator_id = $1 AND month >= $2
 *   ORDER BY month ASC
 */
export async function fetchIndicatorEntries(
  indicatorId: string
): Promise<{ month: string; value: number; target: number }[]> {
  const months = getRecentMonths(12)
  const allIndicators = [...indicadoresFAR, ...indicadoresLAB]
  const ind = allIndicators.find((i) => i.id === indicatorId)
  if (!ind) return []

  return months.map((month) => {
    const match = ind.dados.find((d) => mesToKey(d.mes) === month)
    const value = match
      ? "valor" in match
        ? match.valor
        : "percentual" in match
          ? match.percentual
          : 0
      : 0
    return { month, value, target: ind.meta }
  })
}

// ── T-004: Lançar valor de indicador ─────────────────────────────────

// Armazenamento temporário em memória (mock) — substituir por INSERT no Supabase
const entriesStore = new Map<string, number>()

/**
 * Lança o valor mensal de um indicador.
 * Validações:
 *   1. Meta vigente deve existir (AC-006 → META_AUSENTE)
 *   2. Lançamento duplicado no mês é bloqueado (AC-005 → INDICADOR_DUPLICADO)
 *   3. Valor deve ser numérico (AC-004 → VALOR_INVALIDO)
 */
export async function createIndicatorEntry(
  payload: IndicatorEntryPayload
): Promise<{ success: boolean; error?: EntryError }> {
  const { indicator_id, month, value } = payload

  // Validar valor
  if (typeof value !== "number" || isNaN(value)) {
    return {
      success: false,
      error: { type: "VALOR_INVALIDO", message: "O valor deve ser um número válido." },
    }
  }

  // Buscar indicador para verificar meta
  const allIndicators = [...indicadoresFAR, ...indicadoresLAB]
  const ind = allIndicators.find((i) => i.id === indicator_id)
  if (!ind) {
    return {
      success: false,
      error: { type: "META_AUSENTE", message: "Indicador não encontrado." },
    }
  }

  // Verificar meta vigente (mock: sempre existe se o indicador existe)
  // Implementação real: SELECT FROM indicator_targets WHERE indicator_id = $1 AND valid_from <= $2
  const hasTarget = ind.meta > 0 || ind.meta === 0
  if (!hasTarget) {
    return {
      success: false,
      error: {
        type: "META_AUSENTE",
        message: `Não há meta vigente para o indicador "${ind.nome}". Defina uma meta antes de lançar.`,
      },
    }
  }

  // Verificar duplicata
  const key = `${indicator_id}:${month}`
  if (entriesStore.has(key)) {
    return {
      success: false,
      error: {
        type: "INDICADOR_DUPLICADO",
        message: `Já existe um lançamento para "${ind.nome}" em ${month}. Use retificação para alterar.`,
      },
    }
  }

  // Salvar (mock)
  entriesStore.set(key, value)

  // Implementação real:
  // INSERT INTO indicator_entries (indicator_id, month, value, created_by)
  // VALUES ($1, $2, $3, auth.uid())
  // ON CONFLICT (indicator_id, month) DO NOTHING
  // → retornar INDICADOR_DUPLICADO se conflict

  return { success: true }
}
