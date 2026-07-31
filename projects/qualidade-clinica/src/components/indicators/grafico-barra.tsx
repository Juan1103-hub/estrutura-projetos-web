"use client"

// T-007: GraficoBarraConsolidado
// Rastreabilidade: US-003 (AC-008)
// AC-008: Gráfico de barra comparando indicadores do período, fora da meta em vermelho

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import type { ChartBarData } from "@/types/indicators"

interface GraficoBarraProps {
  data: ChartBarData
}

function monthLabel(month: string): string {
  const MONTH_SHORT: Record<string, string> = {
    "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
    "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
    "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
  }
  const monthNum = month.split("-")[1]
  return MONTH_SHORT[monthNum] || month
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(142, 76%, 36%)",
  },
} satisfies ChartConfig

export function GraficoBarraConsolidado({ data }: GraficoBarraProps) {
  const chartData = data.indicators.map((ind) => ({
    name: ind.name,
    fullName: ind.fullName,
    value: ind.value,
    target: ind.target,
    isOutOfTarget: ind.isOutOfTarget,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Comparativo — {monthLabel(data.month)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Indicadores vs. meta no período selecionado
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOutOfTarget ? "hsl(var(--destructive))" : "hsl(142, 76%, 36%)"}
                  opacity={0.85}
                />
              ))}
            </Bar>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="rounded-md border bg-background p-2 shadow-md text-xs">
                    <p className="font-medium">{d.fullName}</p>
                    <p>Valor: <span className="tabular-nums">{d.value.toFixed(1)}%</span></p>
                    <p>Meta: <span className="tabular-nums">{d.target}%</span></p>
                    {d.isOutOfTarget && (
                      <p className="text-destructive font-medium mt-1">⚠ Fora da meta</p>
                    )}
                  </div>
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
