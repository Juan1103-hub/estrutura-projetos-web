"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, AlertCircle, Save, Activity } from "lucide-react"

// Indicadores LAB do Excel
const indicadoresLAB = [
  {
    id: "fertilizacao",
    nome: "Taxa de Fertilização",
    formula: "(Oócitos fertilizados / Oócitos injetados) × 100",
    meta: 70,
    dados: [
      { mes: "Janeiro", valor: 77, meta: 70 },
      { mes: "Fevereiro", valor: 80, meta: 70 },
      { mes: "Março", valor: 85, meta: 70 },
      { mes: "Abril", valor: 81, meta: 70 },
      { mes: "Maio", valor: 75, meta: 70 },
      { mes: "Junho", valor: 81, meta: 70 },
      { mes: "Julho", valor: 80, meta: 70 },
      { mes: "Agosto", valor: 80, meta: 70 },
      { mes: "Setembro", valor: 81, meta: 70 },
      { mes: "Outubro", valor: 82, meta: 70 },
      { mes: "Novembro", valor: 82, meta: 70 },
      { mes: "Dezembro", valor: 95, meta: 70 },
    ]
  },
  {
    id: "blastocisto",
    nome: "Taxa de Desenvolvimento de Blastocisto",
    formula: "(Blastocistos D5 / Oócitos fertilizados) × 100",
    meta: 50,
    dados: [
      { mes: "Janeiro", valor: 52, meta: 50 },
      { mes: "Fevereiro", valor: 57, meta: 50 },
      { mes: "Março", valor: 50, meta: 50 },
      { mes: "Abril", valor: 62, meta: 50 },
      { mes: "Maio", valor: 53, meta: 50 },
      { mes: "Junho", valor: 58, meta: 50 },
      { mes: "Julho", valor: 54, meta: 50 },
      { mes: "Agosto", valor: 56, meta: 50 },
      { mes: "Setembro", valor: 60, meta: 50 },
      { mes: "Outubro", valor: 63, meta: 50 },
      { mes: "Novembro", valor: 40, meta: 50 },
      { mes: "Dezembro", valor: 55, meta: 50 },
    ]
  },
  {
    id: "formacao",
    nome: "Taxa de Formação de Blastocisto",
    formula: "(Blast boa qual D5 / Oócit 2PN D1) × 100",
    meta: 60,
    dados: [
      { mes: "Janeiro", valor: 48, meta: 60 },
      { mes: "Fevereiro", valor: 51, meta: 60 },
      { mes: "Março", valor: 52, meta: 60 },
      { mes: "Abril", valor: 55, meta: 60 },
      { mes: "Maio", valor: 51, meta: 60 },
      { mes: "Junho", valor: 55, meta: 60 },
      { mes: "Julho", valor: 48, meta: 60 },
      { mes: "Agosto", valor: 56, meta: 60 },
      { mes: "Setembro", valor: 60, meta: 60 },
      { mes: "Outubro", valor: 60, meta: 60 },
      { mes: "Novembro", valor: 40, meta: 60 },
      { mes: "Dezembro", valor: 55, meta: 60 },
    ]
  },
  {
    id: "sobrevivencia_oocitos",
    nome: "Taxa Sobrevivência Oócitos Criopreservados",
    formula: "(Oócitos intactos / Oócitos descong) × 100",
    meta: 85,
    dados: [
      { mes: "Janeiro", valor: 90, meta: 85 },
      { mes: "Fevereiro", valor: 94, meta: 85 },
      { mes: "Março", valor: 89, meta: 85 },
      { mes: "Abril", valor: 83, meta: 85 },
      { mes: "Maio", valor: 100, meta: 85 },
      { mes: "Junho", valor: 93, meta: 85 },
      { mes: "Julho", valor: 93, meta: 85 },
      { mes: "Agosto", valor: 93, meta: 85 },
      { mes: "Setembro", valor: 90, meta: 85 },
      { mes: "Outubro", valor: 87, meta: 85 },
      { mes: "Novembro", valor: 0, meta: 85 },
      { mes: "Dezembro", valor: 0, meta: 85 },
    ]
  },
  {
    id: "sobrevivencia_blast",
    nome: "Taxa Sobrevivência Blast Criopreservados",
    formula: "(Blastocistos intactos / Blast descong) × 100",
    meta: 90,
    dados: [
      { mes: "Janeiro", valor: 98, meta: 90 },
      { mes: "Fevereiro", valor: 96, meta: 90 },
      { mes: "Março", valor: 97, meta: 90 },
      { mes: "Abril", valor: 100, meta: 90 },
      { mes: "Maio", valor: 100, meta: 90 },
      { mes: "Junho", valor: 96, meta: 90 },
      { mes: "Julho", valor: 100, meta: 90 },
      { mes: "Agosto", valor: 100, meta: 90 },
      { mes: "Setembro", valor: 97, meta: 90 },
      { mes: "Outubro", valor: 95, meta: 90 },
      { mes: "Novembro", valor: 0, meta: 90 },
      { mes: "Dezembro", valor: 0, meta: 90 },
    ]
  },
  {
    id: "biopsia",
    nome: "Taxa de Sucesso Biópsia",
    formula: "(Biópsias DNA detectado / Biópsias realizadas) × 100",
    meta: 95,
    dados: [
      { mes: "Janeiro", valor: 100, meta: 95 },
      { mes: "Fevereiro", valor: 95, meta: 95 },
      { mes: "Março", valor: 93, meta: 95 },
      { mes: "Abril", valor: 93, meta: 95 },
      { mes: "Maio", valor: 91, meta: 95 },
      { mes: "Junho", valor: 96, meta: 95 },
      { mes: "Julho", valor: 100, meta: 95 },
      { mes: "Agosto", valor: 88, meta: 95 },
      { mes: "Setembro", valor: 91, meta: 95 },
      { mes: "Outubro", valor: 89, meta: 95 },
      { mes: "Novembro", valor: 94, meta: 95 },
      { mes: "Dezembro", valor: 94, meta: 95 },
    ]
  },
  {
    id: "clivagem",
    nome: "Taxa de Clivagem",
    formula: "(Embriões cliv Dia 2 / Oócit 2PN dia 1) × 100",
    meta: 90,
    dados: [
      { mes: "Janeiro", valor: 96, meta: 90 },
      { mes: "Fevereiro", valor: 95, meta: 90 },
      { mes: "Março", valor: 94, meta: 90 },
      { mes: "Abril", valor: 94, meta: 90 },
      { mes: "Maio", valor: 92, meta: 90 },
      { mes: "Junho", valor: 95, meta: 90 },
      { mes: "Julho", valor: 95, meta: 90 },
      { mes: "Agosto", valor: 95, meta: 90 },
      { mes: "Setembro", valor: 97, meta: 90 },
      { mes: "Outubro", valor: 96, meta: 90 },
      { mes: "Novembro", valor: 91, meta: 90 },
      { mes: "Dezembro", valor: 95, meta: 90 },
    ]
  },
]

export default function IndicadoresLabPage() {
  const [indicadores, setIndicadores] = useState(indicadoresLAB)
  const [editando, setEditando] = useState<{ind: string, mes: string} | null>(null)

  const atualizarDado = (indId: string, mes: string, valor: string) => {
    setIndicadores(prev => prev.map(ind => {
      if (ind.id !== indId) return ind
      return {
        ...ind,
        dados: ind.dados.map(d => {
          if (d.mes !== mes) return d
          return { ...d, valor: parseFloat(valor) || 0 }
        })
      }
    }))
  }

  const getStatus = (valor: number, meta: number) => {
    if (valor >= meta) return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
    return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Indicadores — Laboratório</h1>
          <p className="text-sm text-muted-foreground">Taxas de performance e qualidade</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {indicadores.slice(0, 4).map((ind) => {
          const media = ind.dados.reduce((a, b) => a + b.valor, 0) / 12
          const status = getStatus(media, ind.meta)
          const Icon = status.icon
          
          return (
            <Card key={ind.id} className={status.bg}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium leading-tight">{ind.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{media.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Meta: ≥{ind.meta}%</p>
                  </div>
                  <Icon className={`h-8 w-8 ${status.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cards resumo 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {indicadores.slice(4, 7).map((ind) => {
          const media = ind.dados.reduce((a, b) => a + b.valor, 0) / 12
          const status = getStatus(media, ind.meta)
          const Icon = status.icon
          
          return (
            <Card key={ind.id} className={status.bg}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium leading-tight">{ind.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{media.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Meta: ≥{ind.meta}%</p>
                  </div>
                  <Icon className={`h-8 w-8 ${status.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabelas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {indicadores.map((ind) => (
          <Card key={ind.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {ind.nome}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{ind.formula}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Mês</TableHead>
                    <TableHead className="text-center">Taxa (%)</TableHead>
                    <TableHead className="text-center">Meta</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ind.dados.map((d) => {
                    const status = getStatus(d.valor, d.meta)
                    const isEditing = editando?.ind === ind.id && editando?.mes === d.mes
                    
                    return (
                      <TableRow key={d.mes} className={d.valor < d.meta ? "bg-red-50/50" : ""}>
                        <TableCell className="font-medium">{d.mes}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input 
                              type="number" 
                              step="0.1"
                              value={d.valor} 
                              onChange={(e) => atualizarDado(ind.id, d.mes, e.target.value)}
                              className="h-8 w-20 text-center"
                            />
                          ) : (
                            <button 
                              onClick={() => setEditando({ind: ind.id, mes: d.mes})}
                              className="w-full text-center hover:bg-muted rounded px-2 py-1 tabular-nums"
                            >
                              {d.valor}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">{d.meta}%</TableCell>
                        <TableCell>
                          <Badge variant={d.valor >= d.meta ? "default" : "destructive"} className="text-xs">
                            {d.valor >= d.meta ? "OK" : "Fora"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditando(null)}
                >
                  Concluir Edição
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}