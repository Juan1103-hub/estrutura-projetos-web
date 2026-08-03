import { test, expect } from "@playwright/test";

/**
 * T-025 — E2E do dashboard (AC-032/033/034, AC-047, AC-050/051).
 */

test.describe("Dashboard gerencial", () => {
  test("AC-032: exibe cards de contadores @spec:AC-032", async ({ page }) => {
    await page.goto("/dashboard");
    for (const label of ["Abertas", "Em Andamento", "Concluídas", "Atrasadas"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("AC-033: produtividade por colaborador @spec:AC-033", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Produtividade por colaborador/i)).toBeVisible();
  });

  test("AC-034: taxa de conclusão no prazo @spec:AC-034", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Taxa de conclusão no prazo/i)).toBeVisible();
    await expect(page.locator("p.text-5xl")).toBeVisible();
  });

  test("AC-047: distribuição por departamento @spec:AC-047", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Tarefas por departamento/i)).toBeVisible();
    for (const dept of ["Almoxarifado", "Compras", "Administrativo"]) {
      await expect(page.getByText(dept)).toBeVisible();
    }
  });
});
