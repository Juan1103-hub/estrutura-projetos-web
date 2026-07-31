export interface IndicadorDado {
  mes: string
  procedimentos: number
  erros: number
  percentual: number
}

export interface IndicadorFAR {
  id: string
  nome: string
  formula: string
  meta: number
  dados: IndicadorDado[]
}

export const indicadoresFAR: IndicadorFAR[] = [
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
