"use client"

// T-005: Modal/Formulário de lançamento de indicador
// Rastreabilidade: US-002 (AC-004, AC-005, AC-006)
// AC-004: Lançamento com valor e mês preenche a tabela
// AC-005: Lançamento duplicado no mês é bloqueado
// AC-006: Lançamento sem meta vigente exibe aviso

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { createIndicatorEntry } from "@/server/actions/indicators"
import type { IndicatorRow, IndicatorEntryPayload } from "@/types/indicators"

interface FormLancamentoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicators: IndicatorRow[]
  onSuccess?: () => void
}

const MONTHS = (() => {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    months.push({ value, label })
  }
  return months
})()

export function FormLancamento({ open, onOpenChange, indicators, onSuccess }: FormLancamentoProps) {
  const [indicatorId, setIndicatorId] = useState("")
  const [month, setMonth] = useState("")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const selectedIndicator = indicators.find((i) => i.id === indicatorId)

  const handleSubmit = async () => {
    if (!indicatorId || !month || !value) return

    setLoading(true)
    setResult(null)

    const payload: IndicatorEntryPayload = {
      indicator_id: indicatorId,
      month,
      value: parseFloat(value),
    }

    const res = await createIndicatorEntry(payload)
    setLoading(false)

    if (res.success) {
      setResult({ success: true, message: "Lançamento realizado com sucesso!" })
      setIndicatorId("")
      setMonth("")
      setValue("")
      onSuccess?.()
    } else if (res.error) {
      setResult({ success: false, message: res.error.message })
    }
  }

  const handleClose = () => {
    setResult(null)
    setIndicatorId("")
    setMonth("")
    setValue("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lançar Indicador</DialogTitle>
          <DialogDescription>
            Registre o valor mensal de um indicador de qualidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Indicador */}
          <div className="space-y-2">
            <Label>Indicador</Label>
            <Select value={indicatorId} onValueChange={setIndicatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o indicador" />
              </SelectTrigger>
              <SelectContent>
                {indicators.map((ind) => (
                  <SelectItem key={ind.id} value={ind.id}>
                    {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedIndicator && (
              <p className="text-xs text-muted-foreground">
                Meta: {selectedIndicator.comparator} {selectedIndicator.target}% — {selectedIndicator.measure_method}
              </p>
            )}
          </div>

          {/* Mês */}
          <div className="space-y-2">
            <Label>Mês de referência</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label>Valor (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Ex: 85.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`flex items-start gap-2 rounded-md p-3 text-sm ${
                result.success
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!indicatorId || !month || !value || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
