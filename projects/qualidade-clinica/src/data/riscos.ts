export interface Risco {
  id: number
  setor: string
  atividade: string
  oQue: string
  consequencia: string
  severidade: number
  probabilidade: number
  grau: number
  contingencia: string
  tratamento: string
  monitoramento: string
  meta: string
}

export const setores = [
  { id: "enfermagem", nome: "Enfermagem", responsavel: "Aline Paglioni e Luana Soares", cor: "bg-blue-50 border-blue-200" },
  { id: "financeiro", nome: "Financeiro", responsavel: "Érika", cor: "bg-emerald-50 border-emerald-200" },
  { id: "recepcao", nome: "Recepção", responsavel: "Érika", cor: "bg-amber-50 border-amber-200" },
  { id: "laboratorio", nome: "Laboratório", responsavel: "Luciana", cor: "bg-cyan-50 border-cyan-200" },
  { id: "farmacia", nome: "Farmácia", responsavel: "Ana Paula Almeida", cor: "bg-rose-50 border-rose-200" },
]

export const riscosIniciais: Risco[] = [
  { id: 1, setor: "enfermagem", atividade: "Organização para punção oocitária", oQue: "Não imprimir documentos necessários", consequencia: "Atraso na execução das tarefas", severidade: 2, probabilidade: 1, grau: 2, contingencia: "Imprimir documentos no dia do procedimento", tratamento: "Treinamento e escala semanal", monitoramento: "Documentos prontos antes", meta: "Não se aplica" },
  { id: 2, setor: "enfermagem", atividade: "Dupla checagem de exames sorológicos", oQue: "Não conferir exames antes da punção", consequencia: "Chegar no dia sem resultado", severidade: 4, probabilidade: 4, grau: 16, contingencia: "Abertura de não conformidade", tratamento: "Conscientização da equipe", monitoramento: "Verificação dos check-lists", meta: "Nunca acontecer" },
  { id: 3, setor: "financeiro", atividade: "Entrega de termo de consentimento", oQue: "Envio de termo errado ao paciente", consequencia: "Fragilidade de realizar procedimento sem resguardo", severidade: 4, probabilidade: 3, grau: 12, contingencia: "Comunicar e substituir imediatamente", tratamento: "Verificar com médico antes do envio", monitoramento: "Através do indicador", meta: "Zerar ocorrências" },
  { id: 4, setor: "recepcao", atividade: "Cadastro de paciente", oQue: "Cadastro errado do nome", consequencia: "Identificação errada em todos os processos", severidade: 4, probabilidade: 5, grau: 20, contingencia: "Corrigir imediatamente", tratamento: "Fortalecer barreiras e treinamentos", monitoramento: "Conferir dados no agendamento", meta: "Diminuir ocorrências" },
  { id: 5, setor: "laboratorio", atividade: "Coleta Seminal", oQue: "Etiqueta com nome de outro paciente", consequencia: "Processar amostra de paciente errado", severidade: 5, probabilidade: 1, grau: 5, contingencia: "Correção e substituição da etiqueta", tratamento: "Treinamento e barreiras", monitoramento: "Através de indicadores", meta: "Nunca acontecer" },
  { id: 6, setor: "farmacia", atividade: "Medicação prescrita", oQue: "Separação da medicação errada", consequencia: "Faltar dose correta na aplicação", severidade: 4, probabilidade: 3, grau: 12, contingencia: "Entrar em contato com paciente", tratamento: "Separar medicação corretamente", monitoramento: "Treinamento da equipe", meta: "Nunca acontecer" },
  { id: 7, setor: "farmacia", atividade: "Dispensação de perfurocortantes", oQue: "Não orientar sobre descarte de agulhas", consequencia: "Acidente com perfurocortante", severidade: 5, probabilidade: 5, grau: 25, contingencia: "Orientar e disponibilizar garrafa", tratamento: "Encaminhar caso à CIPA", monitoramento: "Educação continuada", meta: "Nunca acontecer" },
]
