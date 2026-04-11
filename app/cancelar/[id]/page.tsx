"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { format, parseISO, isBefore, startOfDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { BUSINESS } from "@/lib/config";
import { X, Check, AlertTriangle, Calendar, ArrowLeft } from "lucide-react";
import "react-day-picker/style.css";

function DayButton({ children, ...props }: DayButtonProps) {
  return (
    <button {...props} style={{ ...props.style, outline: "none", boxShadow: "none" }}>
      {children}
    </button>
  );
}

interface DatosCita {
  id: string;
  nombre: string;
  servicio: string;
  duracion: number;
  fecha: string;
  hora: string;
  estado: string;
}

type Modo =
  | "inicio"
  | "cancelar"
  | "cambiar-fecha"
  | "cambiar-confirmar"
  | "ok-cancelado"
  | "ok-modificado";

export default function CancelarCitaPage() {
  const { id } = useParams<{ id: string }>();
  const [cita, setCita] = useState<DatosCita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [modo, setModo] = useState<Modo>("inicio");

  // Cancelar
  const [telefonoCancelar, setTelefonoCancelar] = useState("");
  const [enviandoCancelar, setEnviandoCancelar] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState("");

  // Cambiar fecha
  const [diasAbiertos, setDiasAbiertos] = useState<Date[]>([]);
  const [fechaSel, setFechaSel] = useState<Date | undefined>();
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // Confirmar cambio
  const [telefonoCambiar, setTelefonoCambiar] = useState("");
  const [enviandoCambiar, setEnviandoCambiar] = useState(false);
  const [errorCambiar, setErrorCambiar] = useState("");

  useEffect(() => {
    fetch(`/api/cancelar/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setErrorCarga(data.error);
        else setCita(data);
      })
      .catch(() => setErrorCarga("No se pudo cargar la cita"))
      .finally(() => setCargando(false));

    fetch("/api/dias-abiertos")
      .then((r) => r.json())
      .then((data: { fecha: string }[]) =>
        setDiasAbiertos(data.map((d) => parseISO(d.fecha)))
      )
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!fechaSel || !cita) return;
    setCargandoSlots(true);
    setHoraSel(null);
    fetch(`/api/disponibilidad?fecha=${format(fechaSel, "yyyy-MM-dd")}&duracion=${cita.duracion}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setCargandoSlots(false));
  }, [fechaSel, cita]);

  const isDiaDeshabilitado = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    const esFinde = date.getDay() === 0 || date.getDay() === 6;
    if (esFinde && !diasAbiertos.some((d) => isSameDay(d, date))) return true;
    return false;
  };

  const handleCancelar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoCancelar(true);
    setErrorCancelar("");
    try {
      const res = await fetch(`/api/cancelar/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: telefonoCancelar }),
      });
      const data = await res.json();
      if (!res.ok) setErrorCancelar(data.error ?? "Error al cancelar");
      else setModo("ok-cancelado");
    } catch {
      setErrorCancelar("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setEnviandoCancelar(false);
    }
  };

  const handleConfirmarCambio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaSel || !horaSel) return;
    setEnviandoCambiar(true);
    setErrorCambiar("");
    try {
      const res = await fetch(`/api/cancelar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: telefonoCambiar,
          fecha: format(fechaSel, "yyyy-MM-dd"),
          hora: horaSel,
        }),
      });
      const data = await res.json();
      if (!res.ok) setErrorCambiar(data.error ?? "Error al modificar");
      else setModo("ok-modificado");
    } catch {
      setErrorCambiar("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setEnviandoCambiar(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-outline/5 px-8 py-5 flex justify-between items-center">
        <Link
          href="/"
          className="font-headline font-black uppercase tracking-tighter text-on-surface hover:text-primary transition-colors text-sm"
        >
          {BUSINESS.name}
        </Link>
        <Link
          href="/reservar"
          className="bg-primary text-on-primary px-4 py-2 font-headline font-bold uppercase tracking-wider text-xs hover:bg-primary-dim transition-all"
        >
          Nueva cita
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg space-y-8">

          {/* Cargando */}
          {cargando && (
            <p className="text-outline text-xs uppercase tracking-widest font-label text-center animate-pulse">
              Cargando...
            </p>
          )}

          {/* Error al cargar */}
          {!cargando && !cita && errorCarga && (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-error/10 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="text-error" />
              </div>
              <p className="text-error text-sm font-body">{errorCarga}</p>
              <Link
                href="/"
                className="inline-block border border-outline/30 text-outline font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-primary hover:text-primary transition-all"
              >
                Volver al inicio
              </Link>
            </div>
          )}

          {/* CANCELACIÓN EXITOSA */}
          {modo === "ok-cancelado" && (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-surface-container flex items-center justify-center mx-auto">
                <Check size={24} className="text-primary" strokeWidth={3} />
              </div>
              <div>
                <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-2">Cancelación confirmada</p>
                <h1 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">Cita cancelada</h1>
              </div>
              <p className="text-outline text-sm font-body">
                Tu cita ha sido cancelada correctamente. Puedes reservar una nueva cuando quieras.
              </p>
              <Link
                href="/reservar"
                className="inline-block bg-primary text-on-primary font-headline font-bold tracking-widest uppercase px-8 py-4 text-xs hover:bg-primary-dim transition-all"
              >
                Reservar nueva cita
              </Link>
            </div>
          )}

          {/* MODIFICACIÓN EXITOSA */}
          {modo === "ok-modificado" && cita && (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-surface-container flex items-center justify-center mx-auto">
                <Check size={24} className="text-primary" strokeWidth={3} />
              </div>
              <div>
                <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-2">Cambio confirmado</p>
                <h1 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">Cita modificada</h1>
              </div>
              <div className="bg-surface-container-lowest p-6 text-left space-y-3">
                <Row label="Servicio" value={cita.servicio} />
                <Row label="Nueva fecha" value={fechaSel ? format(fechaSel, "EEEE d 'de' MMMM", { locale: es }) : ""} />
                <Row label="Nueva hora" value={horaSel ?? ""} />
              </div>
              {cita && <p className="text-outline text-xs font-body">Se ha enviado confirmación a tu email si lo tenías registrado.</p>}
              <Link
                href="/"
                className="inline-block border border-outline/30 text-outline font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-primary hover:text-primary transition-all"
              >
                Volver al inicio
              </Link>
            </div>
          )}

          {/* VISTA PRINCIPAL */}
          {!cargando && cita && (modo === "inicio" || modo === "cancelar" || modo === "cambiar-fecha" || modo === "cambiar-confirmar") && (
            <div className="space-y-8">

              {/* Back link (solo si no está en inicio) */}
              {modo !== "inicio" && (
                <button
                  onClick={() => {
                    if (modo === "cambiar-confirmar") setModo("cambiar-fecha");
                    else setModo("inicio");
                  }}
                  className="flex items-center gap-2 text-outline hover:text-on-surface transition-colors text-xs uppercase tracking-widest font-label"
                >
                  <ArrowLeft size={13} /> Volver
                </button>
              )}

              {/* Header */}
              {modo === "inicio" && (
                <div>
                  <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Gestionar reserva</p>
                  <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface uppercase tracking-tight">
                    Tu cita
                  </h1>
                </div>
              )}

              {/* Resumen de la cita (siempre visible salvo confirmar cambio) */}
              {modo !== "cambiar-confirmar" && (
                <div className="bg-surface-container-lowest p-6 space-y-3">
                  <Row label="Nombre" value={cita.nombre} />
                  <Row label="Servicio" value={cita.servicio} />
                  <Row label="Fecha" value={format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })} />
                  <Row label="Hora" value={cita.hora} />
                </div>
              )}

              {/* ── MODO INICIO: dos opciones ── */}
              {modo === "inicio" && (
                <div className="space-y-3">
                  <p className="text-outline/60 text-[10px] uppercase tracking-widest font-label flex items-start gap-2">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                    Cambios y cancelaciones solo con más de 24h de antelación
                  </p>
                  <button
                    onClick={() => setModo("cambiar-fecha")}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-4 hover:bg-primary-dim transition-all text-sm"
                  >
                    <Calendar size={14} />
                    Cambiar fecha u hora
                  </button>
                  <button
                    onClick={() => setModo("cancelar")}
                    className="w-full flex items-center justify-center gap-2 border border-error/40 text-error font-headline font-bold uppercase tracking-[0.2em] py-4 hover:bg-error/5 transition-all text-sm"
                  >
                    <X size={14} />
                    Cancelar cita
                  </button>
                </div>
              )}

              {/* ── MODO CANCELAR ── */}
              {modo === "cancelar" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Cancelar reserva</p>
                    <h2 className="font-headline text-2xl font-bold text-on-surface uppercase tracking-tight">
                      ¿Seguro que quieres cancelar?
                    </h2>
                  </div>
                  <form onSubmit={handleCancelar} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-outline font-label block">
                        Confirma tu teléfono para verificar *
                      </label>
                      <input
                        type="tel"
                        value={telefonoCancelar}
                        onChange={(e) => setTelefonoCancelar(e.target.value)}
                        placeholder="+34 600 000 000"
                        required
                        className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary px-0 py-3 font-headline text-xl uppercase placeholder:text-outline/20 text-on-surface transition-all outline-none"
                      />
                    </div>
                    {errorCancelar && (
                      <p className="text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3 font-body">
                        {errorCancelar}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={!telefonoCancelar || enviandoCancelar}
                      className="w-full flex items-center justify-center gap-2 bg-error text-white font-headline font-bold uppercase tracking-[0.2em] py-4 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    >
                      <X size={14} />
                      {enviandoCancelar ? "Cancelando..." : "Confirmar cancelación"}
                    </button>
                  </form>
                </div>
              )}

              {/* ── MODO CAMBIAR FECHA ── */}
              {modo === "cambiar-fecha" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Cambiar cita</p>
                    <h2 className="font-headline text-2xl font-bold text-on-surface uppercase tracking-tight">
                      Elige nueva fecha y hora
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Calendario */}
                    <div className="bg-surface-container-low p-4">
                      <DayPicker
                        mode="single"
                        selected={fechaSel}
                        onSelect={(d) => { setFechaSel(d); setHoraSel(null); }}
                        locale={es}
                        disabled={isDiaDeshabilitado}
                        startMonth={new Date()}
                        classNames={{ focused: "rdp-no-focus" }}
                        components={{ DayButton }}
                      />
                    </div>

                    {/* Slots */}
                    <div className="bg-surface-container-lowest p-6 overflow-y-auto max-h-80">
                      <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-4">
                        {fechaSel
                          ? format(fechaSel, "EEEE d 'de' MMMM", { locale: es })
                          : "Slots disponibles"}
                      </h3>
                      {!fechaSel ? (
                        <p className="text-outline/40 text-xs font-body">Selecciona una fecha.</p>
                      ) : cargandoSlots ? (
                        <p className="text-outline/40 text-xs font-body animate-pulse">Cargando...</p>
                      ) : slots.length === 0 ? (
                        <div className="space-y-3">
                          <p className="text-outline text-xs font-body">Sin disponibilidad ese día.</p>
                          <button
                            onClick={() => setFechaSel(undefined)}
                            className="text-primary text-xs uppercase tracking-wider hover:underline font-label"
                          >
                            Elegir otro día
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {slots.filter((h) => parseInt(h) < 14).length > 0 && (
                            <>
                              <div className="font-label text-[10px] text-outline uppercase tracking-widest border-b border-outline/10 pb-1 mb-2">Mañana</div>
                              {slots.filter((h) => parseInt(h) < 14).map((h) => (
                                <SlotBtn key={h} hora={h} seleccionado={horaSel === h} onClick={() => setHoraSel(h)} />
                              ))}
                            </>
                          )}
                          {slots.filter((h) => parseInt(h) >= 16).length > 0 && (
                            <>
                              <div className="font-label text-[10px] text-outline uppercase tracking-widest border-b border-outline/10 pb-1 mb-2 mt-4">Tarde</div>
                              {slots.filter((h) => parseInt(h) >= 16).map((h) => (
                                <SlotBtn key={h} hora={h} seleccionado={horaSel === h} onClick={() => setHoraSel(h)} />
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={!fechaSel || !horaSel}
                    onClick={() => setModo("cambiar-confirmar")}
                    className="w-full bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-4 hover:bg-primary-dim transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {/* ── MODO CONFIRMAR CAMBIO ── */}
              {modo === "cambiar-confirmar" && fechaSel && horaSel && cita && (
                <div className="space-y-6">
                  <div>
                    <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Confirmar cambio</p>
                    <h2 className="font-headline text-2xl font-bold text-on-surface uppercase tracking-tight">
                      Verifica tu identidad
                    </h2>
                  </div>

                  {/* Resumen del cambio */}
                  <div className="bg-surface-container-lowest p-6 space-y-3">
                    <Row label="Servicio" value={cita.servicio} />
                    <Row label="Nueva fecha" value={format(fechaSel, "EEEE d 'de' MMMM", { locale: es })} />
                    <Row label="Nueva hora" value={horaSel} />
                  </div>

                  <form onSubmit={handleConfirmarCambio} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-outline font-label block">
                        Confirma tu teléfono *
                      </label>
                      <input
                        type="tel"
                        value={telefonoCambiar}
                        onChange={(e) => setTelefonoCambiar(e.target.value)}
                        placeholder="+34 600 000 000"
                        required
                        className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary px-0 py-3 font-headline text-xl uppercase placeholder:text-outline/20 text-on-surface transition-all outline-none"
                      />
                    </div>
                    {errorCambiar && (
                      <p className="text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3 font-body">
                        {errorCambiar}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={!telefonoCambiar || enviandoCambiar}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-4 hover:bg-primary-dim transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                    >
                      <Check size={14} />
                      {enviandoCambiar ? "Guardando..." : "Confirmar cambio"}
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SlotBtn({ hora, seleccionado, onClick }: { hora: string; seleccionado: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 font-headline font-bold text-center transition-all text-sm uppercase tracking-wider ${
        seleccionado
          ? "bg-primary text-on-primary"
          : "bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary"
      }`}
    >
      {hora}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-outline/5 pb-3">
      <span className="text-[10px] text-outline uppercase tracking-widest font-label">{label}</span>
      <span className="text-sm text-on-surface font-body capitalize">{value}</span>
    </div>
  );
}
