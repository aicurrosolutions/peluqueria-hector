"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format, addDays, subDays, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Cita, Servicio } from "@/lib/types";
import PanelDetalle from "./PanelDetalle";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generarFranjas(inicio: string, fin: string): string[] {
  const franjas: string[] = [];
  const [hI, mI] = inicio.split(":").map(Number);
  const [hF, mF] = fin.split(":").map(Number);
  let totalMin = hI * 60 + mI;
  const finMin = hF * 60 + mF;
  while (totalMin <= finMin) {
    const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
    const m = (totalMin % 60).toString().padStart(2, "0");
    franjas.push(`${h}:${m}`);
    totalMin += 15;
  }
  return franjas;
}

function calcularRango(citas: Cita[]): { inicio: string; fin: string } {
  if (citas.length === 0) return { inicio: "09:00", fin: "21:00" };
  const horas = citas.map((c) => {
    const [h, m] = c.hora.split(":").map(Number);
    return h * 60 + m;
  });
  const clamp = (v: number) => Math.max(0, Math.min(v, 23 * 60 + 45));
  const fmt = (v: number) =>
    `${Math.floor(v / 60).toString().padStart(2, "0")}:${(v % 60).toString().padStart(2, "0")}`;
  return { inicio: fmt(clamp(Math.min(...horas) - 30)), fin: fmt(clamp(Math.max(...horas) + 60)) };
}

const ESTADO_BG: Record<string, string> = {
  PENDIENTE:  "bg-primary/15 border-l-2 border-primary",
  CONFIRMADA: "bg-success-container border-l-2 border-success-border",
  COMPLETADA: "bg-outline/10 border-l-2 border-outline/30",
  CANCELADA:  "bg-error/10 border-l-2 border-error/40",
};

const NOMBRE_COLOR: Record<string, string> = {
  PENDIENTE:  "text-primary",
  CONFIRMADA: "text-success",
  COMPLETADA: "text-on-surface-variant",
  CANCELADA:  "text-error/60",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  citasIniciales: Cita[];
  fechaISO: string;
  servicios?: Servicio[];
  onSlotLibreClick?: (hora: string) => void;
  onFechaChange?: (d: Date) => void;
  onCitasActualizadas?: () => void;
}

// ── Componente Principal ──────────────────────────────────────────────────────

export default function AgendaDiaria({
  citasIniciales,
  fechaISO,
  servicios = [],
  onSlotLibreClick,
  onFechaChange,
  onCitasActualizadas,
}: Props) {
  const [fecha, setFecha] = useState(() => parseISO(fechaISO));
  const [citas, setCitas] = useState<Cita[]>(citasIniciales);
  const [cargando, setCargando] = useState(false);
  const [citaActiva, setCitaActiva] = useState<Cita | null>(null);
  const [completandoId, setCompletandoId] = useState<string | null>(null);
  const ahoraRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll a "ahora" al montar
  useEffect(() => {
    setTimeout(() => ahoraRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }, []);

  // Sincronizar fecha cuando el padre cambia fechaISO (día seleccionado desde VistaSemanal)
  useEffect(() => {
    setFecha(parseISO(fechaISO));
    setCitaActiva(null);
  }, [fechaISO]);

  // Sincronizar citas cuando el padre las actualiza (tras fetch en AgendaHub)
  useEffect(() => {
    setCitas(citasIniciales);
  }, [citasIniciales]);

  const cargarCitas = useCallback(async (d: Date) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/citas?fecha=${format(d, "yyyy-MM-dd")}`);
      if (res.ok) setCitas(await res.json());
    } finally {
      setCargando(false);
    }
  }, []);

  const irDia = (d: Date) => {
    if (onFechaChange) {
      onFechaChange(d);
    } else {
      setFecha(d);
      setCitaActiva(null);
      router.push(`/admin/dashboard?fecha=${format(d, "yyyy-MM-dd")}`, { scroll: false });
      cargarCitas(d);
    }
  };

  const actualizarCita = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/citas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const citaActualizada = await res.json();
      setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, ...citaActualizada } : c)));
      setCitaActiva((prev) => (prev?.id === id ? { ...prev, ...citaActualizada } : prev));
      onCitasActualizadas?.();
      router.refresh();
    }
  };

  const cancelarCita = async (id: string) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    const res = await fetch(`/api/citas/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: "CANCELADA" } : c)));
      setCitaActiva((prev) => (prev?.id === id ? { ...prev, estado: "CANCELADA" } : prev));
      onCitasActualizadas?.();
      router.refresh();
    }
  };

  // ── Layout del timeline ───────────────────────────────────────────────────

  const { inicio, fin } = calcularRango(citas);
  const franjas = generarFranjas(inicio, fin);
  const ALTURA_SLOT = 48;
  const HORA_INICIO_MIN = parseInt(inicio.split(":")[0]) * 60 + parseInt(inicio.split(":")[1]);

  const horaPx = (horaStr: string) => {
    const [h, m] = horaStr.split(":").map(Number);
    return ((h * 60 + m - HORA_INICIO_MIN) / 15) * ALTURA_SLOT;
  };

  const now = new Date();
  const ahoraPx = isToday(fecha)
    ? ((now.getHours() * 60 + now.getMinutes() - HORA_INICIO_MIN) / 15) * ALTURA_SLOT
    : null;

  const totalHoras = franjas.length * ALTURA_SLOT;
  const citasOrdenadas = [...citas].sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div className="flex flex-col h-full">
      {/* Navegación de día — solo en modo standalone */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-outline/10 bg-surface sticky top-0 z-20 ${onFechaChange ? "hidden" : ""}`}>
        <button
          onClick={() => irDia(subDays(fecha, 1))}
          className="p-2 text-outline hover:text-on-surface border border-outline/20 hover:border-outline/40 transition-all"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="text-center">
          <p className={`text-lg font-headline font-bold uppercase tracking-tight ${isToday(fecha) ? "text-primary" : "text-on-surface"}`}>
            {format(fecha, "EEEE", { locale: es })}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">
            {format(fecha, "d 'de' MMMM yyyy", { locale: es })}
          </p>
          {!isToday(fecha) && (
            <button
              onClick={() => irDia(new Date())}
              className="text-[10px] text-primary font-label uppercase tracking-widest hover:underline mt-0.5"
            >
              Hoy
            </button>
          )}
        </div>

        <button
          onClick={() => irDia(addDays(fecha, 1))}
          className="p-2 text-outline hover:text-on-surface border border-outline/20 hover:border-outline/40 transition-all"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Timeline */}
      <div className={`flex-1 overflow-y-auto transition-opacity ${cargando ? "opacity-40 pointer-events-none" : ""}`}>
        {citas.length === 0 && !cargando && !onSlotLibreClick ? (
          <div className="flex items-center justify-center py-20 text-center">
            <div>
              <p className="text-outline text-xs uppercase tracking-widest font-label">Sin citas este día</p>
              <p className="text-outline/40 text-[10px] mt-1 font-label">Día libre</p>
            </div>
          </div>
        ) : (
          <div className="relative flex" style={{ height: `${totalHoras}px`, minHeight: "400px" }}>
            {/* Columna de horas */}
            <div className="w-14 shrink-0 relative select-none">
              {franjas.map((f, i) =>
                (f.endsWith(":00") || f.endsWith(":30")) ? (
                  <div
                    key={f}
                    className="absolute left-0 right-0 flex items-start justify-end pr-2"
                    style={{ top: i * ALTURA_SLOT - 8 }}
                  >
                    <span className="text-[10px] font-label text-outline/60 leading-none">{f}</span>
                  </div>
                ) : null
              )}
            </div>

            {/* Área de citas */}
            <div className="flex-1 relative border-l border-outline/10">
              {/* Líneas horizontales */}
              {franjas.map((f, i) => (
                <div
                  key={f}
                  className={`absolute left-0 right-0 border-t ${
                    f.endsWith(":00") ? "border-outline/15" :
                    f.endsWith(":30") ? "border-outline/8" :
                    "border-outline/4"
                  }`}
                  style={{ top: i * ALTURA_SLOT }}
                />
              ))}

              {/* Slots libres clickables */}
              {onSlotLibreClick && franjas
                .filter((f) => f.endsWith(":00") || f.endsWith(":30"))
                .map((f) => {
                  const ocupado = citasOrdenadas.some((c) => c.hora === f);
                  if (ocupado) return null;
                  return (
                    <button
                      key={`slot-${f}`}
                      type="button"
                      onClick={() => onSlotLibreClick(f)}
                      className="absolute left-0 right-0 z-0 group hover:bg-primary/5 transition-colors cursor-pointer"
                      style={{ top: horaPx(f), height: ALTURA_SLOT * 2 }}
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-primary/0 group-hover:text-primary/50 font-label uppercase tracking-widest transition-colors select-none">
                        + {f}
                      </span>
                    </button>
                  );
                })}

              {/* Línea "ahora" */}
              {ahoraPx !== null && ahoraPx >= 0 && ahoraPx <= totalHoras && (
                <div
                  ref={ahoraRef}
                  className="absolute left-0 right-0 z-10 flex items-center"
                  style={{ top: ahoraPx }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 -ml-1.5" />
                  <div className="flex-1 h-px bg-primary" />
                </div>
              )}

              {/* Bloques de cita */}
              {citasOrdenadas.map((cita) => {
                const topPx = horaPx(cita.hora);
                const heightPx = Math.max((cita.servicio.duracion / 15) * ALTURA_SLOT - 2, ALTURA_SLOT - 2);
                const activa = citaActiva?.id === cita.id;
                const puedeCompletar = cita.estado === "PENDIENTE" || cita.estado === "CONFIRMADA";

                return (
                  <div
                    key={cita.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCitaActiva(activa ? null : cita)}
                    onKeyDown={(e) => e.key === "Enter" && setCitaActiva(activa ? null : cita)}
                    className={`absolute left-1 right-1 z-[1] rounded-[2px] px-2.5 py-1.5 overflow-hidden text-left transition-all cursor-pointer group ${
                      ESTADO_BG[cita.estado] ?? "bg-surface-container border-l-2 border-outline/20"
                    } ${activa ? "ring-1 ring-primary/60" : "hover:brightness-110"}`}
                    style={{ top: topPx + 1, height: heightPx }}
                  >
                    <div className="flex-1 min-w-0 pr-5">
                      <span className="text-[10px] font-label font-bold text-outline/60 shrink-0">{cita.hora}</span>
                      <p className={`text-[11px] font-headline font-bold uppercase tracking-tight leading-tight truncate ${NOMBRE_COLOR[cita.estado] ?? "text-on-surface"}`}>
                        {cita.nombre}
                      </p>
                      {heightPx > 36 && (
                        <p className="text-[9px] text-outline/70 font-label truncate leading-tight">
                          {cita.servicio.nombre} · {cita.servicio.precio}€
                        </p>
                      )}
                    </div>
                    {puedeCompletar && (
                      <button
                        type="button"
                        title="Marcar completada"
                        disabled={completandoId === cita.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setCompletandoId(cita.id);
                          await actualizarCita(cita.id, { estado: "COMPLETADA" });
                          setCompletandoId(null);
                        }}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center bg-success-container text-success hover:bg-success hover:text-on-primary rounded-[2px] disabled:opacity-40"
                      >
                        <Check size={10} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Panel detalle */}
      {citaActiva && (
        <PanelDetalle
          cita={citaActiva}
          servicios={servicios}
          fechaISO={format(fecha, "yyyy-MM-dd")}
          onClose={() => setCitaActiva(null)}
          onActualizar={actualizarCita}
          onCancelar={cancelarCita}
        />
      )}
    </div>
  );
}
