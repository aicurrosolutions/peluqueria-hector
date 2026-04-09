"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
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
}

export default function VistaSemanal({ citasSemana: citasIniciales, inicioSemanaISO }: Props) {
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
            className="p-1.5 text-outline hover:text-on-surface transition-colors border border-outline/20 hover:border-outline/40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-label uppercase tracking-wider text-outline min-w-[130px] text-center">
            {format(semanaBase, "d MMM", { locale: es })} – {format(addDays(semanaBase, 6), "d MMM yy", { locale: es })}
          </span>
          <button
            onClick={semanaSiguiente}
            className="p-1.5 text-outline hover:text-on-surface transition-colors border border-outline/20 hover:border-outline/40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid 7 días */}
      <div className={`grid grid-cols-7 gap-px bg-outline/5 overflow-hidden transition-opacity ${cargando ? "opacity-50" : ""}`}>
        {dias.map((dia) => {
          const citasDia = citasPorDia(dia);
          const esDiaHoy = isToday(dia);
          const fechaStr = format(dia, "yyyy-MM-dd");
          const esPasado = dia < startOfWeek(new Date(), { weekStartsOn: 1 }) && !esDiaHoy;

          return (
            <Link
              key={fechaStr}
              href={`/admin/citas?fecha=${fechaStr}`}
              className={`group flex flex-col min-h-[100px] md:min-h-[150px] p-2 md:p-3 transition-colors ${
                esDiaHoy
                  ? "bg-surface-container border-t-2 border-primary"
                  : "bg-surface-container-low hover:bg-surface-container border-t-2 border-transparent"
              } ${esPasado ? "opacity-40" : ""}`}
            >
              {/* Cabecera del día */}
              <div className="mb-1.5 md:mb-2">
                <p className={`text-[8px] md:text-[10px] uppercase tracking-widest font-label leading-none ${esDiaHoy ? "text-primary" : "text-outline"}`}>
                  {format(dia, "EEE", { locale: es })}
                </p>
                <p className={`text-lg md:text-2xl font-headline font-bold leading-tight ${esDiaHoy ? "text-primary" : "text-on-surface"}`}>
                  {format(dia, "d")}
                </p>
              </div>

              {/* Lista de citas (máx 3) */}
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {citasDia.length === 0 ? (
                  <p className="text-[8px] text-outline/20 font-label hidden md:block mt-1">libre</p>
                ) : (
                  citasDia.slice(0, 3).map((c) => (
                    <div key={c.id} className="bg-primary/10 rounded-[1px] px-1 py-px overflow-hidden">
                      <p className="text-[7px] md:text-[9px] text-primary font-label font-bold uppercase leading-tight truncate">
                        {c.hora} {c.nombre.split(" ")[0]}
                      </p>
                    </div>
                  ))
                )}
                {citasDia.length > 3 && (
                  <p className="text-[7px] md:text-[9px] text-outline font-label pl-1">
                    +{citasDia.length - 3}
                  </p>
                )}
              </div>

              {/* Total en pie */}
              {citasDia.length > 0 && (
                <p className={`text-[8px] md:text-[9px] font-label uppercase tracking-wide mt-1 ${esDiaHoy ? "text-primary" : "text-outline/60"}`}>
                  {citasDia.length} {citasDia.length === 1 ? "cita" : "citas"}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
