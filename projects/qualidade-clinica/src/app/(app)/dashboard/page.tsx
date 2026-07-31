"use client"

// T-010 + T-011: Dashboard com cards de indicadores fora da meta + alertas
// Rastreabilidade: US-004 (AC-009, AC-010)
// AC-009: Cards de indicadores fora da meta agrupados por módulo
// AC-010: Alertas abertos por severidade

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Activity, TrendingDown } from "lucide-react"
import { SectionCards } from "@/components/dashboard/section-cards"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { AlertsSummary } from "@/components/dashboard/alerts-summary"
import { fetchIndicatorsWithTarget } from "@/server/actions/indicators"
import type { IndicatorsResult } from "@/types/indicators"

interface OutOfTargetIndicator {
  id: string
  name: string
  code: string
  module: string
  value: number
  target: number
  comparator: ">=" | "<="
}

export default function DashboardPage() {
  const [outOfTarget, setOutOfTarget] = useState<{
    farmacia: OutOfTargetIndicator[]
    laboratorio: OutOfTargetIndicator[]
  }>({ farmacia: [], laboratorio: [] })

  useEffect(() => {
    async function load() {
      const [far, lab] = await Promise.all([
        fetchIndicatorsWithTarget("farmacia"),
        fetchIndicatorsWithTarget("laboratorio"),
      ])

      const filterOOR = (result: IndicatorsResult, mod: string) => {
        const lastMonth = result.months[result.months.length - 1]
        if (!lastMonth) return []
        return result.indicators
          .filter((ind) => {
            const value = ind.entries[lastMonth]
            if (value === undefined) return false
            return (ind.comparator === ">=" && value < ind.target) ||
                   (ind.comparator === "<=" && value > ind.target)
          })
          .map((ind) => ({
            id: ind.id,
            name: ind.name,
            code: ind.code,
            module: mod,
            value: ind.entries[lastMonth] ?? 0,
            target: ind.target,
            comparator: ind.comparator,
          }))
      }

      setOutOfTarget({
        farmacia: filterOOR(far, "Farmácia"),
        laboratorio: filterOOR(lab, "Laboratório"),
      })
    }
    load()
  }, [])

  const totalOOR = outOfTarget.farmacia.length + outOfTarget.laboratorio.length

  return (
    <div className="flex flex-1 flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Indicadores críticos e alertas pendentes</p>
      </div>

      <SectionCards />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cards de indicadores fora da meta */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">
              Indicadores fora da meta
              {totalOOR > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {totalOOR}
                </Badge>
              )}
            </h2>
          </div>

          {totalOOR === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Todos os indicadores estão dentro da meta ✓
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Farmácia */}
              {outOfTarget.farmacia.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Farmácia
                      <Badge variant="destructive" className="text-xs">
                        {outOfTarget.farmacia.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {outOfTarget.farmacia.map((ind) => (
                        <div
                          key={ind.id}
                          className="flex items-center justify-between rounded-md border border-red-200 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-tight">{ind.name}</p>
                            <p className="text-[11px] text-muted-foreground">{ind.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-red-600">
                              {ind.value.toFixed(1)}%
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Meta: {ind.comparator} {ind.target}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Laboratório */}
              {outOfTarget.laboratorio.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Laboratório
                      <Badge variant="destructive" className="text-xs">
                        {outOfTarget.laboratorio.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {outOfTarget.laboratorio.map((ind) => (
                        <div
                          key={ind.id}
                          className="flex items-center justify-between rounded-md border border-red-200 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-950/20"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-tight">{ind.name}</p>
                            <p className="text-[11px] text-muted-foreground">{ind.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-red-600">
                              {ind.value.toFixed(1)}%
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Meta: {ind.comparator} {ind.target}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div>
          <AlertsSummary />
        </div>
      </div>

      <ChartAreaInteractive />
    </div>
  )
}
