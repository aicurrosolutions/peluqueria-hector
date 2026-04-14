import { test, expect } from "@playwright/test";

/**
 * Tests del flujo de cancelación de cita.
 *
 * Estos tests requieren un ID de cita válido en BD.
 * Para CI usa CITA_TEST_ID + CITA_TEST_TELEFONO como variables de entorno.
 * Si no están definidas, el test verifica solo la estructura de la página.
 */

const CITA_TEST_ID = process.env.CITA_TEST_ID ?? "";
const CITA_TEST_TELEFONO = process.env.CITA_TEST_TELEFONO ?? "";

test.describe("Flujo de cancelación", () => {
  test("página de cancelación con ID inválido muestra error 404", async ({ page }) => {
    await page.goto("/cancelar/id-que-no-existe");
    await expect(
      page.getByText(/no encontrada|no existe|no se encontró/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test("página de cancelación con ID válido muestra el formulario", async ({ page }) => {
    if (!CITA_TEST_ID) {
      test.skip(true, "CITA_TEST_ID no está configurado");
      return;
    }

    await page.goto(`/cancelar/${CITA_TEST_ID}`);
    // Debe mostrar información de la cita
    await expect(page.getByText(/cancelar/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByPlaceholder(/teléfono|telefono/i)).toBeVisible();
  });

  test("rechaza cancelación con teléfono incorrecto", async ({ page }) => {
    if (!CITA_TEST_ID) {
      test.skip(true, "CITA_TEST_ID no está configurado");
      return;
    }

    await page.goto(`/cancelar/${CITA_TEST_ID}`);
    await page.getByPlaceholder(/teléfono|telefono/i).fill("0000");
    await page.getByRole("button", { name: /cancelar/i }).click();
    await expect(
      page.getByText(/no coincide|incorrecto|verificar/i)
    ).toBeVisible({ timeout: 8_000 });
  });

  test("permite cancelar con teléfono correcto (flujo completo)", async ({ page }) => {
    if (!CITA_TEST_ID || !CITA_TEST_TELEFONO) {
      test.skip(true, "CITA_TEST_ID o CITA_TEST_TELEFONO no están configurados");
      return;
    }

    await page.goto(`/cancelar/${CITA_TEST_ID}`);
    await page.getByPlaceholder(/teléfono|telefono/i).fill(CITA_TEST_TELEFONO);
    await page.getByRole("button", { name: /cancelar/i }).click();

    await expect(
      page.getByText(/cancelada|cancelado|exitosamente/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
