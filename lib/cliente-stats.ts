import { differenceInDays } from "date-fns";
import type { Categoria, ClienteConStats } from "./types";

interface VisitaInput {
  fecha: Date;
  servicio: { nombre: string; precio: number };
}

interface ClienteInput {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  citas: VisitaInput[];
}

export function calcularStatsCliente(c: ClienteInput, hoy: Date): ClienteConStats {
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
}
