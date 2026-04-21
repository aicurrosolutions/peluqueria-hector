"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Star, TrendingDown, AlertTriangle, Moon, Sparkles, Search, Download } from "lucide-react";
import type { ClienteConStats } from "./page";

type Categoria = ClienteConStats["categoria"];
type Filtro = "todos" | Categoria;

const CATEGORIAS: { key: Categoria; label: string; desc: string; icon: React.ElementType; color: string; bg: string }[] = [
  {
    key: "frecuente",
    label: "Frecuentes",
    desc: "Vienen cada ≤35 días",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "regular",
    label: "Regulares",
    desc: "Vienen cada 36–45 días",
    icon: TrendingDown,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    key: "en_riesgo",
    label: "En riesgo",
    desc: "Sin visita en 46–90 días",
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    key: "inactivo",
    label: "Inactivos",
    desc: "Sin visita en +90 días",
    icon: Moon,
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    key: "nuevo",
    label: "Nuevos",
    desc: "Solo 1 visita reciente",
    icon: Sparkles,
    color: "text-on-surface-variant",
    bg: "bg-surface-container-high",
  },
];

function exportarCSV(clientes: ClienteConStats[]) {
  const LABELS: Record<string, string> = {
    frecuente: "Frecuente", regular: "Regular", en_riesgo: "En riesgo",
    inactivo: "Inactivo", nuevo: "Nuevo",
  };
  const cabecera = ["Nombre", "Teléfono", "Email", "Categoría", "Visitas", "Gasto total (€)", "Última visita", "Días sin venir", "Servicio favorito"];
  const filas = clientes.map((c) => [
    c.nombre,
    c.telefono,
    c.email ?? "",
    LABELS[c.categoria] ?? c.categoria,
    c.totalVisitas,
    c.gastoTotal,
    c.ultimaVisita ? format(parseISO(c.ultimaVisita), "dd/MM/yyyy", { locale: es }) : "",
    c.diasDesdeUltima ?? "",
    c.servicioFavorito ?? "",
  ]);
  const csv = [cabecera, ...filas]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clientes-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientesView({ clientes }: { clientes: ClienteConStats[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const conteos = useMemo(() => {
    const r: Record<string, number> = { todos: clientes.length };
    for (const cat of CATEGORIAS) {
      r[cat.key] = clientes.filter((c) => c.categoria === cat.key).length;
    }
    return r;
  }, [clientes]);

  const filtrados = useMemo(() => {
    let lista = filtro === "todos" ? clientes : clientes.filter((c) => c.categoria === filtro);
    if (busqueda.trim().length >= 2) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.telefono.includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }
    return lista.sort((a, b) => (b.gastoTotal ?? 0) - (a.gastoTotal ?? 0));
  }, [clientes, filtro, busqueda]);

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface px-4 md:px-10 py-5 md:py-8 border-b border-outline/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">
              CRM
            </span>
            <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase">
              Clientes
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-surface-container border border-outline/15 px-3 py-2.5 w-48 md:w-64">
              <Search size={13} className="text-outline shrink-0" />
              <input
                type="text"
                placeholder="Buscar…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none w-full"
              />
            </div>
            <button
              onClick={() => exportarCSV(filtrados)}
              title="Exportar CSV"
              className="flex items-center gap-1.5 border border-outline/20 px-3 py-2.5 text-outline hover:text-primary hover:border-primary/40 transition-all font-label text-[10px] uppercase tracking-widest"
            >
              <Download size={13} />
              <span className="hidden md:inline">CSV</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-10 py-6 space-y-8">

        {/* KPI cards por categoría */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-outline/5">
          {CATEGORIAS.map(({ key, label, desc, icon: Icon, color, bg }) => (
            <button
              key={key}
              onClick={() => setFiltro((f) => (f === key ? "todos" : key))}
              className={`p-4 md:p-5 text-left transition-all ${
                filtro === key ? "bg-surface-container-high ring-1 ring-primary/30 ring-inset" : "bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className={`inline-flex w-8 h-8 items-center justify-center ${bg} mb-3`}>
                <Icon size={15} className={color} />
              </div>
              <p className={`font-headline font-bold text-2xl ${filtro === key ? color : "text-on-surface"}`}>
                {conteos[key] ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-outline font-label mt-0.5">{label}</p>
              <p className="text-[9px] text-outline/50 font-label mt-0.5 hidden md:block">{desc}</p>
            </button>
          ))}
        </div>

        {/* Total + filtro activo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-outline" />
            <span className="text-sm text-on-surface-variant font-label">
              {filtrados.length} {filtro === "todos" ? "clientes en total" : `clientes · ${CATEGORIAS.find(c => c.key === filtro)?.label}`}
            </span>
          </div>
          {filtro !== "todos" && (
            <button
              onClick={() => setFiltro("todos")}
              className="text-[10px] text-primary underline font-label uppercase tracking-widest"
            >
              Ver todos
            </button>
          )}
          <div className="h-px flex-1 bg-outline/10" />
        </div>

        {/* Tabla */}
        {filtrados.length === 0 ? (
          <div className="bg-surface-container-low px-6 py-12 text-center">
            <p className="text-outline text-sm font-label">No hay clientes en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-px">
            {filtrados.map((c) => (
              <ClienteRow key={c.id} cliente={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClienteRow({ cliente: c }: { cliente: ClienteConStats }) {
  const cat = CATEGORIAS.find((x) => x.key === c.categoria)!;
  const Icon = cat?.icon ?? Users;

  return (
    <div className="bg-surface-container-low px-4 md:px-6 py-4 flex items-center gap-4 hover:bg-surface-container transition-colors">

      {/* Icono categoría */}
      <div className={`w-8 h-8 shrink-0 flex items-center justify-center ${cat?.bg ?? "bg-surface-container-high"}`}>
        <Icon size={14} className={cat?.color ?? "text-outline"} />
      </div>

      {/* Nombre + contacto */}
      <div className="flex-1 min-w-0">
        <p className="font-headline font-bold text-on-surface uppercase tracking-tight text-sm truncate">
          {c.nombre}
        </p>
        <p className="text-[10px] text-outline font-label truncate">
          {c.telefono}{c.email ? ` · ${c.email}` : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 shrink-0">
        <Stat label="Visitas" value={String(c.totalVisitas)} />
        <Stat label="Gasto total" value={`${c.gastoTotal}€`} highlight />
        {c.frecuenciaMedia && (
          <Stat label="Cada" value={`${c.frecuenciaMedia}d`} />
        )}
        {c.servicioFavorito && (
          <Stat label="Favorito" value={c.servicioFavorito} />
        )}
      </div>

      {/* Última visita */}
      <div className="shrink-0 text-right">
        {c.ultimaVisita ? (
          <div>
            <p className="text-[10px] text-outline font-label uppercase tracking-widest">Última visita</p>
            <p className="text-sm font-headline font-bold text-on-surface">
              {format(parseISO(c.ultimaVisita), "d MMM yy", { locale: es })}
            </p>
            {c.diasDesdeUltima !== null && (
              <p className={`text-[10px] font-label ${
                c.diasDesdeUltima > 90 ? "text-error" :
                c.diasDesdeUltima > 45 ? "text-warning" :
                "text-outline"
              }`}>
                hace {c.diasDesdeUltima}d
              </p>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-outline/40 font-label uppercase">Sin visitas</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-[9px] text-outline uppercase tracking-widest font-label">{label}</p>
      <p className={`text-sm font-headline font-bold ${highlight ? "text-primary" : "text-on-surface"}`}>
        {value}
      </p>
    </div>
  );
}
