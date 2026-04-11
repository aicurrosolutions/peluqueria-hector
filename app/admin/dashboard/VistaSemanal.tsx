"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Cita {
  id: string;
  hora: string;
  nombre: string;
  estado: string;
  servicio: { nombre: string; precio: number };
  fecha: string;
}

interface Props {
  citasSemana: Cita[];
  inicioSemanaISO: string;
  fechaActivaISO?: string; // día actualmente seleccionado (para resaltar)
  onDiaClick?: (d: Date) => void; // si se provee, usa callback en lugar de Link
}

export default function VistaSemanal({ citasSemana: citasIniciales, inicioSemanaISO, fechaActivaISO, onDiaClick }: Props) {
  const fechaActiva = fechaActivaISO ? parseISO(fechaActivaISO) : new Date();
  const [semanaBase, setSemanaBase] = useState(() => new Date(inicioSemanaISO));
  const [citas, setCitas] = useState<Cita[]>(citasIniciales);
  const [cargando, setCargando] = useState(false);

  const cargarSemana = useCallback(async (inicio: Date) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/semana?inicio=${format(inicio, "yyyy-MM-dd")}`);
      const data = await res.json();
      setCitas(data);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const hoy = startOfWeek(new Date(), { weekStartsOn: 1 });
    // Si es la semana actual usamos datos del SSR, si no fetch
    if (!isSameDay(semanaBase, hoy)) {
      cargarSemana(semanaBase);
    }
  }, [semanaBase, cargarSemana]);

  const dias = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i));

  const citasPorDia = (dia: Date) =>
    citas.filter((c) => isSameDay(new Date(c.fecha), dia) && c.estado !== "CANCELADA");

  const semanaAnterior = () => setSemanaBase((s) => subWeeks(s, 1));
  const semanaSiguiente = () => setSemanaBase((s) => addWeeks(s, 1));
  const irAHoy = () => {
    const lunes = startOfWeek(new Date(), { weekStartsOn: 1 });
    setSemanaBase(lunes);
    setCitas(citasIniciales);
  };

  const esEstaSemana = isSameDay(semanaBase, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-xl font-headline font-bold uppercase tracking-tight">Esta semana</h3>
        <div className="flex items-center gap-2">
          {!esEstaSemana && (
            <button
              onClick={irAHoy}
              className="text-[10px] uppercase tracking-widest text-primary font-label hover:underline px-2"
            >
              Hoy
            </button>
          )}
          <button
            onClick={semanaAnterior}
            className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors border border-outline/25 hover:border-outline/50"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant min-w-[130px] text-center">
            {format(semanaBase, "d MMM", { locale: es })} – {format(addDays(semanaBase, 6), "d MMM yy", { locale: es })}
          </span>
          <button
            onClick={semanaSiguiente}
            className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors border border-outline/25 hover:border-outline/50"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid 7 días */}
      <div className={`grid grid-cols-7 gap-px bg-surface-container-high overflow-hidden transition-opacity ${cargando ? "opacity-50" : ""}`}>
        {dias.map((dia) => {
          const citasDia = citasPorDia(dia);
          const esDiaHoy = isToday(dia);
          const esDiaActivo = isSameDay(dia, fechaActiva);
          const fechaStr = format(dia, "yyyy-MM-dd");
          const esPasado = dia < startOfWeek(new Date(), { weekStartsOn: 1 }) && !esDiaHoy;

          const clasesDia = `group flex flex-col min-h-[72px] md:min-h-[150px] p-1.5 md:p-3 transition-colors text-left ${
            esDiaActivo
              ? "bg-surface-container border-t-2 border-primary"
              : "bg-surface-container-low hover:bg-surface-container border-t-2 border-transparent"
          } ${esPasado ? "opacity-40" : ""}`;

          const contenidoDia = (
            <>
              {/* Cabecera del día */}
              <div className="mb-1 md:mb-2">
                {/* Mobile: letra única (L, M, X, J, V, S, D) */}
                <p className={`text-[8px] uppercase tracking-widest font-label leading-none md:hidden ${esDiaActivo ? "text-primary" : "text-on-surface-variant"}`}>
                  {format(dia, "EEEEE", { locale: es })}
                </p>
                {/* Desktop: abreviatura (lun, mar…) */}
                <p className={`hidden md:block text-[10px] uppercase tracking-widest font-label leading-none ${esDiaActivo ? "text-primary" : "text-on-surface-variant"}`}>
                  {format(dia, "EEE", { locale: es })}
                  {esDiaHoy && !esDiaActivo && <span className="ml-1 text-outline/40">•</span>}
                </p>
                <p className={`text-sm md:text-2xl font-headline font-bold leading-tight ${esDiaActivo ? "text-primary" : "text-on-surface"}`}>
                  {format(dia, "d")}
                </p>
              </div>

              {/* Mobile: dots indicadores */}
              <div className="flex-1 flex flex-col items-center gap-0.5 md:hidden">
                {citasDia.length > 0 && (
                  <>
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {Array.from({ length: Math.min(citasDia.length, 3) }).map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${esDiaActivo ? "bg-primary" : "bg-primary/60"}`} />
                      ))}
                    </div>
                    <span className={`text-[7px] font-label font-bold ${esDiaActivo ? "text-primary" : "text-on-surface-variant"}`}>
                      {citasDia.length}
                    </span>
                  </>
                )}
              </div>

              {/* Desktop: Lista de citas (máx 3) */}
              <div className="hidden md:flex flex-1 flex-col space-y-0.5 overflow-hidden">
                {citasDia.length === 0 ? (
                  <p className="text-[8px] text-outline/20 font-label mt-1">libre</p>
                ) : (
                  citasDia.slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-primary/10 rounded-[1px] px-1 py-px overflow-hidden">
                      <p className="text-[9px] text-primary font-label font-bold uppercase leading-tight truncate">
                        {c.hora} {c.nombre.split(" ")[0]}
                      </p>
                    </div>
                  ))
                )}
                {citasDia.length > 3 && (
                  <p className="text-[9px] text-on-surface-variant font-label pl-1">
                    +{citasDia.length - 3}
                  </p>
                )}
              </div>

              {/* Desktop: total en pie */}
              {citasDia.length > 0 && (
                <p className={`hidden md:block text-[9px] font-label uppercase tracking-wide mt-1 ${esDiaActivo ? "text-primary" : "text-on-surface-variant"}`}>
                  {citasDia.length} {citasDia.length === 1 ? "cita" : "citas"}
                </p>
              )}
            </>
          );

          return onDiaClick ? (
            <button
              key={fechaStr}
              onClick={() => onDiaClick(dia)}
              className={clasesDia}
            >
              {contenidoDia}
            </button>
          ) : (
            <Link
              key={fechaStr}
              href={`/admin/dashboard?fecha=${fechaStr}`}
              className={clasesDia}
            >
              {contenidoDia}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
