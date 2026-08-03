export type TaskStatus =
  | 'backlog'
  | 'a_fazer'
  | 'em_andamento'
  | 'aguardando_terceiros'
  | 'aguardando_aprovacao'
  | 'concluido'
  | 'cancelado';

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'critica';

export type TaskCategory =
  | 'almoxarifado_controle_estoque'
  | 'almoxarifado_inventario'
  | 'almoxarifado_cadastro_materiais'
  | 'almoxarifado_ajustes_saldo'
  | 'almoxarifado_recebimento'
  | 'almoxarifado_organizacao'
  | 'almoxarifado_controle_minmax'
  | 'compras_solicitacao'
  | 'compras_cotacao'
  | 'compras_negociacao'
  | 'compras_pedido'
  | 'compras_followup'
  | 'compras_contratacao'
  | 'administrativo_relatorios'
  | 'administrativo_indicadores'
  | 'administrativo_cadastros'
  | 'administrativo_processos'
  | 'administrativo_auditorias'
  | 'administrativo_controle_documental';

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  responsible_id: string;
  /** Responsáveis adicionais (tarefa com mais de uma pessoa). O primeiro
   * responsável fica em `responsible_id`; os demais entram aqui. */
  responsible_ids?: string[];
  requester_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string | null;
  completed_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  help_requested: boolean;
  help_reason: string | null;
  reopen_requested: boolean;
  reopen_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  responsible: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
  requester: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
  checklist_items: ChecklistItem[];
  comments_count: number;
  attachments_count: number;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento',
  aguardando_terceiros: 'Aguardando Terceiros',
  aguardando_aprovacao: 'Aguardando Aprovação',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  almoxarifado_controle_estoque: 'Controle de Estoque',
  almoxarifado_inventario: 'Inventário',
  almoxarifado_cadastro_materiais: 'Cadastro de Materiais',
  almoxarifado_ajustes_saldo: 'Ajustes de Saldo',
  almoxarifado_recebimento: 'Recebimento de Materiais',
  almoxarifado_organizacao: 'Organização Física',
  almoxarifado_controle_minmax: 'Controle Mínimo e Máximo',
  compras_solicitacao: 'Solicitação de Compra',
  compras_cotacao: 'Cotação',
  compras_negociacao: 'Negociação',
  compras_pedido: 'Pedido de Compra',
  compras_followup: 'Follow-up com Fornecedores',
  compras_contratacao: 'Contratação de Serviços',
  administrativo_relatorios: 'Relatórios',
  administrativo_indicadores: 'Indicadores',
  administrativo_cadastros: 'Cadastros',
  administrativo_processos: 'Processos Internos',
  administrativo_auditorias: 'Auditorias',
  administrativo_controle_documental: 'Controle Documental',
};
