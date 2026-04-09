"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { BUSINESS } from "@/lib/config";
import { X, Check, AlertTriangle } from "lucide-react";

interface DatosCita {
  id: string;
  nombre: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
}

export default function CancelarCitaPage() {
  const { id } = useParams<{ id: string }>();
  const [cita, setCita] = useState<DatosCita | null>(null);
  const [cargando, setCargando] = useState(true);
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<"ok" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/cancelar/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setErrorMsg(data.error);
        else setCita(data);
      })
      .catch(() => setErrorMsg("No se pudo cargar la cita"))
      .finally(() => setCargando(false));
  }, [id]);

  const handleCancelar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/cancelar/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Error al cancelar");
      } else {
        setResultado("ok");
      }
    } catch {
      setErrorMsg("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-outline/5 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="font-headline font-black uppercase tracking-tighter text-on-surface hover:text-primary transition-colors text-sm">
          {BUSINESS.name}
        </Link>
        <Link href="/reservar" className="bg-primary text-on-primary px-4 py-2 font-headline font-bold uppercase tracking-wider text-xs hover:bg-primary-dim transition-all">
          Nueva cita
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">

          {/* Cargando */}
          {cargando && (
            <p className="text-outline text-xs uppercase tracking-widest font-label text-center animate-pulse">
              Cargando...
            </p>
          )}

          {/* Error al cargar */}
          {!cargando && !cita && errorMsg && (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-error/10 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="text-error" />
              </div>
              <p className="text-error text-sm font-body">{errorMsg}</p>
              <Link href="/" className="inline-block border border-outline/30 text-outline font-headline font-bold tracking-widest uppercase px-8 py-3 text-xs hover:border-primary hover:text-primary transition-all">
                Volver al inicio
              </Link>
            </div>
          )}

          {/* Cancelación exitosa */}
          {resultado === "ok" && (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 bg-surface-container flex items-center justify-center mx-auto">
                <Check size={24} className="text-primary" strokeWidth={3} />
              </div>
              <div>
                <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-2">Cancelación confirmada</p>
                <h1 className="font-headline text-3xl font-bold text-on-surface uppercase tracking-tight">Cita cancelada</h1>
              </div>
              <p className="text-outline text-sm font-body">
                Tu cita ha sido cancelada correctamente. Puedes reservar una nueva cita cuando quieras.
              </p>
              <Link href="/reservar" className="inline-block bg-primary text-on-primary font-headline font-bold tracking-widest uppercase px-8 py-4 text-xs hover:bg-primary-dim transition-all">
                Reservar nueva cita
              </Link>
            </div>
          )}

          {/* Formulario de cancelación */}
          {!cargando && cita && resultado === null && (
            <div className="space-y-8">
              <div>
                <p className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3">Cancelar reserva</p>
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface uppercase tracking-tight">
                  ¿Seguro que quieres cancelar?
                </h1>
              </div>

              {/* Resumen de la cita */}
              <div className="bg-surface-container-lowest p-6 space-y-3">
                <Row label="Nombre" value={cita.nombre} />
                <Row label="Servicio" value={cita.servicio} />
                <Row label="Fecha" value={format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })} />
                <Row label="Hora" value={cita.hora} />
              </div>

              <p className="text-outline/60 text-[10px] uppercase tracking-widest font-label flex items-start gap-2">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                Solo puedes cancelar con más de 24h de antelación
              </p>

              <form onSubmit={handleCancelar} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-outline font-label block">
                    Confirma tu teléfono para verificar *
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+34 600 000 000"
                    required
                    className="w-full bg-transparent border-0 border-b border-outline focus:ring-0 focus:border-primary px-0 py-3 font-headline text-xl uppercase placeholder:text-outline/20 text-on-surface transition-all outline-none"
                  />
                </div>

                {errorMsg && (
                  <p className="text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3 font-body">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={!telefono || enviando}
                    className="flex-1 flex items-center justify-center gap-2 bg-error text-white font-headline font-bold uppercase tracking-[0.2em] py-4 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  >
                    <X size={14} />
                    {enviando ? "Cancelando..." : "Confirmar cancelación"}
                  </button>
                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center border border-outline/30 text-outline font-headline font-bold uppercase tracking-wider py-4 text-xs hover:border-outline hover:text-on-surface transition-all"
                  >
                    Volver
                  </Link>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </main>
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
