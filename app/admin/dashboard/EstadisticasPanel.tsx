"use client";

import { useState, useEffect, useRef } from "react";

interface Periodo {
  totalCitas: number;
  ingresos: number;
  canceladas: number;
  clientesNuevos: number;
}

interface Estadisticas {
  semanal: Periodo;
  mensual: Periodo;
}

export default function EstadisticasPanel() {
  const [datos, setDatos] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<"semanal" | "mensual">("semanal");
  // Evita doble fetch en React StrictMode (doble ejecución de efectos en desarrollo)
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/estadisticas")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? `Error ${res.status}`);
        }
        return res.json() as Promise<Estadisticas>;
      })
      .then(setDatos)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Error al cargar estadísticas")
      )
      .finally(() => setCargando(false));
  }, []);

  const periodo = datos?.[vista];

  return (
    <section className="bg-surface-container-lowest border border-outline/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-5 border-b border-outline/15">
        <div>
          <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-label font-bold mb-0.5">
            Rendimiento
          </p>
          <h3 className="font-headline text-lg font-bold text-on-surface uppercase tracking-tight">
            Estadísticas
          </h3>
        </div>

        {/* Toggle Semana / Mes */}
        <div className="flex gap-px bg-surface-container-high">
          {(["semanal", "mensual"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`px-4 py-2 font-label text-[10px] uppercase tracking-widest transition-all ${
                vista === v
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {v === "semanal" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className={`transition-opacity ${cargando ? "opacity-40 pointer-events-none" : ""}`}>
        {error ? (
          <p className="m-4 px-4 py-3 text-error text-xs font-body border-l-4 border-error bg-error-container/10">
            {error}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-container-high">
            <StatCard
              label="Citas totales"
              value={periodo ? String(periodo.totalCitas).padStart(2, "0") : "—"}
              color="text-on-surface"
            />
            <StatCard
              label="Ingresos est."
              value={periodo ? `${periodo.ingresos.toFixed(0)}€` : "—"}
              color="text-primary"
            />
            <StatCard
              label="Canceladas"
              value={periodo ? String(periodo.canceladas).padStart(2, "0") : "—"}
              color="text-error"
            />
            <StatCard
              label="Clientes nuevos"
              value={periodo ? String(periodo.clientesNuevos).padStart(2, "0") : "—"}
              color="text-on-surface"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface-container-low px-4 md:px-6 py-5">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-2">
        {label}
      </p>
      <p className={`text-2xl md:text-4xl font-headline font-bold ${color}`}>{value}</p>
    </div>
  );
}
