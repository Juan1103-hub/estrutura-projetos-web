"use client"

// T-006: GraficoLinhaIndicador
// Rastreabilidade: US-003 (AC-007)
// AC-007: Gráfico de linha com evolução mensal e linha da meta como referência

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import type { ChartLineData } from "@/types/indicators"

interface GraficoLinhaProps {
  data: ChartLineData
}

const MONTH_SHORT: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function GraficoLinhaIndicador({ data }: GraficoLinhaProps) {
  const chartData = data.data.map((d) => ({
    ...d,
    label: MONTH_SHORT[d.month.split("-")[1]] || d.month,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{data.indicator.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Meta: {data.indicator.comparator} {data.indicator.target}% — {data.indicator.unit}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <ReferenceLine
              y={data.indicator.target}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Meta ${data.indicator.target}%`,
                position: "right",
                fontSize: 10,
                fill: "hsl(var(--destructive))",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-value)" }}
              activeDot={{ r: 5 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
