import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const now = new Date();

    const semanaInicio = startOfDay(startOfWeek(now, { weekStartsOn: 1 }));
    const semanaFin = endOfDay(endOfWeek(now, { weekStartsOn: 1 }));
    const mesInicio = startOfDay(startOfMonth(now));
    const mesFin = endOfDay(endOfMonth(now));

    const [citasSemana, citasMes, clientesSemana, clientesMes] =
      await Promise.all([
        prisma.cita.findMany({
          where: { fecha: { gte: semanaInicio, lte: semanaFin } },
          select: { estado: true, servicio: { select: { precio: true } } },
        }),
        prisma.cita.findMany({
          where: { fecha: { gte: mesInicio, lte: mesFin } },
          select: { estado: true, servicio: { select: { precio: true } } },
        }),
        prisma.cliente.count({
          where: { createdAt: { gte: semanaInicio, lte: semanaFin } },
        }),
        prisma.cliente.count({
          where: { createdAt: { gte: mesInicio, lte: mesFin } },
        }),
      ]);

    const calcular = (
      citas: { estado: string; servicio: { precio: number } }[],
      clientesNuevos: number
    ) => ({
      totalCitas: citas.length,
      ingresos: citas
        .filter((c) => c.estado !== "CANCELADA")
        .reduce((s, c) => s + c.servicio.precio, 0),
      canceladas: citas.filter((c) => c.estado === "CANCELADA").length,
      clientesNuevos,
    });

    return NextResponse.json({
      semanal: calcular(citasSemana, clientesSemana),
      mensual: calcular(citasMes, clientesMes),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
