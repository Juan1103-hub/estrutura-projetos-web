"use client"

// T-003: TabelaMensalIndicadores
// Rastreabilidade: US-001 (AC-001, AC-002, AC-003)
// AC-001: Tabela com indicadores, valores dos últimos 12 meses e meta
// AC-002: Indicadores fora da meta destacados em vermelho
// AC-003: Filtro por período

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Eye } from "lucide-react"
import type { IndicatorRow, IndicatorsResult } from "@/types/indicators"

interface TabelaMensalProps {
  data: IndicatorsResult
  onSelectIndicator?: (indicator: IndicatorRow) => void
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
}

const PERIOD_OPTIONS = [
  { label: "Últimos 3 meses", value: "3" },
  { label: "Últimos 6 meses", value: "6" },
  { label: "Último ano", value: "12" },
]

function isOutOfTarget(value: number, target: number, comparator: ">=" | "<=") {
  return comparator === ">=" ? value < target : value > target
}

export function TabelaMensalIndicadores({ data, onSelectIndicator }: TabelaMensalProps) {
  const [period, setPeriod] = useState("12")

  const visibleMonths = data.months.slice(-Number(period))
  const visibleMonthLabels = visibleMonths.map((m) => {
    const monthNum = m.split("-")[1]
    return { key: m, label: MONTH_LABELS[monthNum] || monthNum }
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Tabela de Indicadores</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                Indicador
              </TableHead>
              {visibleMonthLabels.map((m) => (
                <TableHead key={m.key} className="text-center min-w-[60px]">
                  {m.label}
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[70px]">Meta</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.indicators.map((ind) => (
              <TableRow key={ind.id}>
                <TableCell className="sticky left-0 bg-background z-10">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-tight">{ind.name}</p>
                    <p className="text-[11px] text-muted-foreground">{ind.code}</p>
                  </div>
                </TableCell>
                {visibleMonths.map((month) => {
                  const value = ind.entries[month]
                  const hasValue = value !== undefined && value !== null
                  const outOfTarget = hasValue && isOutOfTarget(value, ind.target, ind.comparator)
                  return (
                    <TableCell
                      key={month}
                      className={`text-center tabular-nums text-sm font-medium ${
                        outOfTarget
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                          : ""
                      }`}
                    >
                      {hasValue ? (
                        <span className="inline-flex items-center gap-1">
                          {outOfTarget && <AlertCircle className="h-3 w-3" />}
                          {!outOfTarget && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                          {value.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  )
                })}
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs tabular-nums">
                    {ind.comparator} {ind.target}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {onSelectIndicator && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onSelectIndicator(ind)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
