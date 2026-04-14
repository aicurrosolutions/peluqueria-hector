import { test, expect } from "@playwright/test";

const ADMIN_URL = "/admin";
const DASHBOARD_URL = "/admin/dashboard";

test.describe("Admin login", () => {
  test.beforeEach(async ({ page }) => {
    // Asegurarse de que no haya sesión activa
    await page.context().clearCookies();
  });

  test("muestra el formulario de login", async ({ page }) => {
    await page.goto(ADMIN_URL);
    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible();
    await expect(page.getByPlaceholder(/usuario/i)).toBeVisible();
    await expect(page.getByPlaceholder(/contraseña/i)).toBeVisible();
  });

  test("rechaza credenciales incorrectas", async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByPlaceholder(/usuario/i).fill("hector");
    await page.getByPlaceholder(/contraseña/i).fill("wrongpassword");
    await page.getByRole("button", { name: /entrar|iniciar/i }).click();
    await expect(page.getByText(/credenciales incorrectas/i)).toBeVisible();
    await expect(page).toHaveURL(ADMIN_URL);
  });

  test("accede con credenciales correctas y redirige al dashboard", async ({ page }) => {
    await page.goto(ADMIN_URL);
    await page.getByPlaceholder(/usuario/i).fill(process.env.ADMIN_USERNAME ?? "hector");
    await page.getByPlaceholder(/contraseña/i).fill(process.env.ADMIN_PASSWORD ?? "hector1234");
    await page.getByRole("button", { name: /entrar|iniciar/i }).click();
    await page.waitForURL(`**${DASHBOARD_URL}**`, { timeout: 10_000 });
    await expect(page).toHaveURL(new RegExp(DASHBOARD_URL));
  });

  test("ruta protegida redirige al login sin sesión", async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveURL(new RegExp(ADMIN_URL));
  });
});
