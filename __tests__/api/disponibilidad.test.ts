import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    diaAbierto:   { findUnique: vi.fn() },
    diaCerrado:   { findUnique: vi.fn() },
    ausencia:     { findFirst: vi.fn() },
    horarioFranja: { findMany: vi.fn() },
    cita:         { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/disponibilidad/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function req(fecha: string, duracion = 30) {
  return new NextRequest(
    `http://localhost/api/disponibilidad?fecha=${fecha}&duracion=${duracion}`
  );
}

const FRANJAS_MANANA = [{ inicio: "09:00", fin: "14:00" }];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /api/disponibilidad", () => {
  beforeEach(() => {
    vi.mocked(prisma.diaAbierto.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.diaCerrado.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.ausencia.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.horarioFranja.findMany).mockResolvedValue(FRANJAS_MANANA as never);
    vi.mocked(prisma.cita.findMany).mockResolvedValue([] as never);
  });

  it("devuelve 400 si falta la fecha", async () => {
    const res = await GET(new NextRequest("http://localhost/api/disponibilidad?duracion=30"));
    expect(res.status).toBe(400);
  });

  it("devuelve 400 si la fecha tiene formato inválido", async () => {
    const res = await GET(req("01-06-2025"));
    expect(res.status).toBe(400);
  });

  it("devuelve slots vacíos si el día está cerrado", async () => {
    vi.mocked(prisma.diaCerrado.findUnique).mockResolvedValue({ id: "dc1" } as never);
    const res = await GET(req("2025-06-02")); // lunes
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.slots).toEqual([]);
  });

  it("devuelve slots vacíos si hay ausencia activa", async () => {
    vi.mocked(prisma.ausencia.findFirst).mockResolvedValue({ id: "aus1" } as never);
    const res = await GET(req("2025-06-02"));
    expect((await res.json()).slots).toEqual([]);
  });

  it("devuelve slots vacíos si no hay franjas configuradas y no es diaAbierto", async () => {
    vi.mocked(prisma.horarioFranja.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.diaAbierto.findUnique).mockResolvedValue(null);
    const res = await GET(req("2025-06-01")); // domingo — sin franjas
    expect((await res.json()).slots).toEqual([]);
  });

  it("devuelve todos los slots si no hay citas", async () => {
    const res = await GET(req("2025-06-02")); // lunes con franja 09:00–14:00
    const { slots } = await res.json();
    expect(slots).toContain("09:00");
    expect(slots).toContain("09:30");
    expect(slots.length).toBeGreaterThan(0);
  });

  it("filtra slots ocupados por una cita existente", async () => {
    // Cita de 30 min a las 10:00 → 10:00 no disponible
    vi.mocked(prisma.cita.findMany).mockResolvedValue([
      { hora: "10:00", servicio: { duracion: 30 } },
    ] as never);
    const res = await GET(req("2025-06-02"));
    const { slots } = await res.json();
    expect(slots).not.toContain("10:00");
    expect(slots).toContain("09:00"); // sigue libre
    expect(slots).toContain("10:30"); // empieza cuando termina la cita
  });

  it("filtra slots que solaparían con una cita larga", async () => {
    // Cita de 60 min a las 10:00 (10:00–11:00)
    // Intervalos abiertos: slot 09:30 termina a 10:00 = inicio cita → NO solapa (correcto)
    // Slot 10:00 empieza igual que la cita → SÍ solapa
    vi.mocked(prisma.cita.findMany).mockResolvedValue([
      { hora: "10:00", servicio: { duracion: 60 } },
    ] as never);
    const res = await GET(req("2025-06-02", 30));
    const { slots } = await res.json();
    expect(slots).not.toContain("10:00"); // ocupa exactamente el slot de la cita
    expect(slots).toContain("09:30");     // termina exactamente a las 10:00 → sin solapamiento
    expect(slots).toContain("11:00");     // empieza cuando termina la cita
  });

  it("usa franjas de HORARIO_DEFAULT si el día es diaAbierto sin franjas en BD", async () => {
    vi.mocked(prisma.horarioFranja.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.diaAbierto.findUnique).mockResolvedValue({ id: "da1" } as never);
    // Domingo (0) está vacío en HORARIO_DEFAULT → sin slots aunque sea diaAbierto con franjas vacías
    const res = await GET(req("2025-06-01")); // domingo
    expect((await res.json()).slots).toEqual([]);
  });
});
