import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HORARIO_DEFAULT } from "@/lib/horarios";
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

  // Si HorarioFranja aún no fue configurado (BD vacía), usar el horario por defecto
  // para que el calendario público no deshabilite todos los días
  const diasSemanaAbiertos = franjas.length > 0
    ? [...new Set(franjas.map((f) => f.diaSemana))]
    : Object.entries(HORARIO_DEFAULT)
        .filter(([, franjasDia]) => franjasDia.length > 0)
        .map(([dia]) => parseInt(dia));

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
