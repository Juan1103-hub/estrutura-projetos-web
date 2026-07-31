"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save, Calendar, User, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { indicadoresExtrasIniciais, statusOptions } from "@/data/indicadores-extras"

export default function IndicadoresExtrasPage() {
  const [registros, setRegistros] = useState(indicadoresExtrasIniciais)
  const [novoOpen, setNovoOpen] = useState(false)
  const [novo, setNovo] = useState({ mes: "", indicador: "", causa: "", acao: "", prazo: "", responsavel: "" })

  const handleSave = () => {
    if (!novo.mes || !novo.indicador || !novo.causa || !novo.acao || !novo.prazo || !novo.responsavel) return
    setRegistros([...registros, { ...novo, id: registros.length + 1, status: "pendente" }])
    setNovo({ mes: "", indicador: "", causa: "", acao: "", prazo: "", responsavel: "" })
    setNovoOpen(false)
  }

  const toggleStatus = (id: number) => {
    setRegistros(registros.map(r => 
      r.id === id ? { ...r, status: r.status === "pendente" ? "analisado" : "pendente" } : r
    ))
  }

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find(o => o.value === status)
    return <Badge className={opt?.color}>{opt?.label}</Badge>
  }

  const pendentes = registros.filter(r => r.status === "pendente").length
  const analisados = registros.filter(r => r.status === "analisado").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Indicadores Extras</h1>
          <p className="text-sm text-muted-foreground">Análise de causas e ações corretivas</p>
        </div>
        <Button className="gap-2" onClick={() => setNovoOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{analisados}</p>
                <p className="text-xs text-muted-foreground">Analisados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{registros.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Causa</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.mes}</TableCell>
                  <TableCell>{r.indicador}</TableCell>
                  <TableCell className="max-w-[200px]">{r.causa}</TableCell>
                  <TableCell className="max-w-[200px]">{r.acao}</TableCell>
                  <TableCell className="tabular-nums">{new Date(r.prazo).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {r.responsavel}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(r.id)}
                    >
                      {r.status === "pendente" ? "Analisar" : "Reabrir"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog novo */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Registro de Análise</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={novo.mes} onValueChange={(v) => v && setNovo({ ...novo, mes: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Indicador</Label>
                <Select value={novo.indicador} onValueChange={(v) => v && setNovo({ ...novo, indicador: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erros de Administração">Erros de Administração</SelectItem>
                    <SelectItem value="Erros na Montagem">Erros na Montagem</SelectItem>
                    <SelectItem value="Falha no Estoque">Falha no Estoque</SelectItem>
                    <SelectItem value="Erros na Dispensação">Erros na Dispensação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Causa</Label>
              <Input value={novo.causa} onChange={(e) => setNovo({ ...novo, causa: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ação Corretiva</Label>
              <Input value={novo.acao} onChange={(e) => setNovo({ ...novo, acao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" value={novo.prazo} onChange={(e) => setNovo({ ...novo, prazo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input value={novo.responsavel} onChange={(e) => setNovo({ ...novo, responsavel: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Registro</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}