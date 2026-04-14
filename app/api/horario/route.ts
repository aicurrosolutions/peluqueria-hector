import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, eachDayOfInterval } from "date-fns";

// Endpoint público — devuelve lo necesario para que el calendario del cliente
// sepa qué días están abiertos/cerrados sin exponer datos sensibles
export async function GET() {
  const hoy = startOfDay(new Date());

  const [franjas, diasAbiertos, diasCerrados, ausencias] = await Promise.all([
    prisma.horarioFranja.findMany({
      where: { activo: true },
      select: { diaSemana: true },
    }),
    prisma.diaAbierto.findMany({
      where: { fecha: { gte: hoy } },
      select: { fecha: true },
    }),
    prisma.diaCerrado.findMany({
      where: { fecha: { gte: hoy } },
      select: { fecha: true },
    }),
    prisma.ausencia.findMany({
      where: { fin: { gte: hoy } },
      select: { inicio: true, fin: true },
    }),
  ]);

  const diasSemanaAbiertos = [...new Set(franjas.map((f) => f.diaSemana))];

  // Expandir rangos de ausencia a días individuales para el calendario del cliente
  const diasAusencia = ausencias.flatMap((a) =>
    eachDayOfInterval({ start: a.inicio, end: a.fin }).map((d) => format(d, "yyyy-MM-dd"))
  );

  return NextResponse.json({
    diasSemanaAbiertos,
    diasEspecialesAbiertos: diasAbiertos.map((d) => format(d.fecha, "yyyy-MM-dd")),
    diasEspecialesCerrados: [
      ...diasCerrados.map((d) => format(d.fecha, "yyyy-MM-dd")),
      ...diasAusencia,
    ],
  });
}
