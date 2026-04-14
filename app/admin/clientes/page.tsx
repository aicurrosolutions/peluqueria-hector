import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { differenceInDays } from "date-fns";
import ClientesView from "./ClientesView";

export const revalidate = 0;

type Categoria = "nuevo" | "frecuente" | "regular" | "en_riesgo" | "inactivo";

export interface ClienteConStats {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  totalVisitas: number;
  ultimaVisita: string | null;
  diasDesdeUltima: number | null;
  frecuenciaMedia: number | null;
  categoria: Categoria;
  servicioFavorito: string | null;
  gastoTotal: number;
}

export default async function ClientesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const hoy = new Date();

  const clientes = await prisma.cliente.findMany({
    include: {
      citas: {
        where: { estado: { in: ["CONFIRMADA", "COMPLETADA"] } },
        orderBy: { fecha: "desc" },
        select: { fecha: true, servicio: { select: { nombre: true, precio: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  });

  const data: ClienteConStats[] = clientes.map((c) => {
    const visitas = c.citas;
    const totalVisitas = visitas.length;
    const ultimaVisita = visitas[0]?.fecha ?? null;
    const diasDesdeUltima = ultimaVisita ? differenceInDays(hoy, ultimaVisita) : null;

    let frecuenciaMedia: number | null = null;
    if (visitas.length >= 2) {
      const intervalos: number[] = [];
      for (let i = 0; i < visitas.length - 1; i++) {
        intervalos.push(differenceInDays(visitas[i].fecha, visitas[i + 1].fecha));
      }
      frecuenciaMedia = Math.round(intervalos.reduce((a, b) => a + b, 0) / intervalos.length);
    }

    let categoria: Categoria;
    if (totalVisitas === 0) {
      categoria = "inactivo";
    } else if (totalVisitas === 1) {
      categoria = diasDesdeUltima !== null && diasDesdeUltima <= 30 ? "nuevo" : "inactivo";
    } else if (diasDesdeUltima !== null && diasDesdeUltima <= 45) {
      categoria = frecuenciaMedia !== null && frecuenciaMedia <= 35 ? "frecuente" : "regular";
    } else if (diasDesdeUltima !== null && diasDesdeUltima <= 90) {
      categoria = "en_riesgo";
    } else {
      categoria = "inactivo";
    }

    const conteo: Record<string, number> = {};
    for (const v of visitas) {
      conteo[v.servicio.nombre] = (conteo[v.servicio.nombre] ?? 0) + 1;
    }
    const servicioFavorito = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const gastoTotal = visitas.reduce((sum, v) => sum + v.servicio.precio, 0);

    return {
      id: c.id,
      nombre: c.nombre,
      telefono: c.telefono,
      email: c.email,
      totalVisitas,
      ultimaVisita: ultimaVisita?.toISOString() ?? null,
      diasDesdeUltima,
      frecuenciaMedia,
      categoria,
      servicioFavorito,
      gastoTotal,
    };
  });

  return <ClientesView clientes={data} />;
}
