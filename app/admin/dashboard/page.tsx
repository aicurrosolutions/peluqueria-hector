import { prisma } from "@/lib/prisma";
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import AgendaHub from "./AgendaHub";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ fecha?: string; nueva?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const fechaStr = params.fecha ?? format(new Date(), "yyyy-MM-dd");
  const abrirNueva = params.nueva === "1";
  const fecha = parseISO(fechaStr);

  // Citas del día seleccionado
  const citasDelDia = await prisma.cita.findMany({
    where: { fecha: { gte: startOfDay(fecha), lte: endOfDay(fecha) } },
    include: { servicio: true },
    orderBy: { hora: "asc" },
  });

  // Citas de la semana (para VistaSemanal SSR)
  const luneSemana = startOfWeek(fecha, { weekStartsOn: 1 });
  const domSemana = endOfWeek(fecha, { weekStartsOn: 1 });
  const citasSemana = await prisma.cita.findMany({
    where: { fecha: { gte: startOfDay(luneSemana), lte: endOfDay(domSemana) } },
    include: { servicio: true },
    orderBy: { hora: "asc" },
  });

  // Servicios activos para NuevaCitaForm y PanelDetalle
  const servicios = await prisma.servicio.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });

  // Serializar
  const citasDiaSerial = citasDelDia.map((c) => ({
    id: c.id,
    hora: c.hora,
    nombre: c.nombre,
    telefono: c.telefono,
    email: c.email,
    estado: c.estado,
    notas: c.notas,
    servicio: { id: c.servicio.id, nombre: c.servicio.nombre, precio: c.servicio.precio, duracion: c.servicio.duracion },
  }));

  const citasSemanaSerial = citasSemana.map((c) => ({
    id: c.id,
    hora: c.hora,
    nombre: c.nombre,
    estado: c.estado,
    fecha: c.fecha.toISOString(),
    servicio: { nombre: c.servicio.nombre, precio: c.servicio.precio },
  }));

  const serviciosSerial = servicios.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    precio: s.precio,
    duracion: s.duracion,
  }));

  return (
    <AgendaHub
      fechaInicialISO={fecha.toISOString()}
      citasDiaIniciales={citasDiaSerial}
      citasSemanaIniciales={citasSemanaSerial}
      inicioSemanaISO={luneSemana.toISOString()}
      servicios={serviciosSerial}
      abrirNueva={abrirNueva}
    />
  );
}
