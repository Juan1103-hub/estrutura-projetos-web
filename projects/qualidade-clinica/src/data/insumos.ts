export interface Insumo {
  id: number
  mes: string
  nome: string
  categoria: string
  lote: string
  dataReceb: string
  validade: string
  qtdEsperada: number
  qtdAtual: number
  temperatura: number
  responsavel: string
  fornecedor: string
  observacao: string
}

export const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

export const insumosIniciais: Insumo[] = [
  { id: 1, mes: "Janeiro", nome: "Global Total LP", categoria: "media", lote: "GT-2025-01", dataReceb: "2025-01-10", validade: "2026-06-15", qtdEsperada: 10, qtdAtual: 8, temperatura: 3.8, responsavel: "Gabriella", fornecedor: "Vitrolife", observacao: "Límpido" },
  { id: 2, mes: "Janeiro", nome: "Gamete Buffer", categoria: "media", lote: "GB-2025-02", dataReceb: "2025-02-01", validade: "2026-03-20", qtdEsperada: 5, qtdAtual: 3, temperatura: 4.0, responsavel: "Gabriella", fornecedor: "Vitrolife", observacao: "" },
  { id: 3, mes: "Janeiro", nome: "Oil for Tissue Culture", categoria: "media", lote: "OIL-2024-03", dataReceb: "2024-03-15", validade: "2025-12-01", qtdEsperada: 12, qtdAtual: 5, temperatura: 3.5, responsavel: "Luciana", fornecedor: "Irvine", observacao: "Vencido" },
  { id: 4, mes: "Janeiro", nome: "Ponteiras 1000µL", categoria: "consumivel", lote: "P1000-2025", dataReceb: "2025-01-05", validade: "2026-12-31", qtdEsperada: 100, qtdAtual: 85, temperatura: 22, responsavel: "Wiviane", fornecedor: "LabPlast", observacao: "" },
  { id: 5, mes: "Janeiro", nome: "Ponteiras 200µL", categoria: "consumivel", lote: "P200-2025", dataReceb: "2025-01-05", validade: "2026-12-31", qtdEsperada: 100, qtdAtual: 92, temperatura: 22, responsavel: "Wiviane", fornecedor: "LabPlast", observacao: "" },
  { id: 6, mes: "Janeiro", nome: "Placas Petri", categoria: "consumivel", lote: "PETRI-2025", dataReceb: "2025-03-01", validade: "2026-09-30", qtdEsperada: 30, qtdAtual: 22, temperatura: 22, responsavel: "Wiviane", fornecedor: "Falcon", observacao: "" },
  { id: 7, mes: "Janeiro", nome: "Criotubos 2mL", categoria: "consumivel", lote: "CRYO-2025", dataReceb: "2025-04-01", validade: "2027-01-31", qtdEsperada: 200, qtdAtual: 180, temperatura: 22, responsavel: "Wiviane", fornecedor: "Nunc", observacao: "" },
]

export const categorias = [
  { value: "media", label: "Meio de Cultura" },
  { value: "consumivel", label: "Consumível" },
  { value: "reagente", label: "Reagente" },
  { value: "equipamento", label: "Equipamento" },
]
