"use client"

// T-009: Página de indicadores do módulo laboratório
// Rastreabilidade: US-001, US-002, US-003, US-005 (AC-001 a AC-008, AC-011)
// Acessível para role 'laboratorio' e role 'qualidade' (Q-001)

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Activity, AlertCircle, CheckCircle2, BarChart3 } from "lucide-react"
import { TabelaMensalIndicadores } from "@/components/indicators/tabela-mensal"
import { FormLancamento } from "@/components/indicators/form-lancamento"
import { GraficoLinhaIndicador } from "@/components/indicators/grafico-linha"
import { GraficoBarraConsolidado } from "@/components/indicators/grafico-barra"
import { DetalheIndicador } from "@/components/indicators/detalhe-indicador"
import { fetchIndicatorsWithTarget, fetchIndicatorEntries } from "@/server/actions/indicators"
import type { IndicatorRow, IndicatorsResult, ChartLineData, ChartBarData } from "@/types/indicators"

export default function IndicadoresLaboratorioPage() {
  const [data, setData] = useState<IndicatorsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [lineChartData, setLineChartData] = useState<ChartLineData[]>([])
  const [barChartData, setBarChartData] = useState<ChartBarData | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await fetchIndicatorsWithTarget("laboratorio")
    setData(result)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (!data) return

    Promise.all(
      data.indicators.map(async (ind) => {
        const entries = await fetchIndicatorEntries(ind.id)
        return { indicator: ind, data: entries }
      })
    ).then(setLineChartData)

    const lastMonth = data.months[data.months.length - 1]
    if (lastMonth) {
      setBarChartData({
        indicators: data.indicators.map((ind) => ({
          name: ind.name,
          fullName: ind.name,
          value: ind.entries[lastMonth] ?? 0,
          target: ind.target,
          comparator: ind.comparator,
          isOutOfTarget:
            (ind.comparator === ">=" && (ind.entries[lastMonth] ?? 0) < ind.target) ||
            (ind.comparator === "<=" && (ind.entries[lastMonth] ?? 0) > ind.target),
        })),
        month: lastMonth,
      })
    }
  }, [data])

  const outOfTargetCount = data
    ? data.indicators.filter((ind) => {
        const lastMonth = data.months[data.months.length - 1]
        const value = lastMonth ? ind.entries[lastMonth] : undefined
        if (value === undefined) return false
        return (ind.comparator === ">=" && value < ind.target) ||
               (ind.comparator === "<=" && value > ind.target)
      }).length
    : 0

  const inTargetCount = data ? data.indicators.length - outOfTargetCount : 0

  const handleSelectIndicator = (ind: IndicatorRow) => {
    setSelectedIndicator(ind)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Indicadores — Laboratório</h1>
          <p className="text-sm text-muted-foreground">
            Indicadores de qualidade do laboratório de reprodução assistida
          </p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Lançar indicador
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de indicadores</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{data?.indicators.length ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dentro da meta</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-emerald-600">{inTargetCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fora da meta</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-red-600">{outOfTargetCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tabela">
        <TabsList>
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
          <TabsTrigger value="graficos">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Gráficos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tabela" className="mt-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Carregando indicadores...
              </CardContent>
            </Card>
          ) : data ? (
            <TabelaMensalIndicadores data={data} onSelectIndicator={handleSelectIndicator} />
          ) : null}
        </TabsContent>

        <TabsContent value="graficos" className="mt-4 space-y-6">
          {barChartData && <GraficoBarraConsolidado data={barChartData} />}
          <div className="grid gap-6 lg:grid-cols-2">
            {lineChartData.map((lcd) => (
              <GraficoLinhaIndicador key={lcd.indicator.id} data={lcd} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <FormLancamento
        open={formOpen}
        onOpenChange={setFormOpen}
        indicators={data?.indicators ?? []}
        onSuccess={loadData}
      />

      <DetalheIndicador
        open={detailOpen}
        onOpenChange={setDetailOpen}
        indicator={selectedIndicator}
      />
    </div>
  )
}
