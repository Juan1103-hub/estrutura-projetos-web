import { TaskWithRelations, TaskCategory, TaskPriority } from "@/types/task";

/**
 * T-019 — Filtros e pesquisa.
 *
 * Funções puras de filtragem (testáveis de forma isolada). O quadro usa estas
 * para restringir as tarefas exibidas por coluna. Quem pede um filtro vazio
 * ignora aquele critério.
 */

export interface TaskFilters {
  responsibleId?: string | null;
  category?: TaskCategory | null;
  priority?: TaskPriority | null;
  search?: string | null;
}

/** Normaliza o texto para busca case-insensitive sem acentos. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Aplica todos os filtros a uma lista de tarefas. Todos os critérios são AND:
 * a tarefa precisa passar por cada um que estiver definido.
 */
export function filterTasks(tasks: TaskWithRelations[], filters: TaskFilters): TaskWithRelations[] {
  return tasks.filter((task) => {
    // Filtro por responsável
    if (filters.responsibleId && task.responsible?.id !== filters.responsibleId) {
      return false;
    }
    // Filtro por categoria
    if (filters.category && task.category !== filters.category) {
      return false;
    }
    // Filtro por prioridade
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    // Pesquisa por texto (título ou descrição)
    if (filters.search) {
      const needle = normalize(filters.search);
      const title = normalize(task.title);
      const desc = normalize(task.description ?? "");
      if (!title.includes(needle) && !desc.includes(needle)) {
        return false;
      }
    }
    return true;
  });
}

/** Lista única de responsáveis presentes nas tarefas (para o filtro). */
export function uniqueResponsibles(tasks: TaskWithRelations[]) {
  const map = new Map<string, { id: string; name: string }>();
  tasks.forEach((t) => {
    if (t.responsible && !map.has(t.responsible.id)) {
      map.set(t.responsible.id, { id: t.responsible.id, name: t.responsible.full_name });
    }
  });
  return [...map.values()];
}