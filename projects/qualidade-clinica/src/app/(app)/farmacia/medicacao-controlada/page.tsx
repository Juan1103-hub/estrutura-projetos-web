"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Pill, FileText, Download } from "lucide-react"
import { exportMedicacaoControlada } from "@/lib/export-excel"
import { medicamentos, rastreiosIniciais } from "@/data/medicacao-controlada"

export default function RastreioMedicacaoPage() {
  const [rastreios, setRastreios] = useState(rastreiosIniciais)
  const [medAtivo, setMedAtivo] = useState("propofol")
  const [busca, setBusca] = useState("")
  const [novoOpen, setNovoOpen] = useState(false)
  const [novo, setNovo] = useState({ medicamento: "", data: "", paciente: "", lote: "", quantidade: "", idReceita: "", observacao: "" })

  const rastreiosFiltrados = rastreios.filter(r => {
    if (r.medicamento !== medAtivo) return false
    if (busca && !r.paciente.includes(busca) && !r.lote.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const handleSave = () => {
    if (!novo.medicamento || !novo.data || !novo.paciente || !novo.lote || !novo.quantidade) return
    setRastreios([...rastreios, {
      id: rastreios.length + 1,
      medicamento: novo.medicamento,
      data: novo.data,
      paciente: novo.paciente,
      lote: novo.lote,
      quantidade: parseInt(novo.quantidade),
      idReceita: novo.idReceita,
      observacao: novo.observacao
    }])
    setNovo({ medicamento: "", data: "", paciente: "", lote: "", quantidade: "", idReceita: "", observacao: "" })
    setNovoOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rastreio Medicação Controlada</h1>
          <p className="text-sm text-muted-foreground">Controle de medicamentos especiais</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportMedicacaoControlada(rastreiosFiltrados, medAtivo)}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button className="gap-2" onClick={() => setNovoOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Dispensação
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou lote..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs medicamentos */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {medicamentos.map((med) => (
          <button
            key={med.id}
            onClick={() => setMedAtivo(med.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
              medAtivo === med.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted border-border"
            }`}
          >
            <Pill className="h-4 w-4" />
            {med.nome}
            <Badge variant="secondary" className="ml-1">
              {rastreios.filter(r => r.medicamento === med.id).length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Card do medicamento */}
      <Card className={medicamentos.find(m => m.id === medAtivo)?.cor}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{medicamentos.find(m => m.id === medAtivo)?.nome}</h2>
              <p className="text-sm text-muted-foreground">
                {rastreiosFiltrados.length} dispensação(ões) registrada(s)
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums">
                {rastreiosFiltrados.reduce((a, b) => a + b.quantidade, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total dispensado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Registros — {medicamentos.find(m => m.id === medAtivo)?.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead className="text-center">Qtd</TableHead>
                <TableHead>ID Receita</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rastreiosFiltrados.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="tabular-nums">{new Date(r.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-mono">{r.paciente}</TableCell>
                  <TableCell className="font-mono">{r.lote}</TableCell>
                  <TableCell className="text-center tabular-nums">{r.quantidade}</TableCell>
                  <TableCell className="font-mono">{r.idReceita}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.observacao}</TableCell>
                </TableRow>
              ))}
              {rastreiosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog nova dispensação */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Dispensação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Medicamento</Label>
              <Select value={novo.medicamento} onValueChange={(v) => v && setNovo({ ...novo, medicamento: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {medicamentos.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={novo.data} onChange={(e) => setNovo({ ...novo, data: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Paciente (ID)</Label>
                <Input value={novo.paciente} onChange={(e) => setNovo({ ...novo, paciente: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input value={novo.lote} onChange={(e) => setNovo({ ...novo, lote: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input type="number" value={novo.quantidade} onChange={(e) => setNovo({ ...novo, quantidade: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ID Receita</Label>
              <Input value={novo.idReceita} onChange={(e) => setNovo({ ...novo, idReceita: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Input value={novo.observacao} onChange={(e) => setNovo({ ...novo, observacao: e.target.value })} />
            </div>
            <Button onClick={handleSave} className="w-full">Salvar Dispensação</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}