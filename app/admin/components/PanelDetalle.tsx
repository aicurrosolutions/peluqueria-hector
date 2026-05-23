"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { X, Phone, Check, Pencil } from "lucide-react";
import type { Cita, Servicio } from "@/lib/types";

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

interface Props {
  cita: Cita;
  servicios: Servicio[];
  fechaISO: string;
  onClose: () => void;
  onActualizar: (id: string, data: Record<string, unknown>) => Promise<void>;
  onCancelar: (id: string) => Promise<void>;
}

export default function PanelDetalle({
  cita,
  servicios,
  fechaISO,
  onClose,
  onActualizar,
  onCancelar,
}: Props) {
  const [editando, setEditando] = useState(false);
  const [fechaEdit, setFechaEdit] = useState(fechaISO); // YYYY-MM-DD — enviado a la API
  const [fechaEditDisplay, setFechaEditDisplay] = useState(() => isoToDMY(fechaISO)); // DD/MM/AAAA
  const [horaEdit, setHoraEdit] = useState(cita.hora);
  const [notasEdit, setNotasEdit] = useState(cita.notas ?? "");
  const [servicioEdit, setServicioEdit] = useState(cita.servicio.id);
  const [guardando, setGuardando] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // Sincronizar si la cita cambia desde fuera (ej: completar)
  useEffect(() => {
    setFechaEdit(fechaISO);
    setFechaEditDisplay(isoToDMY(fechaISO));
    setHoraEdit(cita.hora);
    setNotasEdit(cita.notas ?? "");
    setServicioEdit(cita.servicio.id);
    setEditando(false);
  }, [cita.id, cita.hora, cita.notas, fechaISO]);

  // Cargar slots disponibles al entrar en modo edición, cambiar servicio o cambiar fecha
  useEffect(() => {
    if (!editando) { setSlots([]); return; }
    const servicio = servicios.find((s) => s.id === servicioEdit) ?? cita.servicio;
    const controller = new AbortController();
    setCargandoSlots(true);
    fetch(`/api/disponibilidad?fecha=${fechaEdit}&duracion=${servicio.duracion}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { slots: string[] }) => {
        const disponibles = data.slots ?? [];
        // Solo inyectamos la hora original si la fecha no cambió —
        // si cambió, la cita no ocupa nada en el nuevo día.
        const esLaMismaFecha = fechaEdit === fechaISO;
        const conHoraOriginal =
          esLaMismaFecha && !disponibles.includes(cita.hora)
            ? [...disponibles, cita.hora].sort()
            : disponibles;
        setSlots(conHoraOriginal);
      })
      .catch((e) => { if (e.name !== "AbortError") setSlots(fechaEdit === fechaISO ? [cita.hora] : []); })
      .finally(() => setCargandoSlots(false));
    return () => controller.abort();
  }, [editando, servicioEdit, fechaEdit, fechaISO, servicios, cita.hora, cita.servicio]);

  const guardar = async () => {
    setGuardando(true);
    await onActualizar(cita.id, {
      hora: horaEdit,
      fecha: fechaEdit,
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
              <InfoRow label="Fecha · Hora" value={`${format(parseISO(fechaISO), "d MMM yyyy", { locale: es })} · ${cita.hora}`} />
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
              <EditField label="Fecha">
                <input
                  type="text"
                  value={fechaEditDisplay}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  onChange={(e) => {
                    setFechaEditDisplay(e.target.value);
                    const iso = dmyToISO(e.target.value);
                    if (iso) { setFechaEdit(iso); setHoraEdit(""); }
                  }}
                  className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/40 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </EditField>

              <EditField label={cargandoSlots ? "Hora — cargando…" : "Hora"}>
                {cargandoSlots ? (
                  <div className="h-9 bg-surface-container border border-outline/20 animate-pulse" />
                ) : slots.length === 0 ? (
                  <p className="text-xs text-outline/60 font-label px-1 py-2">No hay horas disponibles para este día</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setHoraEdit(slot)}
                        className={`px-2.5 py-1.5 text-xs font-headline font-bold uppercase tracking-wider transition-all ${
                          horaEdit === slot
                            ? "bg-primary text-on-primary"
                            : slot === cita.hora
                            ? "bg-surface-container border border-outline/40 text-on-surface-variant hover:border-primary hover:text-primary"
                            : "bg-surface-container border border-outline/20 text-on-surface hover:border-primary hover:text-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
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

// ── Helpers de fecha ─────────────────────────────────────────────────────────

function isoToDMY(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function dmyToISO(dmy: string): string {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dmy)) return "";
  const [d, m, y] = dmy.split("/");
  return `${y}-${m}-${d}`;
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
