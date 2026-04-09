"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Check, X, Pencil } from "lucide-react";

interface Cita {
  id: string;
  hora: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  estado: string;
  notas?: string | null;
  servicio: { nombre: string; precio: number; duracion: number };
}

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  COMPLETADA: "Completada",
};

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: "text-primary",
  CONFIRMADA: "text-primary",
  CANCELADA: "text-error",
  COMPLETADA: "text-outline",
};

export default function CitaCard({ cita }: { cita: Cita }) {
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [horaEdit, setHoraEdit] = useState(cita.hora);
  const [notasEdit, setNotasEdit] = useState(cita.notas ?? "");
  const router = useRouter();

  const actualizarEstado = async (estado: string) => {
    setCargando(true);
    await fetch(`/api/citas/${cita.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    router.refresh();
    setCargando(false);
  };

  const guardarEdicion = async () => {
    setCargando(true);
    await fetch(`/api/citas/${cita.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hora: horaEdit, notas: notasEdit || null }),
    });
    setEditando(false);
    router.refresh();
    setCargando(false);
  };

  const cancelar = async () => {
    if (!confirm("¿Cancelar esta cita?")) return;
    setCargando(true);
    await fetch(`/api/citas/${cita.id}`, { method: "DELETE" });
    router.refresh();
    setCargando(false);
  };

  const enCurso = cita.estado === "CONFIRMADA";

  /* ── MODO EDICIÓN ── */
  if (editando) {
    return (
      <div className="bg-surface-container border-l-4 border-primary p-4 md:p-6 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-primary font-label">Editando · {cita.nombre}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-label">Hora</label>
            <input
              type="time"
              value={horaEdit}
              step="1800"
              onChange={(e) => setHoraEdit(e.target.value)}
              className="w-full bg-surface-container-high border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-outline font-label">Notas internas</label>
            <input
              type="text"
              value={notasEdit}
              onChange={(e) => setNotasEdit(e.target.value)}
              placeholder="Opcional..."
              className="w-full bg-surface-container-high border border-outline/20 text-on-surface placeholder-outline/30 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={guardarEdicion}
            disabled={cargando}
            className="flex items-center gap-1.5 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest px-4 py-2.5 hover:bg-primary-dim transition-all disabled:opacity-40"
          >
            <Check size={12} /> Guardar
          </button>
          <button
            onClick={() => { setEditando(false); setHoraEdit(cita.hora); setNotasEdit(cita.notas ?? ""); }}
            className="flex items-center gap-1.5 border border-outline/20 text-outline font-label uppercase text-xs tracking-widest px-4 py-2.5 hover:text-on-surface transition-all"
          >
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  /* ── MODO NORMAL ── */
  return (
    <div className={`group flex items-stretch transition-all ${
      enCurso
        ? "bg-surface-container-low border-l-4 border-primary"
        : "bg-surface-container-lowest hover:bg-surface-container-low border-l-4 border-transparent"
    } ${cargando ? "opacity-50" : ""}`}>
      {/* Hora */}
      <div className="w-16 md:w-24 py-5 md:py-8 flex flex-col items-center justify-center border-r border-outline/5 shrink-0">
        <span className="text-xs font-headline font-bold text-primary leading-tight">{cita.hora}</span>
        <span className="text-[8px] md:text-[9px] uppercase tracking-tighter text-outline mt-1 font-label">{cita.servicio.duracion}m</span>
      </div>

      {/* Info */}
      <div className="flex-1 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between gap-2 min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm md:text-base font-headline font-bold text-on-surface tracking-tight uppercase truncate">{cita.nombre}</h4>
            {enCurso && <span className="inline-block w-1.5 h-1.5 bg-primary animate-pulse shrink-0" />}
          </div>
          <p className="text-[10px] uppercase tracking-wider text-outline font-label truncate">{cita.servicio.nombre}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-headline font-bold text-on-surface">{cita.servicio.precio.toFixed(2)}€</span>
            <span className={`text-[9px] uppercase tracking-wider font-label ${ESTADO_COLOR[cita.estado]}`}>
              {ESTADO_LABEL[cita.estado]}
            </span>
          </div>
          {cita.notas && <p className="text-[10px] text-outline/50 italic font-body mt-0.5 truncate">{cita.notas}</p>}
        </div>

        {/* Acciones */}
        <div className="flex gap-1 md:gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <a href={`tel:${cita.telefono}`} className="text-outline hover:text-primary transition-colors p-2" title={cita.telefono}>
            <Phone size={15} />
          </a>
          {cita.estado !== "CANCELADA" && (
            <button onClick={() => setEditando(true)} className="text-outline hover:text-primary transition-colors p-2" title="Editar">
              <Pencil size={15} />
            </button>
          )}
          {cita.estado !== "COMPLETADA" && cita.estado !== "CANCELADA" && (
            <button onClick={() => actualizarEstado("COMPLETADA")} className="text-outline hover:text-primary transition-colors p-2" title="Marcar completada">
              <Check size={15} />
            </button>
          )}
          {cita.estado !== "CANCELADA" && (
            <button onClick={cancelar} className="text-outline hover:text-error transition-colors p-2" title="Cancelar">
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
