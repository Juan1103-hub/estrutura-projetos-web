import { test, expect, type Page } from "@playwright/test";

/**
 * T-025 — E2E do dashboard (AC-032/033/034, AC-047, AC-050/051).
 */

// Login helper: o /dashboard é rota protegida (middleware) — sem sessão o
// middleware redireciona para /login e os KPIs nunca renderizam.
// Depois do login, navega para /dashboard via window.location (força reload
// completo; `page.goto` logo após o login conflita com o router do cliente e
// aborta com ERR_ABORTED).
async function loginAndOpenDashboard(page: Page) {
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
  await page.evaluate(() => {
    window.location.href = "/dashboard";
  });
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
}

test.describe("Dashboard gerencial", () => {
  test("AC-032: exibe cards de contadores @spec:AC-032", async ({ page }) => {
    await loginAndOpenDashboard(page);
    for (const label of ["Abertas", "Em Andamento", "Concluídas", "Atrasadas"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("AC-033: produtividade por colaborador @spec:AC-033", async ({ page }) => {
    await loginAndOpenDashboard(page);
    await expect(page.getByText(/Produtividade por colaborador/i)).toBeVisible();
  });

  test("AC-034: taxa de conclusão no prazo @spec:AC-034", async ({ page }) => {
    await loginAndOpenDashboard(page);
    await expect(page.getByText(/Taxa de conclusão no prazo/i)).toBeVisible();
    await expect(page.locator("p.text-5xl")).toBeVisible();
  });

  test("AC-047: distribuição por departamento @spec:AC-047", async ({ page }) => {
    await loginAndOpenDashboard(page);
    await expect(page.getByText(/Tarefas por departamento/i)).toBeVisible();
    for (const dept of ["Almoxarifado", "Compras", "Administrativo"]) {
      await expect(page.getByText(dept)).toBeVisible();
    }
  });
});
