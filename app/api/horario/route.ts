import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, startOfDay } from "date-fns";

// Endpoint público — devuelve lo necesario para que el calendario del cliente
// sepa qué días están abiertos/cerrados sin exponer datos sensibles
export async function GET() {
  const [franjas, diasAbiertos, diasCerrados] = await Promise.all([
    prisma.horarioFranja.findMany({
      where: { activo: true },
      select: { diaSemana: true },
    }),
    prisma.diaAbierto.findMany({
      where: { fecha: { gte: startOfDay(new Date()) } },
      select: { fecha: true },
    }),
    prisma.diaCerrado.findMany({
      where: { fecha: { gte: startOfDay(new Date()) } },
      select: { fecha: true },
    }),
  ]);

  const diasSemanaAbiertos = [...new Set(franjas.map((f) => f.diaSemana))];

  return NextResponse.json({
    diasSemanaAbiertos,
    diasEspecialesAbiertos: diasAbiertos.map((d) => format(d.fecha, "yyyy-MM-dd")),
    diasEspecialesCerrados: diasCerrados.map((d) => format(d.fecha, "yyyy-MM-dd")),
  });
}
