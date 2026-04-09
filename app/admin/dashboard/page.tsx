import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import CitaCard from "../components/CitaCard";
import VistaSemanal from "./VistaSemanal";

export const revalidate = 0;

export default async function DashboardPage() {
  const hoy = new Date();

  // Citas de hoy
  const citasHoy = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(hoy), lte: endOfDay(hoy) },
      estado: { not: "CANCELADA" },
    },
    include: { servicio: true },
    orderBy: { hora: "asc" },
  });

  const ingresos = citasHoy.reduce((acc, c) => acc + c.servicio.precio, 0);
  const canceladas = await prisma.cita.count({
    where: { fecha: { gte: startOfDay(hoy), lte: endOfDay(hoy) }, estado: "CANCELADA" },
  });

  // Citas de la semana (lunes a domingo)
  const luneSemana = startOfWeek(hoy, { weekStartsOn: 1 });
  const domSemana = endOfWeek(hoy, { weekStartsOn: 1 });
  const citasSemana = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(luneSemana), lte: endOfDay(domSemana) },
    },
    include: { servicio: true },
    orderBy: { hora: "asc" },
  });

  // Serializar para el cliente
  const citasSemanaSerial = citasSemana.map((c) => ({
    id: c.id,
    hora: c.hora,
    nombre: c.nombre,
    estado: c.estado,
    fecha: c.fecha.toISOString(),
    servicio: { nombre: c.servicio.nombre, precio: c.servicio.precio },
  }));

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl px-4 md:px-10 py-6 md:py-10 flex justify-between items-center md:items-end border-b border-outline/5">
        <div>
          <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">Dashboard</span>
          <h2 className="text-2xl md:text-5xl font-headline font-bold tracking-tighter text-on-surface uppercase">
            Agenda de Hoy
          </h2>
        </div>
        <div className="text-right">
          <p className="text-on-surface font-headline font-medium text-xs md:text-base uppercase tracking-tight capitalize">
            {format(hoy, "EEE, d MMM", { locale: es })}
          </p>
          <p className="text-primary text-[10px] uppercase tracking-widest mt-1 font-label">
            {citasHoy.length} {citasHoy.length === 1 ? "cita" : "citas"}
          </p>
        </div>
      </header>

      <div className="px-4 md:px-10 pb-12 space-y-8 md:space-y-12 mt-4 md:mt-8">
        {/* Stats */}
        <section className="grid grid-cols-3 gap-px bg-outline/5">
          <div className="bg-surface-container-low p-4 md:p-8">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-outline mb-2 md:mb-4 font-label">Ingresos</p>
            <p className="text-xl md:text-4xl font-headline font-bold text-primary">{ingresos.toFixed(0)}€</p>
          </div>
          <div className="bg-surface-container-low p-4 md:p-8">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-outline mb-2 md:mb-4 font-label">Citas</p>
            <p className="text-xl md:text-4xl font-headline font-bold text-on-surface">{String(citasHoy.length).padStart(2, "0")}</p>
          </div>
          <div className="bg-surface-container-low p-4 md:p-8">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-outline mb-2 md:mb-4 font-label">Canceladas</p>
            <p className="text-xl md:text-4xl font-headline font-bold text-error">{String(canceladas).padStart(2, "0")}</p>
          </div>
        </section>

        {/* Vista semanal */}
        <VistaSemanal
          citasSemana={citasSemanaSerial}
          inicioSemanaISO={luneSemana.toISOString()}
        />

        {/* Agenda hoy */}
        <section>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-base md:text-xl font-headline font-bold uppercase tracking-tight">Agenda del día</h3>
            <Link
              href="/admin/citas?nueva=1"
              className="px-3 md:px-4 py-2 text-[10px] uppercase tracking-widest border border-outline/30 text-outline hover:border-primary hover:text-primary transition-all font-label"
            >
              + Nueva
            </Link>
          </div>

          {citasHoy.length === 0 ? (
            <div className="bg-surface-container-lowest p-10 md:p-16 text-center">
              <p className="text-outline text-xs uppercase tracking-widest font-label">No hay citas hoy</p>
            </div>
          ) : (
            <div className="space-y-px">
              {citasHoy.map((cita) => <CitaCard key={cita.id} cita={cita} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
