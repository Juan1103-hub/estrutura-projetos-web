import { TaskWithRelations, TaskCategory } from "@/types/task";

/**
 * T-018 — Indicadores por departamento (AC-047/AC-050/AC-051).
 *
 * Agrupa tarefas por departamento (Almoxarifado, Compras, Administrativo)
 * usando o prefixo da categoria, e calcula indicadores específicos de cada um.
 * Funções puras e testáveis.
 */

export type Department = "almoxarifado" | "compras" | "administrativo";

export const DEPARTMENT_PREFIX: Record<Department, string> = {
  almoxarifado: "almoxarifado_",
  compras: "compras_",
  administrativo: "administrativo_",
};

export const DEPARTMENT_LABEL: Record<Department, string> = {
  almoxarifado: "Almoxarifado",
  compras: "Compras",
  administrativo: "Administrativo",
};

/** Descobre o departamento a partir da categoria (por prefixo). */
export function departmentOf(category: TaskCategory): Department | null {
  if (category.startsWith("almoxarifado_")) return "almoxarifado";
  if (category.startsWith("compras_")) return "compras";
  if (category.startsWith("administrativo_")) return "administrativo";
  return null;
}

export interface DepartmentDistribution {
  department: Department;
  label: string;
  count: number;
}

/**
 * Distribuição de tarefas por departamento (AC-047).
 * Ordena Almoxarifado, Compras, Administrativo.
 */
export function distributionByDepartment(tasks: TaskWithRelations[]): DepartmentDistribution[] {
  const counts: Record<Department, number> = { almoxarifado: 0, compras: 0, administrativo: 0 };
  tasks.forEach((t) => {
    const dept = departmentOf(t.category);
    if (dept) counts[dept]++;
  });
  return (Object.keys(counts) as Department[]).map((dept) => ({
    department: dept,
    label: DEPARTMENT_LABEL[dept],
    count: counts[dept],
  }));
}

/**
 * Indicadores específicos de Almoxarifado (AC-050).
 * Conta tarefas por subcategoria de inventário/ajuste/cadastro.
 */
export function almoxarifadoMetrics(tasks: TaskWithRelations[]) {
  return {
    inventarios: tasks.filter((t) => t.category === "almoxarifado_inventario").length,
    ajustes: tasks.filter((t) => t.category === "almoxarifado_ajustes_saldo").length,
    cadastros: tasks.filter((t) => t.category === "almoxarifado_cadastro_materiais").length,
  };
}

/**
 * Indicadores específicos de Compras (AC-051).
 * Conta cotações realizadas; economia e tempo médio vêm de valores
 * passados (no demo, derivados de uma estimativa simples das tarefas).
 */
export function comprasMetrics(tasks: TaskWithRelations[]) {
  return {
    cotacoes: tasks.filter((t) => t.category === "compras_cotacao").length,
    economia: 0,
    tempoMedioDias: 0,
  };
}