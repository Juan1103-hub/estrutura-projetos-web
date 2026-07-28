import * as XLSX from "xlsx"

export function exportToExcel(data: any[], filename: string, sheetName: string = "Dados") {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportIndicadoresFAR(indicadores: any[]) {
  const data: any[] = []
  
  indicadores.forEach(ind => {
    ind.dados.forEach((d: any) => {
      data.push({
        Indicador: ind.nome,
        Mês: d.mes,
        Procedimentos: d.procedimentos,
        Erros: d.erros,
        "% Erro": d.percentual.toFixed(2),
        Meta: ind.meta,
        Status: d.percentual <= ind.meta ? "OK" : "Fora",
      })
    })
  })
  
  exportToExcel(data, "indicadores-farmacia", "Indicadores FAR")
}

export function exportMatrizRiscos(riscos: any[], setor: string) {
  const data = riscos.map(r => ({
    Setor: r.setor,
    Atividade: r.atividade,
    "O Que? E Se?": r.oQue,
    Consequência: r.consequencia,
    Severidade: r.severidade,
    Probabilidade: r.probabilidade,
    Grau: r.grau,
    "Contingência": r.contingencia,
    "Tratamento": r.tratamento,
    "Monitoramento": r.monitoramento,
    "Meta": r.meta,
  }))
  
  exportToExcel(data, `matriz-riscos-${setor}`, "Matriz de Riscos")
}

export function exportMedicacaoControlada(rastreios: any[], medicamento: string) {
  const data = rastreios.map(r => ({
    Data: new Date(r.data).toLocaleDateString('pt-BR'),
    Paciente: r.paciente,
    Lote: r.lote,
    Quantidade: r.quantidade,
    "ID Receita": r.idReceita,
    Observação: r.observacao,
  }))
  
  exportToExcel(data, `medicacao-controlada-${medicamento}`, "Rastreio")
}

export function exportInsumos(insumos: any[], mes: string) {
  const data = insumos.map(i => ({
    Nome: i.nome,
    Categoria: i.categoria,
    Lote: i.lote,
    "Data Recebimento": new Date(i.dataReceb).toLocaleDateString('pt-BR'),
    Validade: new Date(i.validade).toLocaleDateString('pt-BR'),
    "Qtd Esperada": i.qtdEsperada,
    "Qtd Atual": i.qtdAtual,
    "Temperatura": i.temperatura,
    "Responsável": i.responsavel,
    "Fornecedor": i.fornecedor,
    "Observação": i.observacao,
  }))
  
  exportToExcel(data, `insumos-${mes}`, "Insumos")
}