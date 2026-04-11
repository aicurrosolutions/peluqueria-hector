import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarSlots, esDiaCerrado, HORARIO_SEMANAL } from "@/lib/horarios";
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

  // Verificar si el admin ha abierto este día expresamente (ej: finde especial)
  const diaAbierto = await prisma.diaAbierto.findUnique({
    where: { fecha: startOfDay(fecha) },
  });

  // Si el día es cerrado por defecto Y no está abierto por el admin → sin slots
  if (esDiaCerrado(diaSemana) && !diaAbierto) {
    return NextResponse.json({ slots: [] });
  }

  // Verificar si está marcado como día cerrado por el admin
  const diaCerrado = await prisma.diaCerrado.findUnique({
    where: { fecha: startOfDay(fecha) },
  });
  if (diaCerrado) return NextResponse.json({ slots: [] });

  // Obtener citas con duración del servicio para comprobar solapamientos reales
  const citasDelDia = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(fecha), lte: endOfDay(fecha) },
      estado: { not: "CANCELADA" },
    },
    select: { hora: true, servicio: { select: { duracion: true } } },
  });

  // Para días abiertos por el admin sin horario propio (ej: domingo), usar horario de sábado
  const diaParaHorario = HORARIO_SEMANAL[diaSemana] ? diaSemana : 6;
  const todosSlots = generarSlots(duracion, diaParaHorario);

  // Filtrar slots que se solapan con alguna cita existente
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
