import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  generarSlots,
  formatearDuracion,
  formatearFranjas,
  hayConflicto,
  type FranjaHoraria,
} from "@/lib/horarios";

// ── timeToMinutes ─────────────────────────────────────────────────────────────

describe("timeToMinutes", () => {
  it("convierte medianoche", () => expect(timeToMinutes("00:00")).toBe(0));
  it("convierte horas enteras", () => expect(timeToMinutes("10:00")).toBe(600));
  it("convierte con minutos", () => expect(timeToMinutes("09:30")).toBe(570));
  it("convierte fin de día", () => expect(timeToMinutes("23:59")).toBe(1439));
  it("convierte mediodía", () => expect(timeToMinutes("12:00")).toBe(720));
});

// ── generarSlots ──────────────────────────────────────────────────────────────
// Los slots se generan cada 30 min mientras el inicio sea < cierre de franja.
// La duración del servicio NO restringe qué slots se generan.

describe("generarSlots", () => {
  it("devuelve [] si no hay franjas", () => {
    expect(generarSlots(30, [])).toEqual([]);
  });

  it("genera slots cada 30 min dentro de una franja", () => {
    // Franja 09:00–10:00 → 09:00 (< 10:00 ✓), 09:30 (< 10:00 ✓), 10:00 (< 10:00 ✗)
    const franjas: FranjaHoraria[] = [{ inicio: "09:00", fin: "10:00" }];
    expect(generarSlots(30, franjas)).toEqual(["09:00", "09:30"]);
  });

  it("genera slots aunque el servicio sea más largo que la franja restante", () => {
    // Franja 09:00–09:45, servicio 60 min: ahora se generan los slots que empiezan antes de 09:45
    const franjas: FranjaHoraria[] = [{ inicio: "09:00", fin: "09:45" }];
    expect(generarSlots(60, franjas)).toEqual(["09:00", "09:30"]);
  });

  it("genera slots aunque el servicio coincida exactamente con el cierre", () => {
    // Franja 09:00–10:00, servicio 60 min → 09:00 y 09:30 (ambos < 10:00)
    const franjas: FranjaHoraria[] = [{ inicio: "09:00", fin: "10:00" }];
    expect(generarSlots(60, franjas)).toEqual(["09:00", "09:30"]);
  });

  it("respeta el paso de 30 min entre slots independientemente de la duración", () => {
    // Franja 09:00–11:00, servicio 45 min → 09:00, 09:30, 10:00, 10:30 (todos < 11:00)
    const franjas: FranjaHoraria[] = [{ inicio: "09:00", fin: "11:00" }];
    expect(generarSlots(45, franjas)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("combina slots de dos franjas separadas (pausa comida)", () => {
    // Franja mañana 09:00–10:00: slots 09:00 y 09:30 (10:00 no cabe, es igual al límite)
    // Franja tarde  16:00–17:00: slots 16:00 y 16:30
    const franjas: FranjaHoraria[] = [
      { inicio: "09:00", fin: "10:00" },
      { inicio: "16:00", fin: "17:00" },
    ];
    const slots = generarSlots(30, franjas);
    expect(slots).toContain("09:00");
    expect(slots).toContain("09:30");
    expect(slots).toContain("16:00");
    expect(slots).toContain("16:30");
    expect(slots).not.toContain("10:00"); // 10:00 no es < 10:00 → no se genera
    expect(slots).not.toContain("11:00"); // fuera de ambas franjas
  });

  it("devuelve [] si inicio == fin (franja de longitud cero)", () => {
    const franjas: FranjaHoraria[] = [{ inicio: "09:30", fin: "09:30" }];
    expect(generarSlots(30, franjas)).toEqual([]);
  });
});

// ── hayConflicto ──────────────────────────────────────────────────────────────
// Todas las citas ocupan exactamente 30 min para la detección de conflictos,
// independientemente de su duración real. Esto permite reservar cada 30 min.

describe("hayConflicto", () => {
  it("devuelve false si no hay citas", () => {
    expect(hayConflicto("10:00", 30, [])).toBe(false);
  });

  it("detecta conflicto exacto (mismo slot)", () => {
    expect(hayConflicto("10:00", 30, [{ hora: "10:00", duracion: 30 }])).toBe(true);
  });

  it("no hay conflicto con slot adyacente 30 min después", () => {
    // Cita 10:00–10:30 (30-min efectivo). Slot 10:30–11:00 → sin solapamiento
    expect(hayConflicto("10:30", 30, [{ hora: "10:00", duracion: 30 }])).toBe(false);
  });

  it("no hay conflicto con slot adyacente 30 min antes", () => {
    // Cita 10:00–10:30. Slot 09:30–10:00 → sin solapamiento (fin == inicio, intervalo abierto)
    expect(hayConflicto("09:30", 30, [{ hora: "10:00", duracion: 30 }])).toBe(false);
  });

  it("no bloquea el slot siguiente aunque la cita real sea larga (60 min real, 30 min efectivo)", () => {
    // Una cita de 60 min a las 10:00 solo bloquea el slot 10:00; 10:30 y 11:00 quedan libres
    expect(hayConflicto("10:30", 30, [{ hora: "10:00", duracion: 60 }])).toBe(false);
    expect(hayConflicto("11:00", 30, [{ hora: "10:00", duracion: 60 }])).toBe(false);
  });

  it("detecta conflicto con múltiples citas — el slot coincide con una", () => {
    const citas = [
      { hora: "09:00", duracion: 30 },
      { hora: "10:00", duracion: 30 },
      { hora: "12:00", duracion: 30 },
    ];
    expect(hayConflicto("10:00", 30, citas)).toBe(true);
  });

  it("no detecta conflicto cuando el slot está entre dos citas adyacentes", () => {
    const citas = [
      { hora: "09:00", duracion: 30 }, // 09:00–09:30
      { hora: "10:00", duracion: 30 }, // 10:00–10:30
    ];
    // Slot 09:30–10:00 → adyacente a ambas, sin solapamiento
    expect(hayConflicto("09:30", 30, citas)).toBe(false);
  });
});

// ── formatearDuracion ─────────────────────────────────────────────────────────

describe("formatearDuracion", () => {
  it("muestra minutos si < 60", () => expect(formatearDuracion(30)).toBe("30 min"));
  it("muestra exactamente 60 como 1h", () => expect(formatearDuracion(60)).toBe("1h"));
  it("muestra horas y minutos mixtos", () => expect(formatearDuracion(90)).toBe("1h 30min"));
  it("muestra múltiples horas enteras", () => expect(formatearDuracion(120)).toBe("2h"));
  it("muestra horas y minutos para valores grandes", () => expect(formatearDuracion(150)).toBe("2h 30min"));
  it("muestra minutos para 15 min", () => expect(formatearDuracion(15)).toBe("15 min"));
  it("muestra minutos para 45 min", () => expect(formatearDuracion(45)).toBe("45 min"));
});

// ── formatearFranjas ──────────────────────────────────────────────────────────

describe("formatearFranjas", () => {
  it("devuelve Cerrado si no hay franjas", () => {
    expect(formatearFranjas([])).toBe("Cerrado");
  });

  it("formatea una sola franja", () => {
    expect(formatearFranjas([{ inicio: "09:00", fin: "14:00" }])).toBe("09:00 – 14:00");
  });

  it("formatea múltiples franjas con separador ·", () => {
    expect(
      formatearFranjas([
        { inicio: "09:00", fin: "14:00" },
        { inicio: "16:00", fin: "20:00" },
      ])
    ).toBe("09:00 – 14:00 · 16:00 – 20:00");
  });
});
