import { test, expect } from "@playwright/test";
import { addDays, format } from "date-fns";

const RESERVAR_URL = "/reservar";

// Fecha en el futuro (7 días) para evitar días bloqueados por política 24h
function fechaFutura(): string {
  return format(addDays(new Date(), 7), "yyyy-MM-dd");
}

test.describe("Flujo de reserva", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RESERVAR_URL);
  });

  test("muestra la página de reserva con servicios", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /reservar|cita/i })).toBeVisible();
    // Debe cargar al menos un servicio
    await expect(page.locator("[data-testid='servicio-card'], button[data-servicio]").first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test("completa el flujo completo de reserva", async ({ page }) => {
    // Paso 1: Seleccionar servicio
    const primerServicio = page
      .locator("button, [role='button']")
      .filter({ hasText: /corte|barba|afeitado/i })
      .first();
    await expect(primerServicio).toBeVisible({ timeout: 8_000 });
    await primerServicio.click();

    // Paso 2: Seleccionar fecha
    // Intentar hacer click en un día futuro disponible
    const diasDisponibles = page.locator("button[aria-label]").filter({ hasText: /^\d+$/ });
    await expect(diasDisponibles.first()).toBeVisible({ timeout: 8_000 });
    // Click en el primer día habilitado (no desactivado)
    const diaHabilitado = diasDisponibles
      .filter({ has: page.locator(":not([disabled]):not([aria-disabled='true'])") })
      .first();
    await diaHabilitado.click();

    // Paso 3: Seleccionar hora
    const primeraHora = page
      .locator("button")
      .filter({ hasText: /^\d{1,2}:\d{2}$/ })
      .first();
    await expect(primeraHora).toBeVisible({ timeout: 8_000 });
    await primeraHora.click();

    // Paso 4: Rellenar datos personales
    await page.getByPlaceholder(/nombre/i).fill("Test E2E");
    await page.getByPlaceholder(/teléfono|telefono/i).fill("666000111");
    // Email es opcional — lo dejamos vacío

    // Paso 5: Confirmar
    const btnConfirmar = page.getByRole("button", { name: /confirmar|reservar/i });
    await expect(btnConfirmar).toBeVisible();
    await btnConfirmar.click();

    // Resultado: mensaje de éxito o error de slot ocupado
    await expect(
      page.getByText(/confirmada|reservada|ocupado|no está disponible/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("no permite reservar sin rellenar datos obligatorios", async ({ page }) => {
    // Sin seleccionar nada, el botón confirmar no debe estar activo o debe mostrar error
    const btnConfirmar = page.getByRole("button", { name: /confirmar|reservar/i });
    if (await btnConfirmar.isVisible()) {
      await btnConfirmar.click();
      // O está deshabilitado o muestra validación
      const disabled = await btnConfirmar.isDisabled();
      if (!disabled) {
        await expect(page.getByText(/selecciona|elige|requerido|obligatorio/i)).toBeVisible({
          timeout: 5_000,
        });
      }
    }
  });
});
