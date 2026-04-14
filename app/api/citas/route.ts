import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { parseISO, startOfDay, endOfDay, subMinutes } from "date-fns";
import { enviarConfirmacion, notificarBarber } from "@/lib/email";
import { logger } from "@/lib/logger";
import { z } from "zod";

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const CitaPostSchema = z.object({
  servicioId: z.string().min(1),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe ser YYYY-MM-DD"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora debe ser HH:MM"),
  nombre: z.string().min(2).max(100).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]+$/, "Nombre inválido"),
  telefono: z.string().min(9).max(20).regex(/^[+\d\s()\-]{9,20}$/, "Teléfono inválido"),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  _adminOverride: z.boolean().optional(), // interno — el admin puede omitir email
  _gotcha: z.string().max(0).optional(), // honeypot — los bots lo rellenan, los humanos no
});

const CitaGetSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = CitaGetSchema.safeParse({ fecha: searchParams.get("fecha") ?? undefined });

  if (!parsed.success) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const fechaStr = parsed.data.fecha;
  const where = fechaStr
    ? {
        fecha: {
          gte: startOfDay(parseISO(fechaStr)),
          lte: endOfDay(parseISO(fechaStr)),
        },
      }
    : {};

  const citas = await prisma.cita.findMany({
    where,
    include: { servicio: true },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });

  return NextResponse.json(citas);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CitaPostSchema.safeParse(body);

    if (!parsed.success) {
      // Si el honeypot tiene contenido, rechazamos silenciosamente (mismo 409 que slot ocupado)
      const esHoneypot = parsed.error.issues.some((i) => i.path[0] === "_gotcha");
      if (esHoneypot) {
        return NextResponse.json({ error: "Esta hora ya no está disponible" }, { status: 409 });
      }
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const session = await getAdminSession();
    const { servicioId, fecha, hora, nombre, telefono, email } = parsed.data;
    const emailVal = email || undefined;

    // El email es obligatorio para reservas públicas; el admin puede omitirlo
    if (!emailVal && !session) {
      return NextResponse.json({ error: "El email es obligatorio para recibir la confirmación" }, { status: 400 });
    }
    const fechaDate = parseISO(fecha);

    // ── Seguridad: rate limiting por teléfono ──────────────────────────────
    // 1. Mismo teléfono no puede reservar más de 1 cita en los últimos 10 minutos
    const hace10min = subMinutes(new Date(), 10);
    const reservasRecientes = await prisma.cita.count({
      where: {
        telefono,
        createdAt: { gte: hace10min },
      },
    });
    if (reservasRecientes > 0) {
      return NextResponse.json(
        { error: "Acabas de hacer una reserva. Espera unos minutos antes de hacer otra." },
        { status: 429 }
      );
    }

    // 2. Mismo teléfono no puede tener más de 2 citas activas (pendiente/confirmada) en el futuro
    const citasActivasFuturas = await prisma.cita.count({
      where: {
        telefono,
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        fecha: { gte: startOfDay(new Date()) },
      },
    });
    if (citasActivasFuturas >= 2) {
      return NextResponse.json(
        { error: "Ya tienes 2 citas reservadas. Cancela una antes de hacer otra nueva." },
        { status: 429 }
      );
    }
    // ──────────────────────────────────────────────────────────────────────

    // Obtener en paralelo las citas del día (con duración) y el servicio solicitado
    const [citasDelDia, servicio] = await Promise.all([
      prisma.cita.findMany({
        where: {
          fecha: { gte: startOfDay(fechaDate), lte: endOfDay(fechaDate) },
          estado: { not: "CANCELADA" },
        },
        select: { hora: true, servicio: { select: { duracion: true } } },
      }),
      prisma.servicio.findUnique({ where: { id: servicioId } }),
    ]);

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Verificar solapamiento real de intervalos
    const nuevoInicio = timeToMinutes(hora);
    const nuevoFin = nuevoInicio + servicio.duracion;

    const hayConflicto = citasDelDia.some((cita) => {
      const citaInicio = timeToMinutes(cita.hora);
      const citaFin = citaInicio + cita.servicio.duracion;
      return citaInicio < nuevoFin && citaFin > nuevoInicio;
    });

    if (hayConflicto) {
      return NextResponse.json({ error: "Esta hora ya no está disponible" }, { status: 409 });
    }

    // Transacción: upsert cliente + crear cita de forma atómica
    let cita;
    try {
      cita = await prisma.$transaction(async (tx) => {
        let clienteId: string | undefined;
        try {
          const cliente = await tx.cliente.upsert({
            where: { telefono },
            update: { nombre, email: emailVal ?? null },
            create: { nombre, telefono, email: emailVal ?? null },
          });
          clienteId = cliente.id;
        } catch {
          // La tabla Cliente puede no existir en deploys sin migración — la cita se crea igualmente
        }

        return tx.cita.create({
          data: {
            servicioId,
            fecha: startOfDay(fechaDate),
            hora,
            nombre,
            telefono,
            email: emailVal ?? null,
            ...(clienteId ? { clienteId } : {}),
            estado: "CONFIRMADA",
          },
        });
      });
    } catch (e: unknown) {
      // P2002 = doble reserva simultánea en la misma hora exacta (constraint unique)
      if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
        return NextResponse.json(
          { error: "Esta hora acaba de ser reservada por otro cliente. Por favor elige otro horario." },
          { status: 409 }
        );
      }
      throw e;
    }

    // Emails en paralelo — fallan silenciosamente para no bloquear la respuesta
    await Promise.allSettled([
      emailVal
        ? enviarConfirmacion({ nombre, email: emailVal, servicio: servicio.nombre, fecha: fechaDate, hora, citaId: cita.id })
        : Promise.resolve(),
      notificarBarber({ nombre, email: emailVal ?? "", telefono, servicio: servicio.nombre, fecha: fechaDate, hora, citaId: cita.id }),
    ]);

    return NextResponse.json(cita, { status: 201 });
  } catch (e: unknown) {
    logger.error("POST /api/citas falló", e, { route: "POST /api/citas" });
    return NextResponse.json({ error: "Error interno del servidor. Inténtalo de nuevo." }, { status: 500 });
  }
}
