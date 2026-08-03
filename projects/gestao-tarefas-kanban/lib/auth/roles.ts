import { TaskWithRelations } from "@/types/task";

/**
 * T-004/005 — Perfis e permissões (RBAC).
 *
 * Perfis do sistema Vórtice Mineral:
 * - `supervisor`            — cria/edita/exclui tarefas, aprova/reprova, vê tudo
 * - `almoxarife`            — vê e executa tarefas do Almoxarifado
 * - `comprador`             — vê e executa tarefas de Compras
 * - `assistente_administrativo` — vê e executa tarefas Administrativas
 *
 * Regra central (AC-014): o Almoxarife (e demais operacionais) só vê e
 * manipula as próprias tarefas; não pode criar/editar/excluir tarefas de
 * outros colaboradores.
 */

export type UserRole =
  | "supervisor"
  | "almoxarife"
  | "comprador"
  | "assistente_administrativo";

export const ROLE_LABELS: Record<UserRole, string> = {
  supervisor: "Supervisor",
  almoxarife: "Almoxarife",
  comprador: "Comprador",
  assistente_administrativo: "Assistente Administrativo",
};

export type Permission =
  | "tasks.create"
  | "tasks.edit"
  | "tasks.delete"
  | "tasks.approve"
  | "tasks.view_all";

/** Permissões globais por perfil. */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  supervisor: ["tasks.create", "tasks.edit", "tasks.delete", "tasks.approve", "tasks.view_all"],
  almoxarife: [],
  comprador: [],
  assistente_administrativo: [],
};

/** Verifica se o perfil tem uma permissão global. */
export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** True se o usuário está entre os responsáveis da tarefa (inclui responsáveis adicionais). */
export function isResponsible(task: TaskWithRelations, userId: string): boolean {
  if (task.responsible_id === userId) return true;
  return (task.responsible_ids ?? []).includes(userId);
}

/**
 * Regra do AC-014: um operacional só pode editar/excluir tarefas das QUAIS é
 * responsável (inclui responsáveis adicionais). O supervisor pode mexer em
 * todas (task.view_all).
 */
export function canModifyTask(role: UserRole, task: TaskWithRelations, userId: string): boolean {
  if (role === "supervisor") return true;
  return isResponsible(task, userId);
}

/** Lista de tarefas que o usuário vê (AC-014: operacional vê as próprias,
 * incluindo tarefas em que é responsável adicional). */
export function visibleTasks(
  role: UserRole,
  tasks: TaskWithRelations[],
  userId: string
): TaskWithRelations[] {
  if (role === "supervisor") return tasks;
  return tasks.filter((t) => isResponsible(t, userId));
}