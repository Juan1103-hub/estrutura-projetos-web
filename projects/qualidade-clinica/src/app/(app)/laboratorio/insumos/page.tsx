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
import { Plus, Save, Calendar, User, Package, AlertTriangle, CheckCircle2, Clock, Download } from "lucide-react"
import { exportInsumos } from "@/lib/export-excel"
import { insumosIniciais, meses, categorias } from "@/data/insumos"

export default function InsumosPage() {
  const [insumos, setInsumos] = useState(insumosIniciais)
  const [mesAtivo, setMesAtivo] = useState("Janeiro")
  const [novoOpen, setNovoOpen] = useState(false)
  const [editandoObs, setEditandoObs] = useState<number | null>(null)
  const [obsTemp, setObsTemp] = useState("")
  const [novo, setNovo] = useState({ nome: "", categoria: "", lote: "", dataReceb: "", validade: "", qtdEsperada: "", qtdAtual: "", temperatura: "", responsavel: "", fornecedor: "", observacao: "" })

  const filtrados = insumos.filter(i => i.mes === mesAtivo)

  const handleSave = () => {
    if (!novo.nome || !novo.categoria || !novo.lote || !novo.dataReceb || !novo.validade || !novo.qtdEsperada || !novo.qtdAtual || !novo.temperatura || !novo.responsavel) return
    setInsumos([...insumos, {
      ...novo,
      id: insumos.length + 1,
      mes: mesAtivo,
      qtdEsperada: parseInt(novo.qtdEsperada),
      qtdAtual: parseInt(novo.qtdAtual),
      temperatura: parseFloat(novo.temperatura)
    }])
    setNovo({ nome: "", categoria: "", lote: "", dataReceb: "", validade: "", qtdEsperada: "", qtdAtual: "", temperatura: "", responsavel: "", fornecedor: "", observacao: "" })
    setNovoOpen(false)
  }

  const saveObservation = (id: number) => {
    setInsumos(insumos.map(i => i.id === id ? { ...i, observacao: obsTemp } : i))
    setEditandoObs(null)
    setObsTemp("")
  }

  const diasParaVencer = (validade: string) => {
    const hoje = new Date()
    const venc = new Date(validade)
    const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getValidadeBadge = (validade: string) => {
    const dias = diasParaVencer(validade)
    if (dias < 0) return <Badge variant="destructive">Vencido</Badge>
    if (dias <= 30) return <Badge className="bg-red-100 text-red-800 border-red-300">Vence em {dias}d</Badge>
    if (dias <= 60) return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Vence em {dias}d</Badge>
    return <Badge variant="outline">{dias}d</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Insumos</h1>
          <p className="text-sm text-muted-foreground">Controle de meios e materiais</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportInsumos(filtrados, mesAtivo)}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button className="gap-2" onClick={() => setNovoOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Insumo
          </Button>
        </div>
      </div>

      {/* Tabs por mês */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {meses.map((mes) => (
          <button
            key={mes}
            onClick={() => setMesAtivo(mes)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
              mesAtivo === mes
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted border-border"
            }`}
          >
            {mes}
          </button>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{filtrados.length}</p>
              <p className="text-xs text-muted-foreground">Total de itens</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-emerald-600">
                {filtrados.filter(i => i.qtdAtual > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Em estoque</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-amber-600">
                {filtrados.filter(i => diasParaVencer(i.validade) <= 60 && diasParaVencer(i.validade) > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Vencendo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-red-600">
                {filtrados.filter(i => diasParaVencer(i.validade) <= 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Vencidos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Insumos — {mesAtivo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Data Receb.</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead className="text-center">Temp.</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((i) => (
                <TableRow key={i.id} className={diasParaVencer(i.validade) <= 30 ? "bg-red-50/50" : ""}>
                  <TableCell className="font-medium">{i.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{categorias.find(c => c.value === i.categoria)?.label}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{i.lote}</TableCell>
                  <TableCell className="tabular-nums">{new Date(i.dataReceb).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="tabular-nums text-sm">{new Date(i.validade).toLocaleDateString('pt-BR')}</span>
                      {getValidadeBadge(i.validade)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {i.qtdAtual}/{i.qtdEsperada}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {i.temperatura}°C
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {i.responsavel}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editandoObs === i.id ? (
                      <div className="flex gap-2">
                        <Input 
                          value={obsTemp} 
                          onChange={(e) => setObsTemp(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => saveObservation(i.id)}>OK</Button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditandoObs(i.id); setObsTemp(i.observacao) }}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline text-left"
                      >
                        {i.observacao || "Clique para editar"}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog novo */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Insumo — {mesAtivo}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={novo.categoria} onValueChange={(v) => v && setNovo({ ...novo, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input value={novo.lote} onChange={(e) => setNovo({ ...novo, lote: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Recebimento</Label>
                <Input type="date" value={novo.dataReceb} onChange={(e) => setNovo({ ...novo, dataReceb: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input type="date" value={novo.validade} onChange={(e) => setNovo({ ...novo, validade: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Qtd Esperada</Label>
                <Input type="number" value={novo.qtdEsperada} onChange={(e) => setNovo({ ...novo, qtdEsperada: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Qtd Atual</Label>
                <Input type="number" value={novo.qtdAtual} onChange={(e) => setNovo({ ...novo, qtdAtual: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <Input type="number" step="0.1" value={novo.temperatura} onChange={(e) => setNovo({ ...novo, temperatura: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input value={novo.responsavel} onChange={(e) => setNovo({ ...novo, responsavel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input value={novo.fornecedor} onChange={(e) => setNovo({ ...novo, fornecedor: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Input value={novo.observacao} onChange={(e) => setNovo({ ...novo, observacao: e.target.value })} />
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Insumo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}