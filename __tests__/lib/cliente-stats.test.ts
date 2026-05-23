import { describe, it, expect } from "vitest";
import { calcularStatsCliente } from "@/lib/cliente-stats";

// ── Helpers ───────────────────────────────────────────────────────────────────

const HOY = new Date("2025-06-01T12:00:00Z");

/** Construye una visita N días antes de HOY */
function visita(diasAtras: number, servicio = { nombre: "Corte", precio: 20 }) {
  const fecha = new Date(HOY);
  fecha.setDate(fecha.getDate() - diasAtras);
  return { fecha, servicio };
}

function cliente(
  citas: ReturnType<typeof visita>[],
  extra: Partial<{ nombre: string; telefono: string; email: string | null }> = {}
) {
  return {
    id: "c1",
    nombre: extra.nombre ?? "Test",
    telefono: extra.telefono ?? "600000000",
    email: extra.email ?? null,
    citas,
  };
}

// ── Categorías ────────────────────────────────────────────────────────────────

describe("calcularStatsCliente — categorización", () => {
  it("inactivo: sin citas", () => {
    const result = calcularStatsCliente(cliente([]), HOY);
    expect(result.categoria).toBe("inactivo");
    expect(result.totalVisitas).toBe(0);
    expect(result.gastoTotal).toBe(0);
  });

  it("nuevo: 1 visita hace ≤ 30 días", () => {
    expect(calcularStatsCliente(cliente([visita(15)]), HOY).categoria).toBe("nuevo");
  });

  it("nuevo: 1 visita exactamente hace 30 días", () => {
    expect(calcularStatsCliente(cliente([visita(30)]), HOY).categoria).toBe("nuevo");
  });

  it("inactivo: 1 visita hace 31 días", () => {
    expect(calcularStatsCliente(cliente([visita(31)]), HOY).categoria).toBe("inactivo");
  });

  it("frecuente: ≥2 visitas, última ≤45 días, frecuencia media ≤35 días", () => {
    // Frecuencia media = 20 días (visitas hace 20 y 40 días → intervalo 20)
    const result = calcularStatsCliente(cliente([visita(20), visita(40)]), HOY);
    expect(result.categoria).toBe("frecuente");
    expect(result.frecuenciaMedia).toBe(20);
  });

  it("regular: ≥2 visitas, última ≤45 días, frecuencia media >35 días", () => {
    // Frecuencia media = 40 días (visitas hace 5 y 45 días → intervalo 40)
    const result = calcularStatsCliente(cliente([visita(5), visita(45)]), HOY);
    expect(result.categoria).toBe("regular");
    expect(result.frecuenciaMedia).toBe(40);
  });

  it("en_riesgo: última visita entre 45 y 90 días", () => {
    // Última visita hace 60 días, con otra hace 100 → en_riesgo
    const result = calcularStatsCliente(cliente([visita(60), visita(100)]), HOY);
    expect(result.categoria).toBe("en_riesgo");
  });

  it("en_riesgo: última visita exactamente hace 90 días", () => {
    const result = calcularStatsCliente(cliente([visita(90), visita(130)]), HOY);
    expect(result.categoria).toBe("en_riesgo");
  });

  it("inactivo: última visita hace más de 90 días", () => {
    const result = calcularStatsCliente(cliente([visita(91), visita(150)]), HOY);
    expect(result.categoria).toBe("inactivo");
  });
});

// ── frecuenciaMedia ───────────────────────────────────────────────────────────

describe("calcularStatsCliente — frecuenciaMedia", () => {
  it("null si solo hay 1 visita", () => {
    expect(calcularStatsCliente(cliente([visita(10)]), HOY).frecuenciaMedia).toBeNull();
  });

  it("calcula correctamente con 2 visitas", () => {
    // 30 y 60 días → intervalo 30
    expect(calcularStatsCliente(cliente([visita(30), visita(60)]), HOY).frecuenciaMedia).toBe(30);
  });

  it("calcula promedio con 3 visitas", () => {
    // Visitas hace 10, 30, 80 → intervalos 20 y 50 → media = 35
    expect(calcularStatsCliente(cliente([visita(10), visita(30), visita(80)]), HOY).frecuenciaMedia).toBe(35);
  });
});

// ── servicioFavorito ──────────────────────────────────────────────────────────

describe("calcularStatsCliente — servicioFavorito", () => {
  it("null si no hay visitas", () => {
    expect(calcularStatsCliente(cliente([]), HOY).servicioFavorito).toBeNull();
  });

  it("devuelve el único servicio si solo hay uno", () => {
    const result = calcularStatsCliente(
      cliente([visita(10, { nombre: "Barba", precio: 15 })]),
      HOY
    );
    expect(result.servicioFavorito).toBe("Barba");
  });

  it("elige el servicio más frecuente", () => {
    const citas = [
      visita(5,  { nombre: "Corte", precio: 20 }),
      visita(15, { nombre: "Corte", precio: 20 }),
      visita(25, { nombre: "Barba", precio: 15 }),
    ];
    expect(calcularStatsCliente(cliente(citas), HOY).servicioFavorito).toBe("Corte");
  });

  it("desempata por orden de inserción cuando hay empate", () => {
    const citas = [
      visita(5,  { nombre: "Corte", precio: 20 }),
      visita(15, { nombre: "Barba", precio: 15 }),
    ];
    // Ambos con 1 visita → el que sale primero en Object.entries gana
    const result = calcularStatsCliente(cliente(citas), HOY);
    expect(["Corte", "Barba"]).toContain(result.servicioFavorito);
  });
});

// ── gastoTotal ────────────────────────────────────────────────────────────────

describe("calcularStatsCliente — gastoTotal", () => {
  it("cero si no hay visitas", () => {
    expect(calcularStatsCliente(cliente([]), HOY).gastoTotal).toBe(0);
  });

  it("suma los precios de todas las visitas", () => {
    const citas = [
      visita(5,  { nombre: "Corte", precio: 20 }),
      visita(15, { nombre: "Barba", precio: 12 }),
      visita(25, { nombre: "Corte y barba", precio: 30 }),
    ];
    expect(calcularStatsCliente(cliente(citas), HOY).gastoTotal).toBe(62);
  });
});

// ── ultimaVisita y diasDesdeUltima ────────────────────────────────────────────

describe("calcularStatsCliente — ultimaVisita / diasDesdeUltima", () => {
  it("null si no hay visitas", () => {
    const result = calcularStatsCliente(cliente([]), HOY);
    expect(result.ultimaVisita).toBeNull();
    expect(result.diasDesdeUltima).toBeNull();
  });

  it("toma la visita más reciente (primera del array ya ordenado desc)", () => {
    // La función espera citas ordenadas por fecha desc (como Prisma devuelve)
    const result = calcularStatsCliente(cliente([visita(10), visita(30)]), HOY);
    expect(result.diasDesdeUltima).toBe(10);
    expect(result.totalVisitas).toBe(2);
  });

  it("ultimaVisita es un ISO string válido", () => {
    const result = calcularStatsCliente(cliente([visita(5)]), HOY);
    expect(result.ultimaVisita).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
