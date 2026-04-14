import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarSlots, HORARIO_DEFAULT } from "@/lib/horarios";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import { z } from "zod";

const DisponibilidadSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe ser YYYY-MM-DD"),
  duracion: z.coerce.number().int().min(5).max(480).default(30),
});

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const parsed = DisponibilidadSchema.safeParse({
    fecha: searchParams.get("fecha"),
    duracion: searchParams.get("duracion"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Parámetros inválidos" },
      { status: 400 }
    );
  }

  const { fecha: fechaStr, duracion } = parsed.data;
  const fecha = parseISO(fechaStr);
  const diaSemana = fecha.getDay();

  const fechaInicio = startOfDay(fecha);

  // Verificar si el admin ha abierto este día expresamente
  const [diaAbierto, diaCerrado, ausencia] = await Promise.all([
    prisma.diaAbierto.findUnique({ where: { fecha: fechaInicio } }),
    prisma.diaCerrado.findUnique({ where: { fecha: fechaInicio } }),
    prisma.ausencia.findFirst({ where: { inicio: { lte: fechaInicio }, fin: { gte: fechaInicio } } }),
  ]);

  if (diaCerrado || ausencia) return NextResponse.json({ slots: [] });

  // Obtener franjas del horario desde BD
  let franjas = await prisma.horarioFranja.findMany({
    where: { diaSemana, activo: true },
    orderBy: { inicio: "asc" },
    select: { inicio: true, fin: true },
  });

  // Si el día no tiene horario en BD pero el admin lo abrió expresamente,
  // usar el horario por defecto del sábado como fallback
  if (!franjas.length && diaAbierto) {
    const fallback = HORARIO_DEFAULT[6] ?? [];
    franjas = fallback.map((f) => ({ inicio: f.inicio, fin: f.fin }));
  }

  // Si no hay franjas y no está abierto expresamente → cerrado
  if (!franjas.length && !diaAbierto) {
    return NextResponse.json({ slots: [] });
  }

  // Citas del día para filtrar solapamientos
  const citasDelDia = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(fecha), lte: endOfDay(fecha) },
      estado: { not: "CANCELADA" },
    },
    select: { hora: true, servicio: { select: { duracion: true } } },
  });

  const todosSlots = generarSlots(duracion, franjas);

  const disponibles = todosSlots.filter((slotHora) => {
    const slotInicio = timeToMinutes(slotHora);
    const slotFin = slotInicio + duracion;
    return !citasDelDia.some((cita) => {
      const citaInicio = timeToMinutes(cita.hora);
      const citaFin = citaInicio + cita.servicio.duracion;
      return citaInicio < slotFin && citaFin > slotInicio;
    });
  });

  return NextResponse.json({ slots: disponibles });
}
