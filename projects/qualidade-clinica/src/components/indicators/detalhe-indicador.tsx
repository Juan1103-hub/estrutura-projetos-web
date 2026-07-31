"use client"

// T-012: Detalhe do indicador (painel lateral)
// Rastreabilidade: US-005 (AC-011)
// AC-011: Painel com nome, código, unidade, método, responsável e histórico

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import type { IndicatorRow } from "@/types/indicators"

interface DetalheIndicadorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicator: IndicatorRow | null
}

const MONTH_FULL: Record<string, string> = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro",
}

function isOutOfTarget(value: number, target: number, comparator: ">=" | "<=") {
  return comparator === ">=" ? value < target : value > target
}

export function DetalheIndicador({ open, onOpenChange, indicator }: DetalheIndicadorProps) {
  if (!indicator) return null

  const entries = Object.entries(indicator.entries)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => {
      const [year, monthNum] = month.split("-")
      return {
        month,
        label: `${MONTH_FULL[monthNum] || monthNum} ${year}`,
        value,
        outOfTarget: isOutOfTarget(value, indicator.target, indicator.comparator),
      }
    })

  const latestValue = entries.length > 0 ? entries[entries.length - 1].value : null
  const outOfTargetCount = entries.filter((e) => e.outOfTarget).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">{indicator.name}</SheetTitle>
          <SheetDescription>{indicator.code}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Info geral */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Módulo</p>
              <Badge variant="secondary" className="capitalize">
                {indicator.module}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Unidade</p>
              <p className="text-sm font-medium">{indicator.unit}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Meta</p>
              <p className="text-sm font-medium tabular-nums">
                {indicator.comparator} {indicator.target}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Último valor</p>
              <p className="text-sm font-medium tabular-nums">
                {latestValue !== null ? `${latestValue.toFixed(1)}%` : "—"}
              </p>
            </div>
          </div>

          {/* Método de aferição */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Método de aferição</p>
            <p className="text-sm">{indicator.measure_method}</p>
          </div>

          {/* Resumo */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{entries.length - outOfTargetCount} dentro da meta</span>
            </div>
            {outOfTargetCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                <span>{outOfTargetCount} fora da meta</span>
              </div>
            )}
          </div>

          {/* Histórico */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Histórico de valores</p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Mês</TableHead>
                    <TableHead className="text-xs text-right">Valor</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.month}>
                      <TableCell className="text-xs">{e.label}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-medium">
                        {e.value.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        {e.outOfTarget ? (
                          <AlertCircle className="h-3.5 w-3.5 text-red-600 mx-auto" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
