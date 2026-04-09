import { prisma } from "@/lib/prisma";
import ServiciosCliente from "./ServiciosCliente";

export const revalidate = 0;

export default async function ServiciosPage() {
  const servicios = await prisma.servicio.findMany({
    orderBy: { precio: "asc" },
  });

  return (
    <div className="px-4 md:px-10 py-6 md:py-10 space-y-6 max-w-5xl mx-auto">
      <div>
        <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">Gestión</span>
        <h1 className="text-2xl md:text-4xl font-headline font-bold text-on-surface uppercase tracking-tighter">Servicios</h1>
      </div>
      <ServiciosCliente serviciosIniciales={servicios} />
    </div>
  );
}
