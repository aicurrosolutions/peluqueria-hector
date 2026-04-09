import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarSlots, esDiaCerrado, HORARIO_SEMANAL } from "@/lib/horarios";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fechaStr = searchParams.get("fecha");
  const duracion = Number(searchParams.get("duracion") ?? 30);

  if (!fechaStr) {
    return NextResponse.json({ error: "Falta fecha" }, { status: 400 });
  }

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

  // Obtener citas ya reservadas ese día
  const citasDelDia = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(fecha), lte: endOfDay(fecha) },
      estado: { not: "CANCELADA" },
    },
    select: { hora: true },
  });

  const horasOcupadas = new Set(citasDelDia.map((c) => c.hora));

  // Para días abiertos por el admin sin horario propio (ej: domingo), usar horario de sábado
  const diaParaHorario = HORARIO_SEMANAL[diaSemana] ? diaSemana : 6;
  const todosSlots = generarSlots(duracion, diaParaHorario);
  const disponibles = todosSlots.filter((s) => !horasOcupadas.has(s));

  return NextResponse.json({ slots: disponibles });
}
