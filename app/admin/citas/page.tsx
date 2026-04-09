import { prisma } from "@/lib/prisma";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import CitaCard from "../components/CitaCard";
import NuevaCitaForm from "./NuevaCitaForm";
import Link from "next/link";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ fecha?: string; nueva?: string }>;
}

export default async function CitasPage({ searchParams }: Props) {
  const params = await searchParams;
  const fechaStr = params.fecha ?? format(new Date(), "yyyy-MM-dd");
  const mostrarFormulario = params.nueva === "1";

  const fecha = parseISO(fechaStr);
  const citas = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(fecha), lte: endOfDay(fecha) },
    },
    include: { servicio: true },
    orderBy: { hora: "asc" },
  });

  const servicios = await prisma.servicio.findMany({ where: { activo: true } });

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 space-y-6 max-w-5xl mx-auto">
      {/* Título */}
      <div>
        <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">Gestión</span>
        <h1 className="text-2xl md:text-4xl font-headline font-bold text-on-surface uppercase tracking-tighter">Citas</h1>
      </div>

      {/* Selector de fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form className="flex items-center gap-2 flex-1">
          <input
            type="date"
            name="fecha"
            defaultValue={fechaStr}
            className="flex-1 bg-surface-container border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="bg-primary text-on-primary text-xs tracking-widest uppercase px-4 py-2.5 font-headline font-bold hover:bg-primary-dim transition-all"
          >
            Ver
          </button>
        </form>
        <span className="text-outline text-xs capitalize font-body">
          {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
        </span>
      </div>

      {/* Formulario nueva cita */}
      {mostrarFormulario && (
        <div className="bg-surface-container-low border border-outline/10 p-5 md:p-8">
          <h2 className="font-headline text-xl font-bold text-on-surface uppercase tracking-tight mb-6">Nueva cita</h2>
          <NuevaCitaForm servicios={servicios} fechaDefault={fechaStr} />
        </div>
      )}

      {/* Lista de citas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-base md:text-xl font-bold text-on-surface uppercase tracking-tight">
            {citas.length} {citas.length === 1 ? "cita" : "citas"}
          </h2>
          <Link
            href="?nueva=1"
            className="text-[10px] text-primary tracking-widest uppercase border border-primary/30 px-3 py-1.5 hover:border-primary hover:bg-primary/5 transition-all font-label"
          >
            + Nueva
          </Link>
        </div>
        {citas.length === 0 ? (
          <div className="bg-surface-container-lowest p-10 text-center">
            <p className="text-outline text-xs uppercase tracking-widest font-label">No hay citas para este día</p>
          </div>
        ) : (
          <div className="space-y-px">
            {citas.map((c) => (
              <CitaCard key={c.id} cita={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
