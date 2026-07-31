export type StatusIndicador = "ok" | "atencao" | "critico"

export interface Indicador {
  setor: string
  indicador: string
  valor: string
  meta: string
  status: StatusIndicador
}

export const indicadoresData: Indicador[] = [
  { setor: "Farmácia", indicador: "Dispensações/mês", valor: "1.234", meta: "≥ 1.200", status: "ok" },
  { setor: "Farmácia", indicador: "Med. Controlada", valor: "456", meta: "≤ 500", status: "ok" },
  { setor: "Farmácia", indicador: "Validade próxima", valor: "23", meta: "0", status: "critico" },
  { setor: "Farmácia", indicador: "Estoque crítico", valor: "5", meta: "0", status: "atencao" },
  { setor: "Laboratório", indicador: "Exames/mês", valor: "3.890", meta: "≥ 3.500", status: "ok" },
  { setor: "Laboratório", indicador: "Amostras pendentes", valor: "42", meta: "≤ 30", status: "atencao" },
  { setor: "Laboratório", indicador: "Controle qualidade", valor: "98%", meta: "≥ 95%", status: "ok" },
  { setor: "Laboratório", indicador: "Insumos vencidos", valor: "3", meta: "0", status: "critico" },
  { setor: "Administração", indicador: "Auditorias pendentes", valor: "2", meta: "0", status: "atencao" },
  { setor: "Administração", indicador: "Documentos atrasados", valor: "7", meta: "0", status: "critico" },
  { setor: "Administração", indicador: "Treinamentos/mês", valor: "4", meta: "≥ 4", status: "ok" },
  { setor: "Administração", indicador: "Não conformidades", valor: "12", meta: "≤ 10", status: "atencao" },
]

export const statusMap = {
  ok: { label: "OK", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  atencao: { label: "Atenção", class: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  critico: { label: "Crítico", class: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" },
}
