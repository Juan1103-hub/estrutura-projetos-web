export interface TaskHistoryEntry {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface TaskHistoryEntryWithUser extends TaskHistoryEntry {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
}

export const HISTORY_ACTION_LABELS: Record<string, string> = {
  created: 'criou a tarefa',
  status_changed: 'mudou o status para',
  priority_changed: 'mudou a prioridade para',
  due_date_changed: 'alterou o prazo para',
  approved: 'aprovou a tarefa',
  rejected: 'reprovou a tarefa',
  commented: 'comentou',
  attached: 'anexou arquivo',
  reopened: 'reabriu a tarefa',
  requested_help: 'solicitou apoio',
  cancelled: 'cancelou a tarefa',
};
