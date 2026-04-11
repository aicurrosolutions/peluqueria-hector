"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";
import VistaSemanal from "./VistaSemanal";
import AgendaDiaria from "../components/AgendaDiaria";
import NuevaCitaForm from "../citas/NuevaCitaForm";

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface CitaDia {
  id: string;
  hora: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  estado: string;
  notas?: string | null;
  servicio: { id: string; nombre: string; precio: number; duracion: number };
}

interface CitaSemana {
  id: string;
  hora: string;
  nombre: string;
  estado: string;
  fecha: string;
  servicio: { nombre: string; precio: number };
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
}

interface Props {
  fechaInicialISO: string;
  citasDiaIniciales: CitaDia[];
  citasSemanaIniciales: CitaSemana[];
  inicioSemanaISO: string;
  servicios: Servicio[];
  abrirNueva?: boolean;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function AgendaHub({
  fechaInicialISO,
  citasDiaIniciales,
  citasSemanaIniciales,
  inicioSemanaISO,
  servicios,
  abrirNueva,
}: Props) {
  const [fechaSel, setFechaSel] = useState(() => parseISO(fechaInicialISO));
  const [citasDia, setCitasDia] = useState<CitaDia[]>(citasDiaIniciales);
  const [cargando, setCargando] = useState(false);
  // null = cerrado | { fecha, hora } = abierto (hora vacía si se abre desde botón)
  const [nuevaCita, setNuevaCita] = useState<{ fecha: string; hora: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Sincroniza fechaSel cuando el servidor responde con una nueva fecha (ej: navegación vía sidebar)
  useEffect(() => {
    setFechaSel(parseISO(fechaInicialISO));
  }, [fechaInicialISO]);

  // Abre automáticamente el form cuando el link del sidebar incluye ?nueva=1
  useEffect(() => {
    if (abrirNueva) {
      const fechaHoy = format(parseISO(fechaInicialISO), "yyyy-MM-dd");
      setNuevaCita({ fecha: fechaHoy, hora: "" });
    }
  }, [abrirNueva, fechaInicialISO]);

  // Scroll suave al formulario cuando se abre
  useEffect(() => {
    if (nuevaCita) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [nuevaCita]);

  // ── Fetch del día ───────────────────────────────────────────────────────────
  const cargarDia = useCallback(async (d: Date) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/citas?fecha=${format(d, "yyyy-MM-dd")}`);
      if (res.ok) setCitasDia(await res.json());
    } catch {
      /* silencioso */
    } finally {
      setCargando(false);
    }
  }, []);

  // ── Seleccionar día (desde VistaSemanal o ◀▶ de AgendaDiaria) ─────────────
  const seleccionarDia = useCallback(
    (d: Date) => {
      setFechaSel(d);
      setNuevaCita(null);
      cargarDia(d);
    },
    [cargarDia]
  );

  // ── Abrir formulario (desde slot vacío o botón "+ Nueva") ─────────────────
  const abrirNuevaCita = useCallback(
    (hora = "") => {
      setNuevaCita({ fecha: format(fechaSel, "yyyy-MM-dd"), hora });
    },
    [fechaSel]
  );

  // ── Recargar citas tras modificación en PanelDetalle ──────────────────────
  const onCitasActualizadas = useCallback(() => {
    cargarDia(fechaSel);
  }, [fechaSel, cargarDia]);

  // ── Stats del día (calculadas en cliente) ──────────────────────────────────
  const citasActivas = citasDia.filter((c) => c.estado !== "CANCELADA");
  const ingresos = citasActivas.reduce((acc, c) => acc + c.servicio.precio, 0);
  const canceladas = citasDia.filter((c) => c.estado === "CANCELADA").length;
  const esHoy = format(fechaSel, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-surface px-4 md:px-10 py-5 md:py-8 border-b border-outline/15">
        <div className="flex justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">
              {esHoy ? "Hoy" : format(fechaSel, "EEEE", { locale: es })}
            </span>
            <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase capitalize">
              {format(fechaSel, "d 'de' MMMM", { locale: es })}
            </h2>
          </div>
          <button
            onClick={() => abrirNuevaCita()}
            className="shrink-0 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest px-4 py-2.5 hover:bg-primary-dim transition-all"
          >
            + Nueva cita
          </button>
        </div>

        {/* Stats — se atenúan mientras carga */}
        <div className={`grid grid-cols-3 gap-px bg-surface-container-high mt-5 transition-opacity ${cargando ? "opacity-40" : ""}`}>
          <StatTile label="Ingresos est." value={`${ingresos.toFixed(0)}€`} color="text-primary" />
          <StatTile label="Citas" value={citasActivas.length.toString().padStart(2, "0")} color="text-on-surface" />
          <StatTile label="Canceladas" value={canceladas.toString().padStart(2, "0")} color="text-error" />
        </div>
      </header>

      {/* ── Contenido ─────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-10 pb-12 space-y-8 md:space-y-10 mt-6 flex-1">
        {/* Vista semanal — recibe callback, no usa Link */}
        <VistaSemanal
          citasSemana={citasSemanaIniciales}
          inicioSemanaISO={inicioSemanaISO}
          fechaActivaISO={fechaSel.toISOString()}
          onDiaClick={seleccionarDia}
        />

        {/* Panel nueva cita */}
        {nuevaCita && (
          <div ref={formRef} className="bg-surface-container-low border border-outline/10 p-5 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-headline text-lg font-bold text-on-surface uppercase tracking-tight">
                  Nueva cita
                </h2>
                {nuevaCita.hora && (
                  <p className="text-[10px] text-primary font-label uppercase tracking-widest mt-0.5">
                    {format(fechaSel, "EEEE d MMM", { locale: es })} · {nuevaCita.hora}
                  </p>
                )}
              </div>
              <button
                onClick={() => setNuevaCita(null)}
                className="p-1.5 text-outline hover:text-on-surface transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <NuevaCitaForm
              servicios={servicios}
              fechaDefault={nuevaCita.fecha}
              horaDefault={nuevaCita.hora}
              onCreada={() => {
                setNuevaCita(null);
                cargarDia(fechaSel);
              }}
            />
          </div>
        )}

        {/* Timeline */}
        <section
          className="bg-surface-container-lowest border border-outline/10 overflow-hidden"
          style={{ minHeight: "480px" }}
        >
          <AgendaDiaria
            citasIniciales={citasDia}
            fechaISO={fechaSel.toISOString()}
            servicios={servicios}
            onSlotLibreClick={abrirNuevaCita}
            onFechaChange={seleccionarDia}
            onCitasActualizadas={onCitasActualizadas}
          />
        </section>

      </div>
    </div>
  );
}

// ── StatTile ──────────────────────────────────────────────────────────────────

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface-container-low px-3 py-3 md:px-6 md:py-4">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-1">{label}</p>
      <p className={`text-xl md:text-3xl font-headline font-bold ${color}`}>{value}</p>
    </div>
  );
}
