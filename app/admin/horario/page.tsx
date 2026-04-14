"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Save, Check } from "lucide-react";

interface Franja { id?: string; inicio: string; fin: string; }
interface Dia { diaSemana: number; nombre: string; franjas: Franja[]; }

export default function HorarioPage() {
  const [dias, setDias] = useState<Dia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState<number | null>(null);
  const [guardado, setGuardado] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/horario")
      .then((r) => r.json())
      .then((data) => setDias(data.dias ?? []))
      .catch(() => setError("Error al cargar el horario"))
      .finally(() => setCargando(false));
  }, []);

  const addFranja = (diaSemana: number) => {
    setDias((prev) =>
      prev.map((d) =>
        d.diaSemana === diaSemana
          ? { ...d, franjas: [...d.franjas, { inicio: "09:00", fin: "14:00" }] }
          : d
      )
    );
  };

  const removeFranja = (diaSemana: number, idx: number) => {
    setDias((prev) =>
      prev.map((d) =>
        d.diaSemana === diaSemana
          ? { ...d, franjas: d.franjas.filter((_, i) => i !== idx) }
          : d
      )
    );
  };

  const updateFranja = (diaSemana: number, idx: number, campo: "inicio" | "fin", valor: string) => {
    setDias((prev) =>
      prev.map((d) =>
        d.diaSemana === diaSemana
          ? { ...d, franjas: d.franjas.map((f, i) => (i === idx ? { ...f, [campo]: valor } : f)) }
          : d
      )
    );
  };

  const guardarDia = async (dia: Dia) => {
    setGuardando(dia.diaSemana);
    setError(null);
    try {
      const res = await fetch("/api/admin/horario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaSemana: dia.diaSemana, franjas: dia.franjas }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setGuardado(dia.diaSemana);
      setTimeout(() => setGuardado(null), 2000);
    } catch {
      setError("Error al guardar. Inténtalo de nuevo.");
    } finally {
      setGuardando(null);
    }
  };

  // Mostrar días en orden: Lunes (1) → Domingo (0)
  const diasOrdenados = [
    ...(dias.filter((d) => d.diaSemana !== 0).sort((a, b) => a.diaSemana - b.diaSemana)),
    ...(dias.filter((d) => d.diaSemana === 0)),
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-primary font-label text-[10px] uppercase tracking-[0.4em] mb-2">Panel de control</p>
          <h1 className="font-headline text-4xl font-bold text-on-surface uppercase tracking-tight">Horario</h1>
        </div>
        <div className="flex items-center gap-2 text-outline text-xs font-label uppercase tracking-widest">
          <Clock size={14} />
          Horario semanal
        </div>
      </div>

      {error && (
        <p className="text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3 font-body mb-6">{error}</p>
      )}

      {cargando ? (
        <p className="text-outline text-xs uppercase tracking-widest font-label animate-pulse">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {diasOrdenados.map((dia) => {
            const cerrado = dia.franjas.length === 0;
            const esGuardando = guardando === dia.diaSemana;
            const esGuardado = guardado === dia.diaSemana;

            return (
              <div key={dia.diaSemana} className="bg-surface-container-low">
                {/* Cabecera del día */}
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-outline/5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Nombre + estado */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
                        {dia.nombre}
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest font-label shrink-0 ${cerrado ? "text-outline/40" : "text-primary"}`}>
                        {cerrado ? "Cerrado" : `${dia.franjas.length} franja${dia.franjas.length > 1 ? "s" : ""}`}
                      </span>
                    </div>
                    {/* Botones — icono solo en móvil, texto completo en md+ */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => addFranja(dia.diaSemana)}
                        className="flex items-center gap-1 text-outline hover:text-primary transition-colors text-[10px] uppercase tracking-widest font-label px-2.5 py-2 md:px-3 border border-outline/20 hover:border-primary/40"
                        title="Añadir franja"
                      >
                        <Plus size={11} />
                        <span className="hidden md:inline">Añadir franja</span>
                      </button>
                      <button
                        onClick={() => guardarDia(dia)}
                        disabled={esGuardando}
                        className={`flex items-center gap-1 px-2.5 py-2 md:px-4 font-headline font-bold text-[10px] uppercase tracking-widest transition-all ${
                          esGuardado
                            ? "bg-green-700/20 text-green-500"
                            : "bg-primary text-on-primary hover:bg-primary-dim"
                        } disabled:opacity-40`}
                        title={esGuardando ? "Guardando..." : esGuardado ? "Guardado" : "Guardar"}
                      >
                        {esGuardado ? <Check size={11} /> : <Save size={11} />}
                        <span className="hidden md:inline">
                          {esGuardando ? "Guardando..." : esGuardado ? "Guardado" : "Guardar"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Franjas horarias */}
                {dia.franjas.length > 0 && (
                  <div className="px-4 md:px-6 py-4 space-y-3">
                    {dia.franjas.map((franja, idx) => (
                      <div key={idx} className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-2 md:gap-3 flex-1">
                          <label className="text-[10px] uppercase tracking-widest text-outline font-label w-10 md:w-12 shrink-0">Desde</label>
                          <input
                            type="time"
                            value={franja.inicio}
                            onChange={(e) => updateFranja(dia.diaSemana, idx, "inicio", e.target.value)}
                            className="bg-surface-container-high border-0 border-b border-outline focus:border-primary px-2 md:px-3 py-2 font-headline text-sm text-on-surface outline-none transition-all w-full max-w-[120px]"
                          />
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 flex-1">
                          <label className="text-[10px] uppercase tracking-widest text-outline font-label w-10 md:w-12 shrink-0">Hasta</label>
                          <input
                            type="time"
                            value={franja.fin}
                            onChange={(e) => updateFranja(dia.diaSemana, idx, "fin", e.target.value)}
                            className="bg-surface-container-high border-0 border-b border-outline focus:border-primary px-2 md:px-3 py-2 font-headline text-sm text-on-surface outline-none transition-all w-full max-w-[120px]"
                          />
                        </div>
                        <button
                          onClick={() => removeFranja(dia.diaSemana, idx)}
                          className="text-outline/40 hover:text-error transition-colors shrink-0"
                          title="Eliminar franja"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {cerrado && (
                  <div className="px-6 py-4">
                    <p className="text-outline/30 text-[10px] uppercase tracking-widest font-label">
                      Sin franjas — este día aparece como cerrado
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
