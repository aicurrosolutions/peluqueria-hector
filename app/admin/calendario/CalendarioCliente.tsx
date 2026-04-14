"use client";

import { useState } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { format, parseISO, isSameDay, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2, CalendarOff } from "lucide-react";
import "react-day-picker/style.css";

function DayButton({ children, ...props }: DayButtonProps) {
  return (
    <button {...props} style={{ ...props.style, outline: "none", boxShadow: "none" }}>
      {children}
    </button>
  );
}

interface DiaCerrado { id: string; fecha: string; motivo: string | null }
interface DiaAbierto { id: string; fecha: string; motivo: string | null }
interface Ausencia   { id: string; inicio: string; fin: string; motivo: string | null }

export default function CalendarioCliente({
  diasCerradosIniciales,
  diasAbiertosIniciales,
  diasSemanaAbiertos = [],
  ausenciasIniciales = [],
}: {
  diasCerradosIniciales: DiaCerrado[];
  diasAbiertosIniciales: DiaAbierto[];
  diasSemanaAbiertos?: number[];
  ausenciasIniciales?: Ausencia[];
}) {
  // ── Estado ────────────────────────────────────────────────────────────────
  const [diasCerrados, setDiasCerrados] = useState(diasCerradosIniciales);
  const [diasAbiertos, setDiasAbiertos] = useState(diasAbiertosIniciales);
  const [ausencias,    setAusencias]    = useState(ausenciasIniciales);

  const [seleccion, setSeleccion] = useState<Date | undefined>();
  const [motivo,    setMotivo]    = useState("");
  const [cargando,  setCargando]  = useState(false);

  // Formulario de ausencia (rango)
  const [ausenciaInicio, setAusenciaInicio] = useState("");
  const [ausenciaFin,    setAusenciaFin]    = useState("");
  const [ausenciaMotivo, setAusenciaMotivo] = useState("");
  const [creandoAusencia, setCreandoAusencia] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fechasCerradas = diasCerrados.map((d) => parseISO(d.fecha));
  const fechasAbiertas = diasAbiertos.map((d) => parseISO(d.fecha));

  // Días bloqueados por ausencias (para el DayPicker)
  const diasDeAusencia = ausencias.flatMap((a) =>
    eachDayOfInterval({ start: parseISO(a.inicio), end: parseISO(a.fin) })
  );

  const esCerradoExcepcion = (d: Date) => fechasCerradas.some((f) => isSameDay(f, d));
  const esAbiertoExcepcion = (d: Date) => fechasAbiertas.some((f) => isSameDay(f, d));
  const esAusencia         = (d: Date) => diasDeAusencia.some((f) => isSameDay(f, d));
  const esLaborable        = (d: Date) => diasSemanaAbiertos.includes(d.getDay());

  const accionParaDia = (d: Date) => {
    if (esAusencia(d))          return null;               // bloqueo por vacaciones — sin acción
    if (esCerradoExcepcion(d))  return "quitar-cerrado";
    if (esAbiertoExcepcion(d))  return "quitar-abierto";
    if (esLaborable(d))         return "cerrar";
    return "abrir";
  };

  // ── Acciones sobre días individuales ──────────────────────────────────────
  const handleAccion = async () => {
    if (!seleccion) return;
    const accion = accionParaDia(seleccion);
    if (!accion) return;
    setCargando(true);

    if (accion === "cerrar") {
      const res = await fetch("/api/dias-cerrados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: format(seleccion, "yyyy-MM-dd"), motivo: motivo || undefined }),
      });
      const nuevo = await res.json();
      setDiasCerrados((p) => [...p, { id: nuevo.id, fecha: nuevo.fecha, motivo: nuevo.motivo }]);

    } else if (accion === "quitar-cerrado") {
      const dia = diasCerrados.find((d) => isSameDay(parseISO(d.fecha), seleccion!));
      if (dia) {
        await fetch("/api/dias-cerrados", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: dia.id }),
        });
        setDiasCerrados((p) => p.filter((d) => d.id !== dia.id));
      }

    } else if (accion === "abrir") {
      const res = await fetch("/api/dias-abiertos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: format(seleccion, "yyyy-MM-dd"), motivo: motivo || undefined }),
      });
      const nuevo = await res.json();
      setDiasAbiertos((p) => [...p, { id: nuevo.id, fecha: nuevo.fecha, motivo: nuevo.motivo }]);

    } else if (accion === "quitar-abierto") {
      const dia = diasAbiertos.find((d) => isSameDay(parseISO(d.fecha), seleccion!));
      if (dia) {
        await fetch("/api/dias-abiertos", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: dia.id }),
        });
        setDiasAbiertos((p) => p.filter((d) => d.id !== dia.id));
      }
    }

    setSeleccion(undefined);
    setMotivo("");
    setCargando(false);
  };

  // ── Crear ausencia (rango) ────────────────────────────────────────────────
  const crearAusencia = async () => {
    if (!ausenciaInicio || !ausenciaFin) return;
    setCreandoAusencia(true);
    const res = await fetch("/api/ausencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inicio: ausenciaInicio, fin: ausenciaFin, motivo: ausenciaMotivo || undefined }),
    });
    if (res.ok) {
      const nueva = await res.json();
      setAusencias((p) => [...p, nueva]);
      setAusenciaInicio("");
      setAusenciaFin("");
      setAusenciaMotivo("");
    }
    setCreandoAusencia(false);
  };

  const eliminarAusencia = async (id: string) => {
    await fetch("/api/ausencias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAusencias((p) => p.filter((a) => a.id !== id));
  };

  const infoSeleccion = seleccion ? accionParaDia(seleccion) : null;

  return (
    <div className="space-y-8">

      {/* ── Calendario + días sueltos ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* DayPicker */}
        <div className="bg-surface-container-low p-4 md:p-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-xs mb-2 font-label">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400/30 inline-block" /> Excepción: cerrado</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400/30 inline-block" /> Excepción: abierto</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary/30 inline-block" /> Ausencia</span>
          </div>
          <DayPicker
            mode="single"
            selected={seleccion}
            onSelect={setSeleccion}
            locale={es}
            startMonth={new Date()}
            modifiers={{ cerrado: fechasCerradas, abierto: fechasAbiertas, ausencia: diasDeAusencia }}
            modifiersClassNames={{ cerrado: "dia-cerrado", abierto: "dia-abierto", ausencia: "dia-ausencia" }}
            classNames={{ focused: "rdp-no-focus" }}
            components={{ DayButton }}
          />

          {seleccion && infoSeleccion && (
            <div className="space-y-3 border-t border-outline/10 pt-4">
              <p className="text-sm text-on-surface/60 font-body">
                <span className="text-primary capitalize font-label font-bold">
                  {format(seleccion, "EEEE d 'de' MMMM", { locale: es })}
                </span>
                {" — "}
                {infoSeleccion === "cerrar" && "Día laborable — marcar como cerrado"}
                {infoSeleccion === "quitar-cerrado" && "Cierre especial — quitar para reabrir"}
                {infoSeleccion === "abrir" && "Día no laborable — abrir puntualmente"}
                {infoSeleccion === "quitar-abierto" && "Apertura especial — quitar para cerrar"}
              </p>
              {(infoSeleccion === "cerrar" || infoSeleccion === "abrir") && (
                <input
                  type="text"
                  placeholder="Motivo (opcional)"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full bg-surface-container text-on-surface placeholder-outline/40 border-0 border-b border-outline focus:border-primary focus:outline-none px-0 py-2 text-sm font-body transition-colors"
                />
              )}
              <button
                onClick={handleAccion}
                disabled={cargando}
                className={`w-full font-headline font-bold text-xs tracking-widest uppercase py-4 transition-all disabled:opacity-40 ${
                  infoSeleccion === "quitar-cerrado" || infoSeleccion === "quitar-abierto"
                    ? "bg-surface-container-high border border-outline/20 text-on-surface/60 hover:text-on-surface hover:border-outline/40"
                    : "bg-primary text-on-primary hover:bg-primary-dim"
                }`}
              >
                {cargando ? "Guardando..." :
                  infoSeleccion === "cerrar" ? "Cerrar este día" :
                  infoSeleccion === "quitar-cerrado" ? "Quitar cierre" :
                  infoSeleccion === "abrir" ? "Abrir este día" :
                  "Quitar apertura"}
              </button>
            </div>
          )}

          {seleccion && !infoSeleccion && (
            <p className="text-outline/50 text-xs font-body border-t border-outline/10 pt-4">
              Este día está bloqueado por una ausencia programada.
            </p>
          )}
        </div>

        {/* Listas de excepciones */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-headline text-base font-bold text-on-surface uppercase tracking-tight">Días cerrados</h2>
            {diasCerrados.length === 0 ? (
              <p className="text-outline/40 text-xs font-body">Ninguno.</p>
            ) : diasCerrados.map((d) => (
              <ListItem key={d.id} fecha={d.fecha} motivo={d.motivo} color="red"
                onDelete={async () => {
                  await fetch("/api/dias-cerrados", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id }) });
                  setDiasCerrados((p) => p.filter((x) => x.id !== d.id));
                }}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="font-headline text-base font-bold text-on-surface uppercase tracking-tight">Aperturas especiales</h2>
            {diasAbiertos.length === 0 ? (
              <p className="text-outline/40 text-xs font-body">Ninguna.</p>
            ) : diasAbiertos.map((d) => (
              <ListItem key={d.id} fecha={d.fecha} motivo={d.motivo} color="green"
                onDelete={async () => {
                  await fetch("/api/dias-abiertos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.id }) });
                  setDiasAbiertos((p) => p.filter((x) => x.id !== d.id));
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Ausencias y vacaciones ───────────────────────────────────────── */}
      <div className="border-t border-outline/10 pt-8 space-y-5">
        <div className="flex items-center gap-3">
          <CalendarOff size={16} className="text-primary shrink-0" />
          <div>
            <h2 className="font-headline text-base font-bold text-on-surface uppercase tracking-tight">
              Vacaciones y ausencias
            </h2>
            <p className="text-outline text-[11px] font-body mt-0.5">
              Bloquea un rango de días de golpe — nadie podrá reservar durante ese periodo.
            </p>
          </div>
        </div>

        {/* Formulario rango */}
        <div className="bg-surface-container-low p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-outline font-label">Desde</label>
              <input
                type="date"
                value={ausenciaInicio}
                onChange={(e) => setAusenciaInicio(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-outline font-label">Hasta</label>
              <input
                type="date"
                value={ausenciaFin}
                min={ausenciaInicio}
                onChange={(e) => setAusenciaFin(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-outline font-label">Motivo (opcional)</label>
              <input
                type="text"
                placeholder="Vacaciones, baja, formación..."
                value={ausenciaMotivo}
                onChange={(e) => setAusenciaMotivo(e.target.value)}
                className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder:text-outline/40 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <button
            onClick={crearAusencia}
            disabled={!ausenciaInicio || !ausenciaFin || creandoAusencia}
            className="bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-primary-dim transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creandoAusencia ? "Guardando..." : "Bloquear periodo"}
          </button>
        </div>

        {/* Lista de ausencias */}
        {ausencias.length > 0 && (
          <div className="space-y-2">
            {ausencias.map((a) => {
              const inicio = parseISO(a.inicio);
              const fin    = parseISO(a.fin);
              const dias   = eachDayOfInterval({ start: inicio, end: fin }).length;
              return (
                <div key={a.id} className="bg-surface-container-low border-l-4 border-primary/40 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-on-surface text-sm font-body">
                      <span className="font-bold capitalize">{format(inicio, "d MMM", { locale: es })}</span>
                      {" → "}
                      <span className="font-bold capitalize">{format(fin, "d MMM yyyy", { locale: es })}</span>
                      <span className="text-outline text-xs ml-2">({dias} {dias === 1 ? "día" : "días"})</span>
                    </p>
                    {a.motivo && <p className="text-outline text-[11px] mt-0.5 font-label uppercase tracking-wider">{a.motivo}</p>}
                  </div>
                  <button
                    onClick={() => eliminarAusencia(a.id)}
                    className="p-2 text-outline/40 hover:text-error transition-colors shrink-0"
                    title="Eliminar ausencia"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {ausencias.length === 0 && (
          <p className="text-outline/40 text-xs font-body">No hay ausencias programadas.</p>
        )}
      </div>

    </div>
  );
}

// ── ListItem ──────────────────────────────────────────────────────────────────

function ListItem({ fecha, motivo, color, onDelete }: {
  fecha: string; motivo: string | null; color: "red" | "green"; onDelete: () => void
}) {
  return (
    <div className={`bg-surface-container-low border-l-4 p-3 md:p-4 flex items-center justify-between gap-3 ${color === "red" ? "border-error/40" : "border-green-500/40"}`}>
      <div className="min-w-0">
        <p className="text-on-surface text-xs md:text-sm capitalize font-body truncate">
          {format(parseISO(fecha), "EEE d 'de' MMM 'de' yyyy", { locale: es })}
        </p>
        {motivo && <p className="text-outline text-[10px] mt-0.5 font-body">{motivo}</p>}
      </div>
      <button
        onClick={onDelete}
        className={`p-2 shrink-0 text-outline/40 transition-colors ${color === "red" ? "hover:text-error" : "hover:text-green-500"}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
