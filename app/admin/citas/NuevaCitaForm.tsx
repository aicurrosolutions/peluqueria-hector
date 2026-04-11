"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, UserCheck, Clock } from "lucide-react";

interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
}

interface ClienteSugerido {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
}

export default function NuevaCitaForm({
  servicios,
  fechaDefault,
  horaDefault = "",
  onCreada,
}: {
  servicios: Servicio[];
  fechaDefault: string;
  horaDefault?: string;
  onCreada?: () => void;
}) {
  const [servicioId, setServicioId] = useState(servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState(fechaDefault);
  const [hora, setHora] = useState(horaDefault);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Slots disponibles
  const [slots, setSlots] = useState<string[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // Autocomplete de clientes
  const [sugerencias, setSugerencias] = useState<ClienteSugerido[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteSugerido | null>(null);
  const [buscando, setBuscando] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Servicio actualmente seleccionado (para leer duración)
  const servicioActual = servicios.find((s) => s.id === servicioId);

  // ── Cargar slots cuando cambia fecha o servicio ──────────────────
  useEffect(() => {
    if (!fecha || !servicioActual) return;

    const controller = new AbortController();
    setCargandoSlots(true);

    fetch(
      `/api/disponibilidad?fecha=${fecha}&duracion=${servicioActual.duracion}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { slots: string[] }) => {
        const nuevos = data.slots ?? [];
        setSlots(nuevos);
        // Mantener hora si sigue disponible (ej. horaDefault pre-cargada); si no, resetear
        setHora((h) => (nuevos.includes(h) ? h : ""));
      })
      .catch((e) => {
        if (e.name !== "AbortError") { setSlots([]); setHora(""); }
      })
      .finally(() => setCargandoSlots(false));

    return () => controller.abort();
  }, [fecha, servicioId, servicioActual]);

  // ── Cerrar dropdown al click fuera ───────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Búsqueda de clientes existentes ──────────────────────────────
  const buscarClientes = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }
    setBuscando(true);
    try {
      const res = await fetch(`/api/clientes?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        setSugerencias([]);
        return;
      }
      const data: ClienteSugerido[] = await res.json();
      setSugerencias(data);
      setMostrarSugerencias(data.length > 0);
    } catch {
      setSugerencias([]);
    } finally {
      setBuscando(false);
    }
  }, []);

  const scheduleSearch = (q: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => buscarClientes(q), 300);
  };

  const handleNombreChange = (v: string) => {
    setNombre(v);
    setClienteSeleccionado(null);
    scheduleSearch(v);
  };

  const handleTelefonoChange = (v: string) => {
    setTelefono(v);
    setClienteSeleccionado(null);
    scheduleSearch(v);
  };

  const seleccionarCliente = (c: ClienteSugerido) => {
    setNombre(c.nombre);
    setTelefono(c.telefono);
    setEmail(c.email ?? "");
    setClienteSeleccionado(c);
    setMostrarSugerencias(false);
    setSugerencias([]);
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hora) { setError("Selecciona una hora disponible"); return; }
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicioId, fecha, hora, nombre, telefono, email: email || undefined }),
      });
      let data: { error?: string } = {};
      try { data = await res.json(); } catch { /* respuesta vacía */ }
      if (!res.ok) {
        setError(data.error ?? "Error al crear la cita");
      } else if (onCreada) {
        onCreada(); // el padre cierra el panel y recarga las citas
      } else {
        router.push(`/admin/citas?fecha=${fecha}`);
        router.refresh();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  // Agrupar slots en mañana/tarde para mejor legibilidad
  const slotsMañana = slots.filter((s) => parseInt(s) < 14);
  const slotsTarde  = slots.filter((s) => parseInt(s) >= 14);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* SERVICIO */}
      <Field label="Servicio">
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        >
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre} — {s.precio}€ ({s.duracion} min)</option>
          ))}
        </select>
      </Field>

      {/* FECHA */}
      <Field label="Fecha">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

      {/* HORA — selector dinámico de slots disponibles */}
      <div className="sm:col-span-2 space-y-2">
        <label className="text-[10px] tracking-[0.3em] uppercase text-outline font-label flex items-center gap-2">
          <Clock size={10} />
          Hora disponible *
          {cargandoSlots && <span className="text-outline/50">cargando...</span>}
        </label>

        {cargandoSlots ? (
          <div className="h-10 bg-surface-container border border-outline/20 animate-pulse" />
        ) : slots.length === 0 ? (
          <div className="bg-surface-container border border-outline/20 px-3 py-3 text-sm text-outline/60 font-label">
            {fecha ? "No hay horas disponibles para este día" : "Selecciona una fecha primero"}
          </div>
        ) : (
          <div className="space-y-3">
            {slotsMañana.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-outline/50 font-label mb-1.5">Mañana</p>
                <SlotGrid slots={slotsMañana} horaSeleccionada={hora} onSelect={setHora} />
              </div>
            )}
            {slotsTarde.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-outline/50 font-label mb-1.5">Tarde</p>
                <SlotGrid slots={slotsTarde} horaSeleccionada={hora} onSelect={setHora} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* NOMBRE con autocomplete */}
      <div className="space-y-2 relative" ref={dropdownRef}>
        <label className="text-[10px] tracking-[0.3em] uppercase text-outline font-label flex items-center gap-2">
          Nombre *
          {clienteSeleccionado && (
            <span className="flex items-center gap-1 text-primary">
              <UserCheck size={10} /> Guardado
            </span>
          )}
          {buscando && <span className="text-outline/40">buscando...</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            value={nombre}
            onChange={(e) => handleNombreChange(e.target.value)}
            onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
            required
            autoComplete="off"
            className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/40 px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors pr-8"
          />
          <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/30 pointer-events-none" />
        </div>

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 bg-surface-container border border-outline/20 shadow-xl mt-1 overflow-hidden">
            {sugerencias.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => seleccionarCliente(c)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-primary/10 transition-colors text-left border-b border-outline/10 last:border-0"
              >
                <div>
                  <p className="text-sm font-headline font-bold text-on-surface uppercase tracking-tight">{c.nombre}</p>
                  <p className="text-[10px] text-outline font-label">{c.telefono}{c.email ? ` · ${c.email}` : ""}</p>
                </div>
                <UserCheck size={12} className="text-primary shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TELÉFONO */}
      <Field label="Teléfono *">
        <input
          type="tel"
          value={telefono}
          onChange={(e) => handleTelefonoChange(e.target.value)}
          required
          autoComplete="off"
          className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/40 px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

      {/* EMAIL */}
      <Field label="Email (opcional)">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/40 px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

      {error && (
        <div className="sm:col-span-2 text-error text-sm border-l-4 border-error bg-error/5 px-4 py-3">
          {error}
        </div>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={enviando || !hora}
          className="w-full sm:w-auto bg-primary text-on-primary font-headline font-bold tracking-widest uppercase px-8 py-3 text-sm hover:bg-primary-dim transition-all disabled:opacity-40"
        >
          {enviando ? "Guardando..." : "Crear cita"}
        </button>
      </div>
    </form>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function SlotGrid({
  slots,
  horaSeleccionada,
  onSelect,
}: {
  slots: string[];
  horaSeleccionada: string;
  onSelect: (h: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={`px-3 py-2 text-xs font-headline font-bold uppercase tracking-wider transition-all ${
            horaSeleccionada === slot
              ? "bg-primary text-on-primary"
              : "bg-surface-container border border-outline/20 text-on-surface hover:border-primary hover:text-primary"
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] tracking-[0.3em] uppercase text-outline font-label">{label}</label>
      {children}
    </div>
  );
}
