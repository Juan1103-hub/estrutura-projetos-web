"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertTriangle, Shield, Activity, Download } from "lucide-react"
import { exportMatrizRiscos } from "@/lib/export-excel"

// Setores do Excel FAR
const setores = [
  { id: "enfermagem", nome: "Enfermagem", responsavel: "Aline Paglioni e Luana Soares", cor: "bg-blue-50 border-blue-200" },
  { id: "financeiro", nome: "Financeiro", responsavel: "Érika", cor: "bg-emerald-50 border-emerald-200" },
  { id: "recepcao", nome: "Recepção", responsavel: "Érika", cor: "bg-amber-50 border-amber-200" },
  { id: "laboratorio", nome: "Laboratório", responsavel: "Luciana", cor: "bg-cyan-50 border-cyan-200" },
  { id: "farmacia", nome: "Farmácia", responsavel: "Ana Paula Almeida", cor: "bg-rose-50 border-rose-200" },
]

// Riscos mockados baseados no Excel
const riscosIniciais = [
  { id: 1, setor: "enfermagem", atividade: "Organização para punção oocitária", oQue: "Não imprimir documentos necessários", consequencia: "Atraso na execução das tarefas", severidade: 2, probabilidade: 1, grau: 2, contingencia: "Imprimir documentos no dia do procedimento", tratamento: "Treinamento e escala semanal", monitoramento: "Documentos prontos antes", meta: "Não se aplica" },
  { id: 2, setor: "enfermagem", atividade: "Dupla checagem de exames sorológicos", oQue: "Não conferir exames antes da punção", consequencia: "Chegar no dia sem resultado", severidade: 4, probabilidade: 4, grau: 16, contingencia: "Abertura de não conformidade", tratamento: "Conscientização da equipe", monitoramento: "Verificação dos check-lists", meta: "Nunca acontecer" },
  { id: 3, setor: "financeiro", atividade: "Entrega de termo de consentimento", oQue: "Envio de termo errado ao paciente", consequencia: "Fragilidade de realizar procedimento sem resguardo", severidade: 4, probabilidade: 3, grau: 12, contingencia: "Comunicar e substituir imediatamente", tratamento: "Verificar com médico antes do envio", monitoramento: "Através do indicador", meta: "Zerar ocorrências" },
  { id: 4, setor: "recepcao", atividade: "Cadastro de paciente", oQue: "Cadastro errado do nome", consequencia: "Identificação errada em todos os processos", severidade: 4, probabilidade: 5, grau: 20, contingencia: "Corrigir imediatamente", tratamento: "Fortalecer barreiras e treinamentos", monitoramento: "Conferir dados no agendamento", meta: "Diminuir ocorrências" },
  { id: 5, setor: "laboratorio", atividade: "Coleta Seminal", oQue: "Etiqueta com nome de outro paciente", consequencia: "Processar amostra de paciente errado", severidade: 5, probabilidade: 1, grau: 5, contingencia: "Correção e substituição da etiqueta", tratamento: "Treinamento e barreiras", monitoramento: "Através de indicadores", meta: "Nunca acontecer" },
  { id: 6, setor: "farmacia", atividade: "Medicação prescrita", oQue: "Separação da medicação errada", consequencia: "Faltar dose correta na aplicação", severidade: 4, probabilidade: 3, grau: 12, contingencia: "Entrar em contato com paciente", tratamento: "Separar medicação corretamente", monitoramento: "Treinamento da equipe", meta: "Nunca acontecer" },
  { id: 7, setor: "farmacia", atividade: "Dispensação de perfurocortantes", oQue: "Não orientar sobre descarte de agulhas", consequencia: "Acidente com perfurocortante", severidade: 5, probabilidade: 5, grau: 25, contingencia: "Orientar e disponibilizar garrafa", tratamento: "Encaminhar caso à CIPA", monitoramento: "Educação continuada", meta: "Nunca acontecer" },
]

const getGrauColor = (grau: number) => {
  if (grau >= 15) return "bg-red-100 text-red-800 border-red-300"
  if (grau >= 6) return "bg-amber-100 text-amber-800 border-amber-300"
  return "bg-emerald-100 text-emerald-800 border-emerald-300"
}

const getGrauLabel = (grau: number) => {
  if (grau >= 15) return "Alto"
  if (grau >= 6) return "Médio"
  return "Baixo"
}

export default function MapeamentoRiscosPage() {
  const [riscos, setRiscos] = useState(riscosIniciais)
  const [setorAtivo, setSetorAtivo] = useState("enfermagem")
  const [novoRisco, setNovoRisco] = useState({ open: false, setor: "" })

  const riscosFiltrados = riscos.filter(r => r.setor === setorAtivo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mapeamento de Riscos</h1>
          <p className="text-sm text-muted-foreground">Identificação e controle de riscos por setor</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => exportMatrizRiscos(riscosFiltrados, setorAtivo)}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button className="gap-2" onClick={() => setNovoRisco({ ...novoRisco, open: true })}>
            <Plus className="h-4 w-4" />
            Novo Risco
          </Button>
        </div>
        <Dialog open={novoRisco.open} onOpenChange={(o) => setNovoRisco({ ...novoRisco, open: o })}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Risco</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Setor</Label>
                  <Select value={novoRisco.setor} onValueChange={(v) => v && setNovoRisco({ ...novoRisco, setor: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {setores.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Atividade</Label>
                  <Input placeholder="Nome da atividade" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>O Que? E Se?</Label>
                <Input placeholder="Descreva o risco..." />
              </div>
              <div className="space-y-2">
                <Label>Consequência</Label>
                <Input placeholder="Impacto do risco..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Severidade (1-5)</Label>
                  <Input type="number" min={1} max={5} />
                </div>
                <div className="space-y-2">
                  <Label>Probabilidade (1-5)</Label>
                  <Input type="number" min={1} max={5} />
                </div>
                <div className="space-y-2">
                  <Label>Grau</Label>
                  <Input disabled placeholder="Auto" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contingência</Label>
                <Input placeholder="O que fazer..." />
              </div>
              <div className="space-y-2">
                <Label>Tratamento</Label>
                <Input placeholder="Como tratar..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monitoramento</Label>
                  <Input placeholder="Como monitorar" />
                </div>
                <div className="space-y-2">
                  <Label>Meta</Label>
                  <Input placeholder="Meta desejada" />
                </div>
              </div>
              <Button className="w-full">Salvar Risco</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navegação por setor */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {setores.map((setor) => (
          <button
            key={setor.id}
            onClick={() => setSetorAtivo(setor.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
              setorAtivo === setor.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted border-border"
            }`}
          >
            <Shield className="h-4 w-4" />
            {setor.nome}
            <Badge variant="secondary" className="ml-1">
              {riscos.filter(r => r.setor === setor.id).length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Info do setor */}
      <Card className={setores.find(s => s.id === setorAtivo)?.cor}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{setores.find(s => s.id === setorAtivo)?.nome}</h2>
              <p className="text-sm text-muted-foreground">Responsável: {setores.find(s => s.id === setorAtivo)?.responsavel}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                {riscosFiltrados.filter(r => r.grau >= 15).length} Alto
              </Badge>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                {riscosFiltrados.filter(r => r.grau >= 6 && r.grau < 15).length} Médio
              </Badge>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                {riscosFiltrados.filter(r => r.grau < 6).length} Baixo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de riscos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Riscos Identificados — {setores.find(s => s.id === setorAtivo)?.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atividade</TableHead>
                  <TableHead>O Que? E Se?</TableHead>
                  <TableHead>Consequência</TableHead>
                  <TableHead className="text-center">S</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">Grau</TableHead>
                  <TableHead>Contingência</TableHead>
                  <TableHead>Tratamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riscosFiltrados.map((risco) => (
                  <TableRow key={risco.id}>
                    <TableCell className="font-medium max-w-[200px]">{risco.atividade}</TableCell>
                    <TableCell className="max-w-[250px]">{risco.oQue}</TableCell>
                    <TableCell className="max-w-[200px]">{risco.consequencia}</TableCell>
                    <TableCell className="text-center">{risco.severidade}</TableCell>
                    <TableCell className="text-center">{risco.probabilidade}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getGrauColor(risco.grau)}>
                        {risco.grau} — {getGrauLabel(risco.grau)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">{risco.contingencia}</TableCell>
                    <TableCell className="max-w-[200px]">{risco.tratamento}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span><strong>Alto (15-25):</strong> Intolerável — tratar imediatamente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span><strong>Médio (6-14):</strong> Tolerável — mitigar e acompanhar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span><strong>Baixo (1-5):</strong> Aceitável — monitorar</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}