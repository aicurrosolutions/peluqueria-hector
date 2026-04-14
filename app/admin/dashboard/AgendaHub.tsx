"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, subDays } from "date-fns";
import { createPortal } from "react-dom";
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

// ── Modal ─────────────────────────────────────────────────────────────────────

function ModalNuevaCita({
  fecha,
  hora,
  fechaSel,
  servicios,
  onCreada,
  onClose,
}: {
  fecha: string;
  hora: string;
  fechaSel: Date;
  servicios: Servicio[];
  onCreada: () => void;
  onClose: () => void;
}) {
  // Cierre con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloquea el scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-surface border border-outline/20 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline/10 shrink-0">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface uppercase tracking-tight">
              Nueva cita
            </h2>
            {hora && (
              <p className="text-[10px] text-primary font-label uppercase tracking-widest mt-0.5">
                {format(fechaSel, "EEEE d MMM", { locale: es })} · {hora}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto px-6 py-6">
          <NuevaCitaForm
            servicios={servicios}
            fechaDefault={fecha}
            horaDefault={hora}
            onCreada={onCreada}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

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
  const [nuevaCita, setNuevaCita] = useState<{ fecha: string; hora: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setFechaSel(parseISO(fechaInicialISO));
  }, [fechaInicialISO]);

  useEffect(() => {
    if (abrirNueva) {
      setNuevaCita({ fecha: format(parseISO(fechaInicialISO), "yyyy-MM-dd"), hora: "" });
    }
  }, [abrirNueva, fechaInicialISO]);

  // ── Fetch del día ───────────────────────────────────────────────────────────
  const cargarDia = useCallback(async (d: Date) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/citas?fecha=${format(d, "yyyy-MM-dd")}`);
      if (res.ok) setCitasDia(await res.json());
    } catch { /* silencioso */ }
    finally { setCargando(false); }
  }, []);

  const seleccionarDia = useCallback((d: Date) => {
    setFechaSel(d);
    setNuevaCita(null);
    cargarDia(d);
  }, [cargarDia]);

  const abrirNuevaCita = useCallback((hora = "") => {
    setNuevaCita({ fecha: format(fechaSel, "yyyy-MM-dd"), hora });
  }, [fechaSel]);

  const onCitasActualizadas = useCallback(() => {
    cargarDia(fechaSel);
  }, [fechaSel, cargarDia]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const citasActivas = citasDia.filter((c) => c.estado !== "CANCELADA");
  const ingresos     = citasActivas.reduce((acc, c) => acc + c.servicio.precio, 0);
  const canceladas   = citasDia.filter((c) => c.estado === "CANCELADA").length;
  const pendientes   = citasDia.filter((c) => c.estado === "PENDIENTE" || c.estado === "CONFIRMADA").length;
  const esHoy        = format(fechaSel, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const proximaCita = (() => {
    const activas = citasDia
      .filter((c) => c.estado === "PENDIENTE" || c.estado === "CONFIRMADA")
      .sort((a, b) => a.hora.localeCompare(b.hora));
    if (!activas.length) return null;
    if (!esHoy) return activas[0];
    const ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();
    return activas.find((c) => {
      const [h, m] = c.hora.split(":").map(Number);
      return h * 60 + m >= ahoraMin;
    }) ?? null;
  })();

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-surface px-4 md:px-10 py-5 md:py-8 border-b border-outline/15">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => seleccionarDia(subDays(fechaSel, 1))}
              className="p-2 text-outline hover:text-on-surface border border-outline/20 hover:border-outline/40 transition-all shrink-0"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="min-w-0">
              <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-0.5 block font-label">
                {esHoy ? "Hoy" : format(fechaSel, "EEEE", { locale: es })}
              </span>
              <h2 className="text-xl md:text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase capitalize truncate">
                {format(fechaSel, "d 'de' MMMM", { locale: es })}
              </h2>
            </div>
            <button
              onClick={() => seleccionarDia(addDays(fechaSel, 1))}
              className="p-2 text-outline hover:text-on-surface border border-outline/20 hover:border-outline/40 transition-all shrink-0"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={() => abrirNuevaCita()}
            className="shrink-0 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest px-4 py-2.5 hover:bg-primary-dim transition-all"
          >
            + Nueva cita
          </button>
        </div>

        <div className={`grid grid-cols-4 gap-px bg-surface-container-high mt-5 transition-opacity ${cargando ? "opacity-40" : ""}`}>
          <StatTile label="Ingresos est." value={`${ingresos.toFixed(0)}€`}                        color="text-primary" />
          <StatTile label="Citas"         value={citasActivas.length.toString().padStart(2, "0")}  color="text-on-surface" />
          <StatTile label="Pendientes"    value={pendientes.toString().padStart(2, "0")}            color="text-warning" />
          <StatTile label="Canceladas"    value={canceladas.toString().padStart(2, "0")}            color="text-error" />
        </div>

        {esHoy && proximaCita && (
          <div className={`mt-3 flex items-center gap-3 bg-primary/8 border border-primary/20 px-4 py-2.5 transition-opacity ${cargando ? "opacity-40" : ""}`}>
            <div className="shrink-0">
              <p className="text-[9px] font-label uppercase tracking-widest text-primary/70 leading-none mb-0.5">Próxima</p>
              <p className="text-base font-headline font-black text-primary leading-none">{proximaCita.hora}</p>
            </div>
            <div className="w-px h-8 bg-primary/20 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{proximaCita.nombre}</p>
              <p className="text-[11px] text-on-surface-variant truncate">{proximaCita.servicio.nombre}</p>
            </div>
          </div>
        )}
        {esHoy && !proximaCita && citasActivas.length > 0 && !cargando && (
          <div className="mt-3 px-4 py-2 text-[11px] text-on-surface-variant font-label uppercase tracking-widest">
            No quedan más citas para hoy
          </div>
        )}
      </header>

      {/* ── Contenido ─────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-10 pb-12 space-y-8 md:space-y-10 mt-6 flex-1">
        <VistaSemanal
          citasSemana={citasSemanaIniciales}
          inicioSemanaISO={inicioSemanaISO}
          fechaActivaISO={fechaSel.toISOString()}
          onDiaClick={seleccionarDia}
        />

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

      {/* ── Modal nueva cita ──────────────────────────────────────────────── */}
      {mounted && nuevaCita && (
        <ModalNuevaCita
          fecha={nuevaCita.fecha}
          hora={nuevaCita.hora}
          fechaSel={fechaSel}
          servicios={servicios}
          onClose={() => setNuevaCita(null)}
          onCreada={() => {
            setNuevaCita(null);
            cargarDia(fechaSel);
          }}
        />
      )}
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
