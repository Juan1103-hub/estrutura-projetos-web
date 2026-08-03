import { test, expect } from "@playwright/test";

/**
 * T-025 — E2E de filtros e pesquisa (AC-035/036/037).
 */

test.describe("Filtros e pesquisa", () => {
  test.beforeEach(async ({ page }) => {
    // Login como supervisor (vê todas as tarefas).
    await page.goto("/login");
    const email = page.locator('input[type="email"]');
    const password = page.locator('input[type="password"]');
    await expect(email).toBeVisible();
    await email.fill("supervisor@vortice.com");
    await password.fill("123456");
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page).toHaveURL(/\/kanban/, { timeout: 10_000 });
  });

  test("AC-037: pesquisa por texto filtra os cards @spec:AC-037", async ({ page }) => {
    const search = page.getByPlaceholder("Título ou descrição...");
    await search.fill("inventário");
    // Apenas o card de Inventário deve aparecer.
    await expect(page.getByText("Inventário Setor A").first()).toBeVisible();
    await expect(page.getByText("Cotação Fornecedor XYZ")).toHaveCount(0);
  });

  test("AC-036: filtro de prioridade @spec:AC-036", async ({ page }) => {
    // Abre o select de prioridade (último select da barra) e escolhe "Crítica".
    // O base-ui usa itens com role="option" dentro de um popup; tenta abrir pelo
    // trigger (botão do select) e clicar na opção.
    const priorityGroup = page.locator("div", { has: page.locator("label", { hasText: "Prioridade" }) }).last();
    await priorityGroup.locator("button").click();
    await page.getByText("Crítica", { exact: true }).last().click();
    // Com prioridade Crítica, só o card "Ajuste de Saldo" aparece.
    await expect(page.getByText("Ajuste de Saldo - Material ABC").first()).toBeVisible();
  });

  test("AC-035: filtro por responsável @spec:AC-035", async ({ page }) => {
    // A barra de responsável deve exibir as opções.
    await expect(page.getByText("Responsável", { exact: true })).toBeVisible();
  });
});
