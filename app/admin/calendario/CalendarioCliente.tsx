"use client";

import { useState } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { format, parseISO, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import "react-day-picker/style.css";

function DayButton({ children, ...props }: DayButtonProps) {
  return (
    <button {...props} style={{ ...props.style, outline: "none", boxShadow: "none" }}>
      {children}
    </button>
  );
}

interface DiaCerrado {
  id: string;
  fecha: string;
  motivo: string | null;
}

interface DiaAbierto {
  id: string;
  fecha: string;
  motivo: string | null;
}

export default function CalendarioCliente({
  diasCerradosIniciales,
  diasAbiertosIniciales,
}: {
  diasCerradosIniciales: DiaCerrado[];
  diasAbiertosIniciales: DiaAbierto[];
}) {
  const [diasCerrados, setDiasCerrados] = useState(diasCerradosIniciales);
  const [diasAbiertos, setDiasAbiertos] = useState(diasAbiertosIniciales);
  const [seleccion, setSeleccion] = useState<Date | undefined>();
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);

  const fechasCerradas = diasCerrados.map((d) => parseISO(d.fecha));
  const fechasAbiertas = diasAbiertos.map((d) => parseISO(d.fecha));

  const esCerrado = (d: Date) => fechasCerradas.some((f) => isSameDay(f, d));
  const esAbierto = (d: Date) => fechasAbiertas.some((f) => isSameDay(f, d));
  const esFinde = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  const accionParaDia = (d: Date) => {
    if (esCerrado(d)) return "quitar-cerrado";
    if (esAbierto(d)) return "quitar-abierto";
    if (esFinde(d)) return "abrir-finde";
    return "cerrar";
  };

  const handleAccion = async () => {
    if (!seleccion) return;
    const accion = accionParaDia(seleccion);
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

    } else if (accion === "abrir-finde") {
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

  const infoSeleccion = seleccion ? accionParaDia(seleccion) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Calendario */}
      <div className="bg-surface-container-low p-4 md:p-6 space-y-4">
        <div className="flex gap-4 text-xs mb-2 font-label">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400/30 inline-block" /> Cerrado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400/30 inline-block" /> Abierto (finde)</span>
        </div>
        <DayPicker
          mode="single"
          selected={seleccion}
          onSelect={setSeleccion}
          locale={es}
          startMonth={new Date()}
          modifiers={{ cerrado: fechasCerradas, abierto: fechasAbiertas }}
          modifiersClassNames={{ cerrado: "dia-cerrado", abierto: "dia-abierto" }}
          classNames={{ focused: "rdp-no-focus" }}
          components={{ DayButton }}
        />

        {seleccion && (
          <div className="space-y-3 border-t border-outline/10 pt-4">
            <p className="text-sm text-on-surface/60 font-body">
              <span className="text-primary capitalize font-label font-bold">
                {format(seleccion, "EEEE d 'de' MMMM", { locale: es })}
              </span>
              {" — "}
              {infoSeleccion === "cerrar" && "Marcar como cerrado"}
              {infoSeleccion === "quitar-cerrado" && "Quitar cierre"}
              {infoSeleccion === "abrir-finde" && "Abrir este fin de semana"}
              {infoSeleccion === "quitar-abierto" && "Cerrar de nuevo"}
            </p>
            {(infoSeleccion === "cerrar" || infoSeleccion === "abrir-finde") && (
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
                infoSeleccion === "abrir-finde" ? "Abrir este fin de semana" :
                "Cerrar de nuevo"}
            </button>
          </div>
        )}
      </div>

      {/* Listas */}
      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="font-headline text-base font-bold text-on-surface uppercase tracking-tight">Días cerrados</h2>
          {diasCerrados.length === 0 ? (
            <p className="text-outline/40 text-xs font-body">Ninguno marcado.</p>
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
          <h2 className="font-headline text-base font-bold text-on-surface uppercase tracking-tight">Fines de semana abiertos</h2>
          {diasAbiertos.length === 0 ? (
            <p className="text-outline/40 text-xs font-body">Ninguno marcado.</p>
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
  );
}

function ListItem({ fecha, motivo, color, onDelete }: { fecha: string; motivo: string | null; color: "red" | "green"; onDelete: () => void }) {
  return (
    <div className={`bg-surface-container-low border-l-4 p-3 md:p-4 flex items-center justify-between gap-3 ${color === "red" ? "border-error/40" : "border-green-500/40"}`}>
      <div className="min-w-0">
        <p className="text-on-surface text-xs md:text-sm capitalize font-body truncate">
          {format(parseISO(fecha), "EEE d 'de' MMM 'de' yyyy", { locale: es })}
        </p>
        {motivo && <p className="text-outline text-[10px] mt-0.5 font-body">{motivo}</p>}
      </div>
      <button onClick={onDelete} className={`p-2 shrink-0 text-outline/40 transition-colors ${color === "red" ? "hover:text-error" : "hover:text-green-500"}`}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}
