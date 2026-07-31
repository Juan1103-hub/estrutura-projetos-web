export interface IndicadorLabDado {
  mes: string
  valor: number
  meta: number
}

export interface IndicadorLAB {
  id: string
  nome: string
  formula: string
  meta: number
  dados: IndicadorLabDado[]
}

export const indicadoresLAB: IndicadorLAB[] = [
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
