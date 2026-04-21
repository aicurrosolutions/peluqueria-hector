"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format, addDays, subDays, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Phone, Check, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
}

interface Cita {
  id: string;
  hora: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  estado: string;
  notas?: string | null;
  servicio: Servicio;
}

interface Props {
  citasIniciales: Cita[];
  fechaISO: string;
  servicios?: Servicio[]; // para el select de edición en PanelDetalle
  onSlotLibreClick?: (hora: string) => void; // slot vacío → abrir formulario
  onFechaChange?: (d: Date) => void;         // ◀▶ → notificar al padre
  onCitasActualizadas?: () => void;          // tras mutación → padre recarga stats
}

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

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  "Pendiente",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Completada",
  CANCELADA:  "Cancelada",
};

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE:  "bg-primary/15 text-primary",
  CONFIRMADA: "bg-success-container text-success",
  COMPLETADA: "bg-outline/15 text-on-surface-variant",
  CANCELADA:  "bg-error/15 text-error",
};

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
      // El padre (AgendaHub) gestiona el estado: él hará el fetch y actualizará las props
      onFechaChange(d);
    } else {
      // Modo autónomo: gestión local + URL
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
      {/* Navegación de día — solo en modo standalone (sin padre que ya muestre la fecha) */}
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

              {/* Slots libres clickables (solo cuando el padre provee onSlotLibreClick) */}
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
          onClose={() => setCitaActiva(null)}
          onActualizar={actualizarCita}
          onCancelar={cancelarCita}
        />
      )}
    </div>
  );
}

// ── PanelDetalle ──────────────────────────────────────────────────────────────

function PanelDetalle({
  cita,
  servicios,
  onClose,
  onActualizar,
  onCancelar,
}: {
  cita: Cita;
  servicios: Servicio[];
  onClose: () => void;
  onActualizar: (id: string, data: Record<string, unknown>) => Promise<void>;
  onCancelar: (id: string) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [horaEdit, setHoraEdit] = useState(cita.hora);
  const [notasEdit, setNotasEdit] = useState(cita.notas ?? "");
  const [servicioEdit, setServicioEdit] = useState(cita.servicio.id);
  const [guardando, setGuardando] = useState(false);

  // Sincronizar si la cita cambia desde fuera (ej: completar)
  useEffect(() => {
    setHoraEdit(cita.hora);
    setNotasEdit(cita.notas ?? "");
    setServicioEdit(cita.servicio.id);
    setEditando(false);
  }, [cita.id, cita.hora, cita.notas]);

  const guardar = async () => {
    setGuardando(true);
    await onActualizar(cita.id, {
      hora: horaEdit,
      notas: notasEdit || null,
      servicioId: servicioEdit !== cita.servicio.id ? servicioEdit : undefined,
    });
    setGuardando(false);
    setEditando(false);
  };

  const completar = async () => {
    setGuardando(true);
    await onActualizar(cita.id, { estado: "COMPLETADA" });
    setGuardando(false);
  };

  const cancelar = async () => {
    await onCancelar(cita.id);
  };

  return (
    <>
      {/* Backdrop — z-50 para cubrir el bottom nav (z-40) en mobile */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel slide-over — en mobile arranca sobre el bottom nav (bottom-[65px]) */}
      <div className="fixed bottom-[65px] left-0 right-0 lg:bottom-0 lg:left-auto lg:right-0 lg:top-0 lg:w-80 z-[60] bg-surface-container-lowest border-t lg:border-t-0 lg:border-l border-outline/10 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-outline/10">
          <div className="flex-1 min-w-0">
            <span className={`inline-block text-[9px] uppercase tracking-widest font-label font-bold px-2 py-0.5 mb-2 ${ESTADO_BADGE[cita.estado] ?? "bg-outline/10 text-outline"}`}>
              {ESTADO_LABEL[cita.estado]}
            </span>
            <h3 className="text-xl font-headline font-bold text-on-surface uppercase tracking-tight truncate">
              {cita.nombre}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-outline hover:text-on-surface transition-colors shrink-0 ml-3 mt-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {!editando ? (
            /* ── MODO VER ── */
            <>
              <InfoRow label="Servicio" value={`${cita.servicio.nombre} · ${cita.servicio.precio}€ · ${cita.servicio.duracion} min`} />
              <InfoRow label="Hora" value={cita.hora} />
              <div>
                <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-label mb-1">Teléfono</p>
                <a
                  href={`tel:${cita.telefono}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline font-body"
                >
                  <Phone size={12} />
                  {cita.telefono}
                </a>
              </div>
              {cita.email && <InfoRow label="Email" value={cita.email} />}
              {cita.notas && <InfoRow label="Notas" value={cita.notas} />}
            </>
          ) : (
            /* ── MODO EDITAR ── */
            <div className="space-y-4">
              <EditField label="Hora">
                <input
                  type="time"
                  value={horaEdit}
                  step="1800"
                  onChange={(e) => setHoraEdit(e.target.value)}
                  className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </EditField>

              {servicios.length > 0 && (
                <EditField label="Servicio">
                  <select
                    value={servicioEdit}
                    onChange={(e) => setServicioEdit(e.target.value)}
                    className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} — {s.precio}€
                      </option>
                    ))}
                  </select>
                </EditField>
              )}

              <EditField label="Notas internas">
                <textarea
                  value={notasEdit}
                  onChange={(e) => setNotasEdit(e.target.value)}
                  placeholder="Opcional..."
                  rows={3}
                  className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/30 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </EditField>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5 pt-3 border-t border-outline/10 space-y-2">
          {!editando ? (
            <>
              {cita.estado !== "COMPLETADA" && cita.estado !== "CANCELADA" && (
                <button
                  onClick={completar}
                  disabled={guardando}
                  className="w-full flex items-center justify-center gap-2 bg-success-container text-success border border-success-border/20 font-headline font-bold uppercase text-xs tracking-widest py-3 hover:opacity-80 transition-all disabled:opacity-40"
                >
                  <Check size={13} /> Marcar completada
                </button>
              )}
              {cita.estado !== "CANCELADA" && (
                <button
                  onClick={() => setEditando(true)}
                  className="w-full flex items-center justify-center gap-2 bg-surface-container border border-outline/20 text-on-surface font-headline font-bold uppercase text-xs tracking-widest py-3 hover:border-primary hover:text-primary transition-all"
                >
                  <Pencil size={13} /> Editar cita
                </button>
              )}
              {cita.estado !== "CANCELADA" && (
                <button
                  onClick={cancelar}
                  className="w-full flex items-center justify-center gap-2 text-error border border-error/20 font-headline font-bold uppercase text-xs tracking-widest py-3 hover:bg-error/10 transition-all"
                >
                  <X size={13} /> Cancelar cita
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={guardar}
                disabled={guardando}
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest py-3 hover:bg-primary-dim transition-all disabled:opacity-40"
              >
                <Check size={13} /> {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={() => { setEditando(false); setHoraEdit(cita.hora); setNotasEdit(cita.notas ?? ""); setServicioEdit(cita.servicio.id); }}
                className="w-full flex items-center justify-center gap-2 border border-outline/20 text-outline font-label uppercase text-xs tracking-widest py-3 hover:text-on-surface transition-all"
              >
                <X size={13} /> Cancelar edición
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-label mb-1">{label}</p>
      <p className="text-sm text-on-surface font-body">{value}</p>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-label">{label}</label>
      {children}
    </div>
  );
}
