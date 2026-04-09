import { prisma } from "@/lib/prisma";
import CalendarioCliente from "./CalendarioCliente";

export const revalidate = 0;

export default async function CalendarioPage() {
  const [diasCerrados, diasAbiertos] = await Promise.all([
    prisma.diaCerrado.findMany({ orderBy: { fecha: "asc" } }),
    prisma.diaAbierto.findMany({ orderBy: { fecha: "asc" } }),
  ]);

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 space-y-6 max-w-5xl mx-auto">
      <div>
        <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">Gestión</span>
        <h1 className="text-2xl md:text-4xl font-headline font-bold text-on-surface uppercase tracking-tighter">Calendario</h1>
        <p className="text-outline text-xs mt-2 font-body">
          Los fines de semana están cerrados por defecto. Puedes abrir días concretos o cerrar días entre semana.
        </p>
      </div>
      <CalendarioCliente
        diasCerradosIniciales={diasCerrados.map((d) => ({ id: d.id, fecha: d.fecha.toISOString(), motivo: d.motivo }))}
        diasAbiertosIniciales={diasAbiertos.map((d) => ({ id: d.id, fecha: d.fecha.toISOString(), motivo: d.motivo }))}
      />
    </div>
  );
}
