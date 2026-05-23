// ── Clientes ──────────────────────────────────────────────────────────────────

export type Categoria = "nuevo" | "frecuente" | "regular" | "en_riesgo" | "inactivo";

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

// ── Agenda ────────────────────────────────────────────────────────────────────

export interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
}

export interface Cita {
  id: string;
  hora: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  estado: string;
  notas?: string | null;
  servicio: Servicio;
}
