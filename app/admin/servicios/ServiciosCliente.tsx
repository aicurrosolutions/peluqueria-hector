"use client";

import { useState } from "react";
import { Pencil, Plus, Check, X } from "lucide-react";

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  nota?: string | null;
  activo: boolean;
}

export default function ServiciosCliente({ serviciosIniciales }: { serviciosIniciales: Servicio[] }) {
  const [servicios, setServicios] = useState(serviciosIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", precio: "", duracion: "", nota: "" });
  const [nuevo, setNuevo] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({ nombre: "", precio: "", duracion: "", nota: "" });
  const [cargando, setCargando] = useState(false);

  const startEdit = (s: Servicio) => {
    setEditando(s.id);
    setForm({ nombre: s.nombre, precio: String(s.precio), duracion: String(s.duracion), nota: s.nota ?? "" });
  };

  const guardarEdicion = async (id: string) => {
    setCargando(true);
    const res = await fetch(`/api/servicios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: form.nombre, precio: Number(form.precio), duracion: Number(form.duracion), nota: form.nota || null }),
    });
    const actualizado = await res.json();
    setServicios((prev) => prev.map((s) => (s.id === id ? actualizado : s)));
    setEditando(null);
    setCargando(false);
  };

  const toggleActivo = async (s: Servicio) => {
    setCargando(true);
    const res = await fetch(`/api/servicios/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !s.activo }),
    });
    const actualizado = await res.json();
    setServicios((prev) => prev.map((x) => (x.id === s.id ? actualizado : x)));
    setCargando(false);
  };

  const crearServicio = async () => {
    if (!nuevoForm.nombre || !nuevoForm.precio || !nuevoForm.duracion) return;
    setCargando(true);
    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoForm.nombre, precio: Number(nuevoForm.precio), duracion: Number(nuevoForm.duracion), nota: nuevoForm.nota || null }),
    });
    const creado = await res.json();
    setServicios((prev) => [...prev, creado]);
    setNuevo(false);
    setNuevoForm({ nombre: "", precio: "", duracion: "", nota: "" });
    setCargando(false);
  };

  return (
    <div className="space-y-4">
      {/* Lista */}
      <div className="space-y-px">
        {servicios.map((s) => (
          <div key={s.id} className={`bg-surface-container-low transition-opacity ${!s.activo ? "opacity-40" : ""}`}>
            {editando === s.id ? (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Nombre">
                    <Input value={form.nombre} onChange={(v) => setForm((f) => ({ ...f, nombre: v }))} />
                  </Field>
                  <Field label="Precio (€)">
                    <Input value={form.precio} onChange={(v) => setForm((f) => ({ ...f, precio: v }))} type="number" />
                  </Field>
                  <Field label="Duración (min)">
                    <Input value={form.duracion} onChange={(v) => setForm((f) => ({ ...f, duracion: v }))} type="number" />
                  </Field>
                  <div className="sm:col-span-3">
                    <Field label="Nota (ej: Solo lunes y martes)">
                      <Input value={form.nota} onChange={(v) => setForm((f) => ({ ...f, nota: v }))} />
                    </Field>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => guardarEdicion(s.id)} disabled={cargando} className="flex items-center gap-2 bg-primary text-on-primary text-xs font-headline font-bold tracking-widest uppercase px-4 py-2.5 hover:bg-primary-dim transition-all disabled:opacity-40">
                    <Check size={12} /> Guardar
                  </button>
                  <button onClick={() => setEditando(null)} className="flex items-center gap-2 border border-outline/20 text-outline text-xs tracking-widest uppercase px-4 py-2.5 hover:text-on-surface transition-all font-label">
                    <X size={12} /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 p-4 md:p-5">
                <div className="flex-1 min-w-0">
                  <p className="text-on-surface font-headline font-bold text-sm md:text-base uppercase tracking-tight truncate">{s.nombre}</p>
                  <p className="text-outline text-xs mt-0.5 font-body">{s.duracion} min · <span className="text-primary font-bold">{s.precio}€</span></p>
                  {s.nota && <p className="text-primary/50 text-[10px] mt-0.5 font-label uppercase tracking-wider">{s.nota}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActivo(s)}
                    className={`text-[10px] px-2.5 py-1.5 border transition-all font-label uppercase tracking-wider ${
                      s.activo
                        ? "border-outline/20 text-outline hover:border-error/40 hover:text-error"
                        : "border-outline/10 text-outline/40 hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    {s.activo ? "Activo" : "Inactivo"}
                  </button>
                  <button onClick={() => startEdit(s)} className="p-2 text-outline hover:text-primary transition-colors">
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nuevo servicio */}
      {nuevo ? (
        <div className="bg-surface-container-low border border-primary/20 p-5 space-y-4">
          <h3 className="font-headline text-base font-bold text-on-surface uppercase tracking-tight">Nuevo servicio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Nombre">
              <Input value={nuevoForm.nombre} onChange={(v) => setNuevoForm((f) => ({ ...f, nombre: v }))} />
            </Field>
            <Field label="Precio (€)">
              <Input value={nuevoForm.precio} onChange={(v) => setNuevoForm((f) => ({ ...f, precio: v }))} type="number" />
            </Field>
            <Field label="Duración (min)">
              <Input value={nuevoForm.duracion} onChange={(v) => setNuevoForm((f) => ({ ...f, duracion: v }))} type="number" />
            </Field>
            <div className="sm:col-span-3">
              <Field label="Nota (opcional)">
                <Input value={nuevoForm.nota} onChange={(v) => setNuevoForm((f) => ({ ...f, nota: v }))} />
              </Field>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={crearServicio} disabled={cargando} className="flex items-center gap-2 bg-primary text-on-primary text-xs font-headline font-bold tracking-widest uppercase px-4 py-2.5 hover:bg-primary-dim disabled:opacity-40">
              <Check size={12} /> Crear
            </button>
            <button onClick={() => setNuevo(false)} className="flex items-center gap-2 border border-outline/20 text-outline text-xs tracking-widest uppercase px-4 py-2.5 hover:text-on-surface font-label">
              <X size={12} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setNuevo(true)} className="flex items-center gap-2 border border-primary/20 text-primary/60 text-xs tracking-widest uppercase px-5 py-3 hover:border-primary hover:text-primary transition-all font-label">
          <Plus size={14} /> Añadir servicio
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-widest uppercase text-outline font-label">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface-container border border-outline/20 text-on-surface px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
    />
  );
}
