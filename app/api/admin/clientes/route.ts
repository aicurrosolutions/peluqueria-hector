import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { differenceInDays, subDays } from "date-fns";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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

  const hoy = new Date();

  const data = clientes.map((c) => {
    const visitas = c.citas;
    const totalVisitas = visitas.length;
    const ultimaVisita = visitas[0]?.fecha ?? null;
    const diasDesdeUltima = ultimaVisita ? differenceInDays(hoy, ultimaVisita) : null;

    // Frecuencia media en días (promedio entre visitas consecutivas)
    let frecuenciaMedia: number | null = null;
    if (visitas.length >= 2) {
      const intervalos: number[] = [];
      for (let i = 0; i < visitas.length - 1; i++) {
        intervalos.push(differenceInDays(visitas[i].fecha, visitas[i + 1].fecha));
      }
      frecuenciaMedia = Math.round(intervalos.reduce((a, b) => a + b, 0) / intervalos.length);
    }

    // Categoría de recurrencia
    type Categoria = "nuevo" | "frecuente" | "regular" | "en_riesgo" | "inactivo";
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

    const servicioFavorito = (() => {
      const conteo: Record<string, number> = {};
      for (const v of visitas) {
        const n = v.servicio.nombre;
        conteo[n] = (conteo[n] ?? 0) + 1;
      }
      const entries = Object.entries(conteo);
      if (!entries.length) return null;
      return entries.sort((a, b) => b[1] - a[1])[0][0];
    })();

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

  return NextResponse.json(data);
}
