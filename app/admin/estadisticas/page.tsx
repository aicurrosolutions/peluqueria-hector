import { prisma } from "@/lib/prisma";
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfDay, endOfDay,
  subWeeks, format,
} from "date-fns";
import { es } from "date-fns/locale";
import EstadisticasView from "./EstadisticasView";

export const revalidate = 0;

export default async function EstadisticasPage() {
  const now = new Date();

  const semanaInicio = startOfDay(startOfWeek(now, { weekStartsOn: 1 }));
  const semanaFin    = endOfDay(endOfWeek(now, { weekStartsOn: 1 }));
  const mesInicio    = startOfDay(startOfMonth(now));
  const mesFin       = endOfDay(endOfMonth(now));

  // Origen del histórico: 8 semanas atrás
  const historicInicio = startOfDay(startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 }));

  const [citasSemana, citasMes, clientesSemana, clientesMes, todasCitasHistorico, diasCerrados, diasAbiertos, franjasHorario, ausencias] = await Promise.all([
    prisma.cita.findMany({
      where: { fecha: { gte: semanaInicio, lte: semanaFin } },
      select: { estado: true, servicio: { select: { precio: true } } },
    }),
    prisma.cita.findMany({
      where: { fecha: { gte: mesInicio, lte: mesFin } },
      select: { estado: true, servicio: { select: { precio: true } } },
    }),
    prisma.cliente.count({ where: { createdAt: { gte: semanaInicio, lte: semanaFin } } }),
    prisma.cliente.count({ where: { createdAt: { gte: mesInicio, lte: mesFin } } }),
    // Histórico para las gráficas
    prisma.cita.findMany({
      where: { fecha: { gte: historicInicio }, estado: { not: "CANCELADA" } },
      select: { fecha: true, servicio: { select: { precio: true } } },
    }),
    prisma.diaCerrado.findMany({ orderBy: { fecha: "asc" } }),
    prisma.diaAbierto.findMany({ orderBy: { fecha: "asc" } }),
    prisma.horarioFranja.findMany({ where: { activo: true }, select: { diaSemana: true } }),
    prisma.ausencia.findMany({ orderBy: { inicio: "asc" } }),
  ]);

  const calcular = (
    citas: { estado: string; servicio: { precio: number } }[],
    clientesNuevos: number
  ) => ({
    totalCitas: citas.length,
    ingresos: citas.filter((c) => c.estado !== "CANCELADA").reduce((s, c) => s + c.servicio.precio, 0),
    canceladas: citas.filter((c) => c.estado === "CANCELADA").length,
    completadas: citas.filter((c) => c.estado === "COMPLETADA").length,
    clientesNuevos,
  });

  // Agrupar histórico por semana
  const semanas: Record<string, { label: string; ingresos: number; citas: number }> = {};
  for (let i = 7; i >= 0; i--) {
    const weekDate = subWeeks(now, i);
    const key = format(startOfWeek(weekDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const label = i === 0
      ? "Esta sem."
      : format(weekDate, "d MMM", { locale: es });
    semanas[key] = { label, ingresos: 0, citas: 0 };
  }

  for (const cita of todasCitasHistorico) {
    const key = format(startOfWeek(cita.fecha, { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (semanas[key]) {
      semanas[key].ingresos += cita.servicio.precio;
      semanas[key].citas += 1;
    }
  }

  return (
    <EstadisticasView
      semanal={calcular(citasSemana, clientesSemana)}
      mensual={calcular(citasMes, clientesMes)}
      historial={Object.values(semanas)}
      diasCerrados={diasCerrados.map((d) => ({ id: d.id, fecha: d.fecha.toISOString(), motivo: d.motivo }))}
      diasAbiertos={diasAbiertos.map((d) => ({ id: d.id, fecha: d.fecha.toISOString(), motivo: d.motivo }))}
      diasSemanaAbiertos={[...new Set(franjasHorario.map((f) => f.diaSemana))]}
      ausencias={ausencias.map((a) => ({ id: a.id, inicio: a.inicio.toISOString(), fin: a.fin.toISOString(), motivo: a.motivo }))}
    />
  );
}
