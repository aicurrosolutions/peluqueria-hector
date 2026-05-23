import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cita:     { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
    servicio: { findUnique: vi.fn() },
    cliente:  { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getAdminSession: vi.fn().mockResolvedValue(null), // usuario público por defecto
}));

vi.mock("@/lib/ratelimit", () => ({
  rlCitas: null, // sin rate limiting externo en tests
  getIP: () => "127.0.0.1",
  rateLimitResponse: () => new Response(null, { status: 429 }),
}));

vi.mock("@/lib/email", () => ({
  enviarConfirmacion: vi.fn().mockResolvedValue(undefined),
  notificarBarber:    vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/push", () => ({
  enviarPushNuevaCita: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/citas/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

const SERVICIO_CORTE = { id: "srv1", nombre: "Corte", precio: 20, duracion: 30, activo: true };

const CITA_VALIDA = {
  servicioId: "srv1",
  fecha: "2025-06-10",
  hora: "10:00",
  nombre: "Juan García",
  telefono: "612345678",
  email: "juan@test.com",
};

function postReq(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/citas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const CITA_CREADA = {
  id: "cita1", ...CITA_VALIDA, estado: "CONFIRMADA",
  fecha: new Date("2025-06-10"), createdAt: new Date(), updatedAt: new Date(),
  clienteId: "c1", notas: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/citas — validación de entrada", () => {
  it("rechaza body vacío (400)", async () => {
    const res = await POST(postReq({}));
    expect(res.status).toBe(400);
  });

  it("rechaza nombre con caracteres inválidos (400)", async () => {
    const res = await POST(postReq({ ...CITA_VALIDA, nombre: "Juan<script>" }));
    expect(res.status).toBe(400);
  });

  it("rechaza teléfono demasiado corto (400)", async () => {
    const res = await POST(postReq({ ...CITA_VALIDA, telefono: "123" }));
    expect(res.status).toBe(400);
  });

  it("rechaza fecha con formato incorrecto (400)", async () => {
    const res = await POST(postReq({ ...CITA_VALIDA, fecha: "10/06/2025" }));
    expect(res.status).toBe(400);
  });

  it("rechaza hora con formato incorrecto (400)", async () => {
    const res = await POST(postReq({ ...CITA_VALIDA, hora: "10:00:00" }));
    expect(res.status).toBe(400);
  });

  it("rechaza si falta el email en reserva pública (400)", async () => {
    vi.mocked(prisma.cita.count).mockResolvedValue(0 as never);
    vi.mocked(prisma.cita.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.servicio.findUnique).mockResolvedValue(SERVICIO_CORTE as never);
    const res = await POST(postReq({ ...CITA_VALIDA, email: "" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });
});

describe("POST /api/citas — honeypot anti-bot", () => {
  it("rechaza silenciosamente si el campo _gotcha tiene contenido (409)", async () => {
    const res = await POST(postReq({ ...CITA_VALIDA, _gotcha: "bot_content" }));
    // El honeypot devuelve el mismo error que slot ocupado para no revelar nada
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/disponible/i);
  });
});

describe("POST /api/citas — rate limiting por teléfono", () => {
  it("rechaza si el teléfono ya tiene una reserva reciente (429)", async () => {
    vi.mocked(prisma.cita.count)
      .mockResolvedValueOnce(1 as never) // reservasRecientes > 0
      .mockResolvedValueOnce(0 as never);
    const res = await POST(postReq(CITA_VALIDA));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/acabas de hacer/i);
  });

  it("rechaza si el teléfono ya tiene 2 citas activas futuras (429)", async () => {
    vi.mocked(prisma.cita.count)
      .mockResolvedValueOnce(0 as never)  // reservasRecientes = 0
      .mockResolvedValueOnce(2 as never); // citasActivasFuturas = 2
    const res = await POST(postReq(CITA_VALIDA));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/2 citas/i);
  });
});

describe("POST /api/citas — detección de conflictos", () => {
  beforeEach(() => {
    vi.mocked(prisma.cita.count).mockResolvedValue(0 as never);
    vi.mocked(prisma.servicio.findUnique).mockResolvedValue(SERVICIO_CORTE as never);
  });

  it("rechaza si el slot ya está ocupado (409)", async () => {
    // Hay una cita a las 10:00 de 30 min → el mismo slot choca
    vi.mocked(prisma.cita.findMany).mockResolvedValue([
      { hora: "10:00", servicio: { duracion: 30 } },
    ] as never);
    const res = await POST(postReq(CITA_VALIDA));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/disponible/i);
  });

  it("acepta si el slot está 30 min después aunque la cita anterior sea larga (201)", async () => {
    // Con la lógica de 30 min fijos, una cita de 60 min a las 09:30 solo bloquea 09:30.
    // El slot 10:00 queda libre aunque el servicio técnicamente no haya terminado.
    vi.mocked(prisma.cita.findMany).mockResolvedValue([
      { hora: "09:30", servicio: { duracion: 60 } },
    ] as never);
    vi.mocked(prisma.$transaction).mockResolvedValue(CITA_CREADA as never);
    const res = await POST(postReq(CITA_VALIDA)); // hora 10:00
    expect(res.status).toBe(201);
  });

  it("acepta si el slot empieza exactamente al terminar otra cita (sin solapamiento)", async () => {
    // Cita de 30 min a las 09:30 → termina 10:00 → nueva cita 10:00 no solapa
    vi.mocked(prisma.cita.findMany).mockResolvedValue([
      { hora: "09:30", servicio: { duracion: 30 } },
    ] as never);
    vi.mocked(prisma.$transaction).mockResolvedValue(CITA_CREADA as never);
    const res = await POST(postReq(CITA_VALIDA));
    expect(res.status).toBe(201);
  });
});

describe("POST /api/citas — servicio no encontrado", () => {
  it("devuelve 404 si el servicioId no existe", async () => {
    vi.mocked(prisma.cita.count).mockResolvedValue(0 as never);
    vi.mocked(prisma.cita.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.servicio.findUnique).mockResolvedValue(null);
    const res = await POST(postReq(CITA_VALIDA));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/citas — happy path", () => {
  it("crea la cita y devuelve 201", async () => {
    vi.mocked(prisma.cita.count).mockResolvedValue(0 as never);
    vi.mocked(prisma.cita.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.servicio.findUnique).mockResolvedValue(SERVICIO_CORTE as never);
    vi.mocked(prisma.$transaction).mockResolvedValue(CITA_CREADA as never);

    const res = await POST(postReq(CITA_VALIDA));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("cita1");
    expect(body.estado).toBe("CONFIRMADA");
  });
});
