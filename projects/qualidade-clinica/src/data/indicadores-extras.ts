export interface IndicadorExtra {
  id: number
  mes: string
  indicador: string
  causa: string
  acao: string
  prazo: string
  responsavel: string
  status: "pendente" | "analisado"
}

export const indicadoresExtrasIniciais: IndicadorExtra[] = [
  { id: 1, mes: "Janeiro", indicador: "Erros de Administração", causa: "Falta de treinamento", acao: "Realizar treinamento da equipe", prazo: "2025-02-15", responsavel: "Luana", status: "pendente" },
  { id: 2, mes: "Janeiro", indicador: "Falha no Estoque", causa: "Fornecedor atrasou entrega", acao: "Contatar fornecedor alternativo", prazo: "2025-02-10", responsavel: "Ana Paula", status: "analisado" },
  { id: 3, mes: "Fevereiro", indicador: "Erros na Montagem", causa: "Kit incompleto", acao: "Revisar lista de materiais", prazo: "2025-03-01", responsavel: "Luana", status: "pendente" },
]

export const statusOptions = [
  { value: "pendente", label: "Pendente", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "analisado", label: "Analisado", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
]
