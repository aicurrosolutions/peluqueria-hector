"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Servicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
}

export default function NuevaCitaForm({
  servicios,
  fechaDefault,
}: {
  servicios: Servicio[];
  fechaDefault: string;
}) {
  const [servicioId, setServicioId] = useState(servicios[0]?.id ?? "");
  const [fecha, setFecha] = useState(fechaDefault);
  const [hora, setHora] = useState("11:00");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicioId, fecha, hora, nombre, telefono, email: email || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error");
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Servicio">
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        >
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre} — {s.precio}€</option>
          ))}
        </select>
      </Field>

      <Field label="Fecha">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

      <Field label="Hora">
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          step="1800"
          className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

      <Field label="Nombre *">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/40 px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

      <Field label="Teléfono *">
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          className="w-full bg-surface-container border border-outline/20 text-on-surface placeholder-outline/40 px-3 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </Field>

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
          disabled={enviando}
          className="w-full sm:w-auto bg-primary text-on-primary font-headline font-bold tracking-widest uppercase px-8 py-3 text-sm hover:bg-primary-dim transition-all disabled:opacity-40"
        >
          {enviando ? "Guardando..." : "Crear cita"}
        </button>
      </div>
    </form>
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
