"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Save, Download, User } from "lucide-react"
import { exportIndicadoresFAR } from "@/lib/export-excel"
import { useSetor } from "@/lib/setor-context"

// Dados do Excel FAR
const indicadoresFAR = [
  {
    id: "adm",
    nome: "Erros de Administração de Medicação no BC",
    formula: "Erro de Adm / Total Procedimentos × 100",
    meta: 0,
    dados: [
      { mes: "Janeiro", procedimentos: 0, erros: 1, percentual: 0 },
      { mes: "Fevereiro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Março", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Abril", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Maio", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Junho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Julho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Agosto", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Setembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Outubro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Novembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Dezembro", procedimentos: 0, erros: 0, percentual: 0 },
    ]
  },
  {
    id: "kits",
    nome: "Erros na Montagem de Kits para Procedimentos",
    formula: "Erro na Montagem / Total Procedimentos × 100",
    meta: 0,
    dados: [
      { mes: "Janeiro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Fevereiro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Março", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Abril", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Maio", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Junho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Julho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Agosto", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Setembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Outubro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Novembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Dezembro", procedimentos: 0, erros: 0, percentual: 0 },
    ]
  },
  {
    id: "estoque",
    nome: "Falha no Suprimento de Materiais e Medicamentos",
    formula: "Falha no Estoque / Total Procedimentos × 100",
    meta: 0,
    dados: [
      { mes: "Janeiro", procedimentos: 12, erros: 1, percentual: 8.33 },
      { mes: "Fevereiro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Março", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Abril", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Maio", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Junho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Julho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Agosto", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Setembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Outubro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Novembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Dezembro", procedimentos: 0, erros: 0, percentual: 0 },
    ]
  },
  {
    id: "dispensacao",
    nome: "Erros na Dispensação de Medicamentos",
    formula: "Erro de Dispensação / Total Atendimentos × 100",
    meta: 0,
    dados: [
      { mes: "Janeiro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Fevereiro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Março", procedimentos: 0, erros: 1, percentual: 0 },
      { mes: "Abril", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Maio", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Junho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Julho", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Agosto", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Setembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Outubro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Novembro", procedimentos: 0, erros: 0, percentual: 0 },
      { mes: "Dezembro", procedimentos: 0, erros: 0, percentual: 0 },
    ]
  }
]

export default function IndicadoresFarmaciaPage() {
  const { setor } = useSetor()
  const [indicadores, setIndicadores] = useState(indicadoresFAR)
  const [editando, setEditando] = useState<{ind: string, mes: string} | null>(null)
  const [responsavel, setResponsavel] = useState("")

  const handleExport = () => {
    exportIndicadoresFAR(indicadores)
  }

  const atualizarDado = (indId: string, mes: string, campo: string, valor: string) => {
    setIndicadores(prev => prev.map(ind => {
      if (ind.id !== indId) return ind
      return {
        ...ind,
        dados: ind.dados.map(d => {
          if (d.mes !== mes) return d
          const novo = { ...d, [campo]: parseInt(valor) || 0 }
          // Recalcular percentual
          if (campo === 'procedimentos' || campo === 'erros') {
            const proc = campo === 'procedimentos' ? novo.procedimentos : d.procedimentos
            const err = campo === 'erros' ? novo.erros : d.erros
            novo.percentual = proc > 0 ? (err / proc) * 100 : 0
          }
          return novo
        })
      }
    }))
  }

  const getStatus = (percentual: number, meta: number) => {
    if (percentual <= meta) return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
    return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Indicadores — Farmácia</h1>
          <p className="text-sm text-muted-foreground">Controle de qualidade e segurança do paciente</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Responsável"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-40"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {indicadores.map((ind) => {
          const totalProc = ind.dados.reduce((a, b) => a + b.procedimentos, 0)
          const totalErros = ind.dados.reduce((a, b) => a + b.erros, 0)
          const media = totalProc > 0 ? (totalErros / totalProc) * 100 : 0
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
                    <p className="text-2xl font-bold tabular-nums">{media.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">Meta: ≤{ind.meta}%</p>
                  </div>
                  <Icon className={`h-8 w-8 ${status.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabelas por indicador */}
      <div className="grid gap-6 lg:grid-cols-2">
        {indicadores.map((ind) => (
          <Card key={ind.id}>
            <CardHeader>
              <CardTitle className="text-base">{ind.nome}</CardTitle>
              <p className="text-xs text-muted-foreground">{ind.formula}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Mês</TableHead>
                    <TableHead className="text-center">Procedimentos</TableHead>
                    <TableHead className="text-center">Erros</TableHead>
                    <TableHead className="text-center">% Erro</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ind.dados.map((d) => {
                    const status = getStatus(d.percentual, ind.meta)
                    const isEditing = editando?.ind === ind.id && editando?.mes === d.mes
                    
                    return (
                      <TableRow key={d.mes} className={d.percentual > ind.meta ? "bg-red-50/50" : ""}>
                        <TableCell className="font-medium">{d.mes}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input 
                              type="number" 
                              value={d.procedimentos} 
                              onChange={(e) => atualizarDado(ind.id, d.mes, 'procedimentos', e.target.value)}
                              className="h-8 w-20 text-center"
                            />
                          ) : (
                            <button 
                              onClick={() => setEditando({ind: ind.id, mes: d.mes})}
                              className="w-full text-center hover:bg-muted rounded px-2 py-1"
                            >
                              {d.procedimentos}
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input 
                              type="number" 
                              value={d.erros} 
                              onChange={(e) => atualizarDado(ind.id, d.mes, 'erros', e.target.value)}
                              className="h-8 w-16 text-center"
                            />
                          ) : (
                            <button 
                              onClick={() => setEditando({ind: ind.id, mes: d.mes})}
                              className="w-full text-center hover:bg-muted rounded px-2 py-1"
                            >
                              {d.erros}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-center tabular-nums font-medium">
                          {d.percentual.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.percentual <= ind.meta ? "default" : "destructive"} className="text-xs">
                            {d.percentual <= ind.meta ? "OK" : "Fora"}
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