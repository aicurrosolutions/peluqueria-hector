"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
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

type Accion = "ninguna" | "cancelar" | "cambiar";

export default function CancelarCitaPage() {
  const { id } = useParams<{ id: string }>();
  const [cita, setCita] = useState<DatosCita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [accion, setAccion] = useState<Accion>("ninguna");
  const [resultado, setResultado] = useState<"cancelado" | "modificado" | null>(null);

  // Cancelar
  const [telefonoCancelar, setTelefonoCancelar] = useState("");
  const [enviandoCancelar, setEnviandoCancelar] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState("");

  // Cambiar — pasos
  const [horario, setHorario] = useState<{ diasSemanaAbiertos: number[]; diasEspecialesAbiertos: string[]; diasEspecialesCerrados: string[] }>({ diasSemanaAbiertos: [], diasEspecialesAbiertos: [], diasEspecialesCerrados: [] });
  const [fechaSel, setFechaSel] = useState<Date | undefined>();
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [confirmarVisible, setConfirmarVisible] = useState(false);

  // Confirmar cambio
  const [telefonoCambiar, setTelefonoCambiar] = useState("");
  const [enviandoCambiar, setEnviandoCambiar] = useState(false);
  const [errorCambiar, setErrorCambiar] = useState("");

  // Refs para auto-scroll
  const refAccion = useRef<HTMLDivElement>(null);
  const refSlots = useRef<HTMLDivElement>(null);
  const refConfirmar = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  useEffect(() => {
    fetch(`/api/cancelar/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setErrorCarga(data.error);
        else setCita(data);
      })
      .catch(() => setErrorCarga("No se pudo cargar la cita"))
      .finally(() => setCargando(false));

    fetch("/api/horario").then((r) => r.json()).then(setHorario).catch(() => {});
  }, [id]);

  // Scroll a sección de acción cuando el usuario elige
  useEffect(() => {
    if (accion !== "ninguna") scrollTo(refAccion);
  }, [accion]);

  // Cargar slots al seleccionar fecha
  useEffect(() => {
    if (!fechaSel || !cita) return;
    setCargandoSlots(true);
    setHoraSel(null);
    setConfirmarVisible(false);
    fetch(`/api/disponibilidad?fecha=${format(fechaSel, "yyyy-MM-dd")}&duracion=${cita.duracion}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => {
        setCargandoSlots(false);
        scrollTo(refSlots);
      });
  }, [fechaSel, cita]);

  // Scroll a confirmar cuando elige hora
  useEffect(() => {
    if (horaSel) {
      setConfirmarVisible(true);
      scrollTo(refConfirmar);
    }
  }, [horaSel]);

  const isDiaDeshabilitado = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    const fechaStr = format(date, "yyyy-MM-dd");
    if (horario.diasEspecialesCerrados.includes(fechaStr)) return true;
    if (horario.diasEspecialesAbiertos.includes(fechaStr)) return false;
    if (!horario.diasSemanaAbiertos.includes(date.getDay())) return true;
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
      else setResultado("cancelado");
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
      else setResultado("modificado");
    } catch {
      setErrorCambiar("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setEnviandoCambiar(false);
    }
  };

  /* ─── RESULTADO FINAL ─── */
  if (resultado === "cancelado") {
    return (
      <PageShell>
        <div className="text-center space-y-6">
          <div className="w-14 h-14 bg-surface-container flex items-center justify-center mx-auto">
            <Check size={24} className="text-primary" strokeWidth={3} />
          </div>
          <div>
            <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-2">Cancelación confirmada</p>
            <h1 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">Cita cancelada</h1>
          </div>
          <p className="text-outline text-sm font-body">Tu cita ha sido cancelada. Puedes reservar una nueva cuando quieras.</p>
          <Link href="/reservar" className="inline-block bg-primary text-on-primary font-headline font-bold tracking-widest uppercase px-8 py-4 text-xs hover:bg-primary-dim transition-all">
            Reservar nueva cita
          </Link>
        </div>
      </PageShell>
    );
  }

  if (resultado === "modificado" && cita) {
    return (
      <PageShell>
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
          <p className="text-outline text-xs font-body">Confirmación enviada a tu email si lo tenías registrado.</p>
          <Link href="/" className="inline-block border border-outline/30 text-outline font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-primary hover:text-primary transition-all">
            Volver al inicio
          </Link>
        </div>
      </PageShell>
    );
  }

  /* ─── PÁGINA PRINCIPAL ─── */
  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <nav className="border-b border-outline/5 px-8 py-5 flex justify-between items-center sticky top-0 z-50 bg-background">
        <Link href="/" className="font-headline font-black uppercase tracking-tighter text-on-surface hover:text-primary transition-colors text-sm">
          {BUSINESS.name}
        </Link>
        <Link href="/reservar" className="bg-primary text-on-primary px-4 py-2 font-headline font-bold uppercase tracking-wider text-xs hover:bg-primary-dim transition-all">
          Nueva cita
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-16 space-y-16">

        {/* ── CARGANDO ── */}
        {cargando && (
          <p className="text-outline text-xs uppercase tracking-widest font-label text-center animate-pulse">Cargando...</p>
        )}

        {/* ── ERROR ── */}
        {!cargando && !cita && errorCarga && (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 bg-error/10 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} className="text-error" />
            </div>
            <p className="text-error text-sm font-body">{errorCarga}</p>
            <Link href="/" className="inline-block border border-outline/30 text-outline font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-primary hover:text-primary transition-all">
              Volver al inicio
            </Link>
          </div>
        )}

        {/* ── PASO 1: RESUMEN + OPCIONES ── */}
        {!cargando && cita && (
          <section>
            <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Gestionar reserva</p>
            <h1 className="font-headline text-4xl font-bold text-on-surface uppercase tracking-tight mb-8">Tu cita</h1>

            <div className="bg-surface-container-lowest p-6 space-y-3 mb-8">
              <Row label="Nombre" value={cita.nombre} />
              <Row label="Servicio" value={cita.servicio} />
              <Row label="Fecha" value={format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })} />
              <Row label="Hora" value={cita.hora} />
            </div>

            <p className="text-outline/60 text-[10px] uppercase tracking-widest font-label flex items-start gap-2 mb-6">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              Cambios y cancelaciones solo con más de 24h de antelación
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setAccion("cambiar"); setFechaSel(undefined); setHoraSel(null); setConfirmarVisible(false); }}
                className={`w-full flex items-center justify-center gap-2 font-headline font-bold uppercase tracking-[0.2em] py-4 transition-all text-sm ${
                  accion === "cambiar"
                    ? "bg-primary text-on-primary"
                    : "bg-primary text-on-primary hover:bg-primary-dim"
                }`}
              >
                <Calendar size={14} />
                Cambiar fecha u hora
              </button>
              <button
                onClick={() => setAccion("cancelar")}
                className={`w-full flex items-center justify-center gap-2 font-headline font-bold uppercase tracking-[0.2em] py-4 transition-all text-sm border ${
                  accion === "cancelar"
                    ? "border-error bg-error/5 text-error"
                    : "border-error/40 text-error hover:bg-error/5"
                }`}
              >
                <X size={14} />
                Cancelar cita
              </button>
            </div>
          </section>
        )}

        {/* ── PASO 2A: CANCELAR ── */}
        {accion === "cancelar" && cita && (
          <section ref={refAccion} className="space-y-6 pt-4">
            <button onClick={() => setAccion("ninguna")} className="flex items-center gap-2 text-outline hover:text-on-surface transition-colors text-xs uppercase tracking-widest font-label">
              <ArrowLeft size={13} /> Volver
            </button>
            <div>
              <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Cancelar reserva</p>
              <h2 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">¿Seguro que quieres cancelar?</h2>
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
                <p className="text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3 font-body">{errorCancelar}</p>
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
          </section>
        )}

        {/* ── PASO 2B: CALENDARIO ── */}
        {accion === "cambiar" && cita && (
          <section ref={refAccion} className="space-y-6 pt-4">
            <button onClick={() => setAccion("ninguna")} className="flex items-center gap-2 text-outline hover:text-on-surface transition-colors text-xs uppercase tracking-widest font-label">
              <ArrowLeft size={13} /> Volver
            </button>
            <div>
              <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Paso 2 · Nueva fecha</p>
              <h2 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">Elige el día</h2>
            </div>
            <div className="bg-surface-container-low p-6">
              <DayPicker
                mode="single"
                selected={fechaSel}
                onSelect={(d) => setFechaSel(d)}
                locale={es}
                disabled={isDiaDeshabilitado}
                startMonth={new Date()}
                classNames={{ focused: "rdp-no-focus" }}
                components={{ DayButton }}
              />
            </div>
          </section>
        )}

        {/* ── PASO 3: SLOTS ── */}
        {accion === "cambiar" && fechaSel && (
          <section ref={refSlots} className="space-y-6 pt-4">
            <div>
              <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Paso 3 · Nueva hora</p>
              <h2 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight capitalize">
                {format(fechaSel, "EEEE d 'de' MMMM", { locale: es })}
              </h2>
            </div>

            {cargandoSlots ? (
              <p className="text-outline/40 text-xs font-body animate-pulse">Cargando disponibilidad...</p>
            ) : slots.length === 0 ? (
              <div className="space-y-4">
                <p className="text-outline text-sm font-body">No hay horas disponibles ese día.</p>
                <button onClick={() => setFechaSel(undefined)} className="text-primary text-xs uppercase tracking-wider hover:underline font-label">
                  Elegir otro día
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.filter((h) => parseInt(h) < 14).length > 0 && (
                  <>
                    <div className="font-label text-[10px] text-outline uppercase tracking-widest border-b border-outline/10 pb-2">Mañana</div>
                    {slots.filter((h) => parseInt(h) < 14).map((h) => (
                      <SlotBtn key={h} hora={h} seleccionado={horaSel === h} onClick={() => setHoraSel(h)} />
                    ))}
                  </>
                )}
                {slots.filter((h) => parseInt(h) >= 16).length > 0 && (
                  <>
                    <div className="font-label text-[10px] text-outline uppercase tracking-widest border-b border-outline/10 pb-2 mt-4">Tarde</div>
                    {slots.filter((h) => parseInt(h) >= 16).map((h) => (
                      <SlotBtn key={h} hora={h} seleccionado={horaSel === h} onClick={() => setHoraSel(h)} />
                    ))}
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── PASO 4: CONFIRMAR CAMBIO ── */}
        {accion === "cambiar" && confirmarVisible && fechaSel && horaSel && cita && (
          <section ref={refConfirmar} className="space-y-6 pt-4">
            <div>
              <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Paso 4 · Confirmar</p>
              <h2 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">Verifica tu identidad</h2>
            </div>

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
                <p className="text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3 font-body">{errorCambiar}</p>
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
          </section>
        )}

      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <nav className="border-b border-outline/5 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="font-headline font-black uppercase tracking-tighter text-on-surface hover:text-primary transition-colors text-sm">
          {BUSINESS.name}
        </Link>
        <Link href="/reservar" className="bg-primary text-on-primary px-4 py-2 font-headline font-bold uppercase tracking-wider text-xs hover:bg-primary-dim transition-all">
          Nueva cita
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function SlotBtn({ hora, seleccionado, onClick }: { hora: string; seleccionado: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-4 font-headline font-bold text-center transition-all text-sm uppercase tracking-wider ${
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
