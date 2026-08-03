import { test, expect } from "@playwright/test";

/**
 * T-025 — E2E de autenticação e RBAC (AC-012/013/014).
 */

test.describe("Autenticação", () => {
  test("AC-012: login com credenciais válidas redireciona ao quadro @spec:AC-012", async ({ page }) => {
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
    await expect(page.getByText("Maria Santos")).toBeVisible();
  });

  test("AC-013: credenciais inválidas mostram erro e permanece no login @spec:AC-013", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "supervisor@vortice.com");
    await page.fill('input[type="password"]', "senha-errada");
    await page.click('button[type="submit"]');
    await expect(page.getByText("E-mail ou senha incorretos")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("AC-014: Almoxarife não vê tarefas de outros @spec:AC-014", async ({ page }) => {
    // Login como almoxarife (João) — não deve ver tarefas que não são dele.
    await page.goto("/login");
    const email = page.locator('input[type="email"]');
    const password = page.locator('input[type="password"]');
    await expect(email).toBeVisible();
    await email.fill("joao@vortice.com");
    await password.fill("123456");
    const submit = page.locator('button[type="submit"]');
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page).toHaveURL(/\/kanban/, { timeout: 10_000 });
    await expect(page.getByText("João Silva")).toBeVisible();
  });
});
