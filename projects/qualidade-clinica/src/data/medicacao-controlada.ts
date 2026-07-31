export interface Medicamento {
  id: string
  nome: string
  cor: string
}

export interface Rastreio {
  id: number
  medicamento: string
  data: string
  paciente: string
  lote: string
  quantidade: number
  idReceita: string
  observacao: string
}

export const medicamentos: Medicamento[] = [
  { id: "propofol", nome: "Propofol", cor: "bg-blue-50 border-blue-200" },
  { id: "fentanila", nome: "Fentanila", cor: "bg-purple-50 border-purple-200" },
  { id: "midazolam", nome: "Midazolam 1mg", cor: "bg-cyan-50 border-cyan-200" },
  { id: "tramadol", nome: "Tramadol", cor: "bg-amber-50 border-amber-200" },
  { id: "antimicrobiano", nome: "Antimicrobiano", cor: "bg-emerald-50 border-emerald-200" },
]

export const rastreiosIniciais: Rastreio[] = [
  { id: 1, medicamento: "propofol", data: "2025-01-15", paciente: "123456", lote: "BZLID25017A", quantidade: 2, idReceita: "14463", observacao: "Endometriose" },
  { id: 2, medicamento: "propofol", data: "2025-01-15", paciente: "123456", lote: "25023202", quantidade: 2, idReceita: "18273", observacao: "Endometriose" },
  { id: 3, medicamento: "fentanila", data: "2025-01-10", paciente: "654123", lote: "AS05625", quantidade: 1, idReceita: "44", observacao: "" },
  { id: 4, medicamento: "fentanila", data: "2025-01-12", paciente: "654123", lote: "AS05625", quantidade: 1, idReceita: "2", observacao: "" },
  { id: 5, medicamento: "midazolam", data: "2025-01-08", paciente: "123456", lote: "7547092", quantidade: 1, idReceita: "2", observacao: "" },
  { id: 6, medicamento: "midazolam", data: "2025-01-09", paciente: "123456", lote: "7547092", quantidade: 1, idReceita: "6", observacao: "" },
  { id: 7, medicamento: "tramadol", data: "2025-01-05", paciente: "123456", lote: "AW054/25", quantidade: 1, idReceita: "2", observacao: "" },
  { id: 8, medicamento: "tramadol", data: "2025-01-06", paciente: "123456", lote: "AW054/25", quantidade: 1, idReceita: "3", observacao: "Lote: L2506757 quebra" },
  { id: 9, medicamento: "antimicrobiano", data: "2025-01-15", paciente: "123456", lote: "BZLID25017A", quantidade: 2, idReceita: "14463", observacao: "Endometriose" },
  { id: 10, medicamento: "antimicrobiano", data: "2025-01-16", paciente: "123456", lote: "25023202", quantidade: 2, idReceita: "18273", observacao: "Endometriose" },
]
