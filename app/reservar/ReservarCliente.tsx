"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Check, Calendar, Clock } from "lucide-react";
import { BUSINESS } from "@/lib/config";
import "react-day-picker/style.css";

function DayButton({ children, ...props }: DayButtonProps) {
  return (
    <button {...props} style={{ ...props.style, outline: "none", boxShadow: "none" }}>
      {children}
    </button>
  );
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  nota?: string | null;
}

type Paso = "servicio" | "fecha" | "hora" | "datos" | "confirmado";

export default function ReservarCliente() {
  const [paso, setPaso] = useState<Paso>("servicio");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const refFecha = useRef<HTMLElement>(null);
  const refDatos = useRef<HTMLElement>(null);
  const [servicioSel, setServicioSel] = useState<Servicio | null>(null);
  const [fechaSel, setFechaSel] = useState<Date | undefined>();
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [citaId, setCitaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [horario, setHorario] = useState<{ diasSemanaAbiertos: number[]; diasEspecialesAbiertos: string[]; diasEspecialesCerrados: string[] }>({ diasSemanaAbiertos: [], diasEspecialesAbiertos: [], diasEspecialesCerrados: [] });

  // Scroll al siguiente paso cuando avanza el embudo
  useEffect(() => {
    if (paso === "fecha" || paso === "hora") {
      setTimeout(() => refFecha.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else if (paso === "datos") {
      setTimeout(() => refDatos.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [paso]);

  useEffect(() => {
    fetch("/api/servicios").then((r) => r.json()).then(setServicios).catch(() => {});
    fetch("/api/horario").then((r) => r.json()).then(setHorario).catch(() => {});
  }, []);

  useEffect(() => {
    if (!fechaSel || !servicioSel) return;
    setCargandoHoras(true);
    setHoraSel(null);
    fetch(`/api/disponibilidad?fecha=${format(fechaSel, "yyyy-MM-dd")}&duracion=${servicioSel.duracion}`)
      .then((r) => r.json())
      .then((data) => setHorasDisponibles(data.slots ?? []))
      .catch(() => setHorasDisponibles([]))
      .finally(() => setCargandoHoras(false));
  }, [fechaSel, servicioSel]);

  const isDiaDeshabilitado = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    const fechaStr = format(date, "yyyy-MM-dd");
    if (horario.diasEspecialesCerrados.includes(fechaStr)) return true;
    if (horario.diasEspecialesAbiertos.includes(fechaStr)) return false;
    if (!horario.diasSemanaAbiertos.includes(date.getDay())) return true;
    return false;
  };

  const handleConfirmar = async () => {
    if (!servicioSel || !fechaSel || !horaSel || !nombre || !telefono || !aceptaPrivacidad) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicioId: servicioSel.id,
          fecha: format(fechaSel, "yyyy-MM-dd"),
          hora: horaSel,
          nombre,
          telefono,
          email: email || undefined,
          _gotcha: "", // honeypot — siempre vacío en envíos legítimos
        }),
      });
      let data: { id?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Error de conexión. Inténtalo de nuevo.");
      }
      if (!res.ok) throw new Error(data.error ?? "Error al reservar");
      setCitaId(data.id ?? null);
      setPaso("confirmado");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setEnviando(false);
    }
  };

  const pasos = ["Servicio", "Fecha & Hora", "Confirmar"];
  const pasoIdx = paso === "servicio" ? 0 : paso === "fecha" || paso === "hora" ? 1 : 2;

  /* CONFIRMADO */
  if (paso === "confirmado") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full space-y-8">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto">
            <Check size={28} className="text-on-primary" strokeWidth={3} />
          </div>
          <div>
            <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Reserva completada</p>
            <h1 className="font-headline text-4xl font-bold text-on-surface uppercase tracking-tight">Cita Confirmada</h1>
          </div>
          <div className="bg-surface-container-lowest p-8 text-left space-y-4">
            <Row label="Servicio" value={servicioSel?.nombre ?? ""} />
            <Row label="Fecha" value={fechaSel ? format(fechaSel, "EEEE d 'de' MMMM", { locale: es }) : ""} />
            <Row label="Hora" value={horaSel ?? ""} />
            <Row label="Nombre" value={nombre} />
            {email && <Row label="Email" value={email} />}
          </div>
          {email && <p className="text-outline text-xs font-body">Confirmación enviada a tu email.</p>}
          <p className="text-outline/40 text-[10px] uppercase tracking-widest font-label">
            Ref: {citaId?.slice(0, 8).toUpperCase()}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="inline-block border border-outline/30 text-outline font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-primary hover:text-primary transition-all">
              Volver al inicio
            </Link>
            {citaId && (
              <Link href={`/cancelar/${citaId}`} className="inline-block border border-outline/10 text-outline/40 font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-error/40 hover:text-error transition-all">
                Cancelar cita
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="bg-background sticky top-0 z-50 flex justify-between items-center px-8 py-6">
        <Link href="/" className="flex items-center gap-3 text-outline hover:text-on-surface transition-colors">
          <ArrowLeft size={16} />
          <span className="font-headline text-xs uppercase tracking-widest">Volver</span>
        </Link>
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="HL" width={24} height={24} className="invert opacity-80" />
          <span className="font-headline font-black uppercase tracking-tighter text-on-surface hidden sm:block">{BUSINESS.name}</span>
        </div>
        <Link href="/reservar" className="bg-primary text-on-primary px-6 py-2.5 font-headline font-bold uppercase tracking-wider text-xs hover:bg-primary-dim transition-all">
          Reservar cita
        </Link>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-surface-container-high h-0.5 flex">
        <div
          className="bg-primary h-full transition-all duration-500"
          style={{ width: `${((pasoIdx + 1) / 3) * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-24">

            {/* PASO 1: SERVICIO */}
            <section>
              <div className="mb-10">
                <span className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-4 block">Paso 1 · Selección</span>
                <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-on-surface uppercase leading-none">
                  Elige tu<br />Servicio
                </h1>
              </div>
              <div className="space-y-px">
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const different = servicioSel?.id !== s.id;
                      setServicioSel(s);
                      if (paso === "servicio") {
                        setPaso("fecha");
                      } else if (different && paso === "datos") {
                        setHoraSel(null);
                        setPaso("hora");
                      }
                    }}
                    className={`w-full group flex items-center justify-between p-8 md:p-10 cursor-pointer transition-colors duration-300 text-left ${
                      servicioSel?.id === s.id
                        ? "bg-surface-container-high border-l-4 border-primary"
                        : "bg-surface-container-low hover:bg-surface-container-high border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-headline text-xl md:text-2xl font-bold text-on-surface uppercase">{s.nombre}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1.5 text-outline text-[10px] uppercase tracking-widest font-label font-bold">
                          <Clock size={11} /> {s.duracion} min
                        </span>
                        {s.nota && (
                          <span className="bg-primary/10 text-primary px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-tight font-label">
                            {s.nota}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-headline text-3xl md:text-4xl font-bold text-primary ml-8 shrink-0">{s.precio}€</span>
                  </button>
                ))}
              </div>
            </section>

            {/* PASO 2: FECHA & HORA */}
            {(paso === "fecha" || paso === "hora" || paso === "datos") && (
              <section ref={refFecha}>
                <div className="mb-10">
                  <span className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-4 block">Paso 2 · Disponibilidad</span>
                  <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-on-surface uppercase leading-none">
                    Fecha &<br />Hora
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendario */}
                  <div className="bg-surface-container-low p-8">
                    <DayPicker
                      mode="single"
                      selected={fechaSel}
                      onSelect={(d) => { setFechaSel(d); if (d) setPaso("hora"); }}
                      locale={es}
                      disabled={isDiaDeshabilitado}
                      startMonth={new Date()}
                      classNames={{ focused: "rdp-no-focus" }}
                      components={{ DayButton }}
                    />
                  </div>

                  {/* Slots */}
                  <div className="bg-surface-container-lowest p-8 overflow-y-auto max-h-[420px]">
                    <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-6">
                      {fechaSel ? format(fechaSel, "EEEE d 'de' MMMM", { locale: es }) : "Slots disponibles"}
                    </h3>
                    {!fechaSel ? (
                      <p className="text-outline/40 text-xs font-body">Selecciona una fecha primero.</p>
                    ) : cargandoHoras ? (
                      <p className="text-outline/40 text-xs font-body">Cargando disponibilidad...</p>
                    ) : horasDisponibles.length === 0 ? (
                      <div className="space-y-4">
                        <p className="text-outline text-xs font-body">No hay horas disponibles.</p>
                        <button onClick={() => setFechaSel(undefined)} className="text-primary text-xs uppercase tracking-wider hover:underline font-label">
                          Elegir otro día
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="font-label text-[10px] text-outline uppercase tracking-widest border-b border-outline/10 pb-2 mb-3">Mañana</div>
                        {horasDisponibles.filter(h => parseInt(h) < 14).map((h) => (
                          <SlotBtn key={h} hora={h} seleccionado={horaSel === h} onClick={() => { setHoraSel(h); setPaso("datos"); }} />
                        ))}
                        <div className="font-label text-[10px] text-outline uppercase tracking-widest border-b border-outline/10 pb-2 mb-3 mt-5">Tarde</div>
                        {horasDisponibles.filter(h => parseInt(h) >= 16).map((h) => (
                          <SlotBtn key={h} hora={h} seleccionado={horaSel === h} onClick={() => { setHoraSel(h); setPaso("datos"); }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* PASO 3: DATOS */}
            {paso === "datos" && (
              <section ref={refDatos}>
                <div className="mb-10">
                  <span className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-4 block">Paso 3 · Tus datos</span>
                  <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-on-surface uppercase leading-none">
                    Confirmar<br />Identidad
                  </h2>
                </div>
                <form className="space-y-10 max-w-xl" onSubmit={(e) => { e.preventDefault(); handleConfirmar(); }}>
                  <FloatInput label="Nombre Completo *" value={nombre} onChange={setNombre} placeholder="EJ. JUAN GARCÍA" />
                  <FloatInput label="WhatsApp / Teléfono *" value={telefono} onChange={setTelefono} placeholder="+34 600 000 000" type="tel" />
                  <FloatInput label="Email (opcional)" value={email} onChange={setEmail} placeholder="para confirmación" type="email" />

                  {/* Checkbox privacidad */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={aceptaPrivacidad}
                      onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-[var(--color-primary)] shrink-0"
                    />
                    <span className="text-[10px] text-outline uppercase tracking-wider font-label leading-relaxed group-hover:text-on-surface transition-colors">
                      He leído y acepto la{" "}
                      <Link href="/privacidad" target="_blank" className="text-primary underline hover:text-primary-dim">
                        política de privacidad
                      </Link>
                      . Consiento el tratamiento de mis datos para gestionar mi cita. *
                    </span>
                  </label>

                  {error && (
                    <p className="text-error text-sm border-l-4 border-error bg-error-container/10 px-4 py-3 font-body">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!fechaSel || !horaSel || !nombre || !telefono || !aceptaPrivacidad || enviando}
                    className="w-full bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-5 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {enviando ? "Confirmando..." : "Confirmar Cita"}
                  </button>
                  <p className="text-[10px] text-center text-outline uppercase tracking-widest font-label">
                    Cancelación gratuita hasta 24h antes
                  </p>
                </form>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: RESUMEN STICKY */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="bg-surface-container-lowest relative overflow-hidden">
                <div className="h-32 w-full bg-surface-container relative overflow-hidden">
                  <Image src="/logo.png" alt="HL" fill className="object-contain invert opacity-5 p-8" />
                </div>
                <div className="p-8 -mt-8 relative z-10">
                  <h4 className="font-headline text-lg font-bold text-on-surface uppercase tracking-tight mb-8">Resumen de Cita</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-label text-[10px] uppercase text-outline tracking-widest">Servicio</p>
                        <p className="font-headline font-bold text-on-surface uppercase text-sm">
                          {servicioSel?.nombre ?? <span className="text-outline/40">—</span>}
                        </p>
                      </div>
                      <p className="font-headline text-xl font-bold text-primary">
                        {servicioSel ? `${servicioSel.precio}€` : "—"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-label text-[10px] uppercase text-outline tracking-widest">Cuándo</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-primary" />
                        <p className="font-body text-on-surface text-sm capitalize">
                          {fechaSel ? format(fechaSel, "EEEE d 'de' MMMM", { locale: es }) : <span className="text-outline/40">—</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-primary" />
                        <p className="font-body text-on-surface text-sm">
                          {horaSel ? `${horaSel} HRS` : <span className="text-outline/40">—</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-outline/10">
                    {paso === "datos" ? (
                      <button
                        onClick={handleConfirmar}
                        disabled={!fechaSel || !horaSel || !nombre || !telefono || !aceptaPrivacidad || enviando}
                        className="w-full bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-4 hover:bg-primary-dim transition-all disabled:opacity-30"
                      >
                        {enviando ? "Confirmando..." : "Confirmar"}
                      </button>
                    ) : (
                      <div className="w-full bg-surface-container-high py-4 text-center font-headline text-on-surface/20 text-xs uppercase tracking-widest">
                        Completa los pasos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-outline/5 py-8 px-8 text-center flex flex-col items-center gap-2">
        <p className="text-outline/30 text-[10px] uppercase tracking-widest font-label">© {new Date().getFullYear()} {BUSINESS.name}</p>
        <Link href="/privacidad" className="text-outline/30 hover:text-outline text-[10px] uppercase tracking-widest font-label transition-colors">Política de privacidad</Link>
      </footer>
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

function FloatInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div className="group relative">
      <label className="font-label text-[10px] uppercase tracking-[0.3em] text-outline group-focus-within:text-primary transition-colors block mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary px-0 py-3 font-headline text-xl uppercase placeholder:text-surface-container-highest text-on-surface transition-all outline-none"
      />
    </div>
  );
}
