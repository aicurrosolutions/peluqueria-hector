import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarSlots, timeToMinutes, HORARIO_DEFAULT } from "@/lib/horarios";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import { z } from "zod";

const DisponibilidadSchema = z.object({
  fecha:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe ser YYYY-MM-DD"),
  duracion: z.coerce.number().int().min(5).max(480).default(30),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = DisponibilidadSchema.safeParse({
    fecha:    searchParams.get("fecha"),
    duracion: searchParams.get("duracion"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Parámetros inválidos" },
      { status: 400 }
    );
  }

  const { fecha: fechaStr, duracion } = parsed.data;
  const fecha      = parseISO(fechaStr);
  const fechaInicio = startOfDay(fecha);
  const diaSemana  = fecha.getDay();

  // Un solo round trip — todas las queries en paralelo
  const [diaAbierto, diaCerrado, ausencia, franjasDB, citasDelDia] = await Promise.all([
    prisma.diaAbierto.findUnique({ where: { fecha: fechaInicio }, select: { id: true } }),
    prisma.diaCerrado.findUnique({ where: { fecha: fechaInicio }, select: { id: true } }),
    prisma.ausencia.findFirst({
      where: { inicio: { lte: fechaInicio }, fin: { gte: fechaInicio } },
      select: { id: true },
    }),
    prisma.horarioFranja.findMany({
      where: { diaSemana, activo: true },
      orderBy: { inicio: "asc" },
      select: { inicio: true, fin: true },
    }),
    prisma.cita.findMany({
      where: {
        fecha:  { gte: fechaInicio, lte: endOfDay(fecha) },
        estado: { not: "CANCELADA" },
      },
      select: { hora: true, servicio: { select: { duracion: true } } },
    }),
  ]);

  if (diaCerrado || ausencia) return NextResponse.json({ slots: [] });

  let franjas = franjasDB;

  if (!franjas.length && diaAbierto) {
    franjas = (HORARIO_DEFAULT[diaSemana] ?? []).map((f) => ({ inicio: f.inicio, fin: f.fin }));
  }

  if (!franjas.length) return NextResponse.json({ slots: [] });

  const todosSlots = generarSlots(duracion, franjas);

  const disponibles = todosSlots.filter((slotHora) => {
    const slotInicio = timeToMinutes(slotHora);
    const slotFin    = slotInicio + duracion;
    return !citasDelDia.some((cita) => {
      const citaInicio = timeToMinutes(cita.hora);
      const citaFin    = citaInicio + cita.servicio.duracion;
      return citaInicio < slotFin && citaFin > slotInicio;
    });
  });

  return NextResponse.json({ slots: disponibles });
}
