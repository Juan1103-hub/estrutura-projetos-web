"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { chartData, chartConfig } from "@/data/chart-data"

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-05-31")
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Indicadores x Alertas</CardTitle>
          <CardDescription>
            Últimos 3 meses — comparativo mensal
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(v) => v && setTimeRange(v)}>
          <SelectTrigger className="w-40" aria-label="Selecionar período">
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">Últimos 3 meses</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIndicadores" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-indicadores)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-indicadores)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAlertas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-alertas)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-alertas)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="alertas"
              type="natural"
              fill="url(#fillAlertas)"
              stroke="var(--color-alertas)"
              stackId="a"
            />
            <Area
              dataKey="indicadores"
              type="natural"
              fill="url(#fillIndicadores)"
              stroke="var(--color-indicadores)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
