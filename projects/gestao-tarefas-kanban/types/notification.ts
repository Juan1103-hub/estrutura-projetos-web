export type NotificationType =
  | 'task_assigned'
  | 'task_updated'
  | 'task_commented'
  | 'task_approved'
  | 'task_rejected'
  | 'task_overdue'
  | 'task_due_soon'
  | 'task_reopened'
  | 'task_cancelled';

export interface AppNotification {
  id: string;
  user_id: string;
  task_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
