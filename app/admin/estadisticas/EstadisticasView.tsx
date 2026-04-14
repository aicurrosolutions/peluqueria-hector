"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import CalendarioCliente from "../calendario/CalendarioCliente";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Periodo {
  totalCitas: number;
  ingresos: number;
  canceladas: number;
  completadas: number;
  clientesNuevos: number;
}

interface SemanaHistorial { label: string; ingresos: number; citas: number }
interface DiaCerrado  { id: string; fecha: string; motivo: string | null }
interface DiaAbierto  { id: string; fecha: string; motivo: string | null }
interface Ausencia    { id: string; inicio: string; fin: string; motivo: string | null }

interface Props {
  semanal: Periodo;
  mensual: Periodo;
  historial: SemanaHistorial[];
  diasCerrados: DiaCerrado[];
  diasAbiertos: DiaAbierto[];
  diasSemanaAbiertos: number[];
  ausencias: Ausencia[];
}

type Tab = "estadisticas" | "calendario";

// Colores del sistema de diseño
const COLOR_PRIMARY   = "#755B00";
const COLOR_SURFACE   = "#1E1A10";
const COLOR_OUTLINE   = "rgba(255,255,255,0.15)";

// ── Componente principal ───────────────────────────────────────────────────────

export default function EstadisticasView({
  semanal, mensual, historial,
  diasCerrados, diasAbiertos, diasSemanaAbiertos, ausencias,
}: Props) {
  const [tab, setTab] = useState<Tab>("estadisticas");

  return (
    <div className="bg-surface min-h-screen">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface px-4 md:px-10 py-5 md:py-8 border-b border-outline/15">
        <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">
          Panel de control
        </span>
        <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase">
          Informes
        </h2>

        <div className="flex gap-px mt-5 bg-surface-container-high">
          <TabButton active={tab === "estadisticas"} onClick={() => setTab("estadisticas")}>Estadísticas</TabButton>
          <TabButton active={tab === "calendario"}   onClick={() => setTab("calendario")}>Calendario</TabButton>
        </div>
      </header>

      <div className="px-4 md:px-10 py-8 md:py-10">

        {/* ── TAB ESTADÍSTICAS ─────────────────────────────────────────────── */}
        {tab === "estadisticas" && (
          <div className="space-y-12">

            {/* GRÁFICAS ─── */}
            <section>
              <SectionTitle overline="Últimas 8 semanas" title="Evolución" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline/5">

                {/* Ingresos */}
                <div className="bg-surface-container-low p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-widest text-outline font-label mb-4">
                    Ingresos estimados (€)
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={historial} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke={COLOR_OUTLINE} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ background: COLOR_SURFACE, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0, fontSize: 12 }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
                        itemStyle={{ color: COLOR_PRIMARY }}
                        formatter={(v) => [`${Number(v ?? 0).toFixed(0)}€`, "Ingresos"]}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      />
                      <Bar dataKey="ingresos" fill={COLOR_PRIMARY} radius={0} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Citas */}
                <div className="bg-surface-container-low p-5 md:p-6">
                  <p className="text-[10px] uppercase tracking-widest text-outline font-label mb-4">
                    Citas realizadas
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={historial} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke={COLOR_OUTLINE} strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ background: COLOR_SURFACE, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 0, fontSize: 12 }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
                        itemStyle={{ color: COLOR_PRIMARY }}
                        formatter={(v) => [Number(v ?? 0), "Citas"]}
                        cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="citas"
                        stroke={COLOR_PRIMARY}
                        strokeWidth={2}
                        dot={{ fill: COLOR_PRIMARY, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: COLOR_PRIMARY }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* SEMANAL ─── */}
            <section>
              <SectionTitle overline="Esta semana" title="Resumen Semanal" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline/5">
                <StatCard label="Citas totales"   value={pad(semanal.totalCitas)}              color="text-on-surface" />
                <StatCard label="Ingresos est."   value={`${semanal.ingresos.toFixed(0)}€`}   color="text-primary" large />
                <StatCard label="Canceladas"      value={pad(semanal.canceladas)}              color="text-error" />
                <StatCard label="Clientes nuevos" value={pad(semanal.clientesNuevos)}          color="text-on-surface" />
              </div>
              {semanal.totalCitas > 0 && <CancelBar canceladas={semanal.canceladas} total={semanal.totalCitas} />}
            </section>

            {/* MENSUAL ─── */}
            <section>
              <SectionTitle overline="Este mes" title="Resumen Mensual" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline/5">
                <StatCard label="Citas totales"   value={pad(mensual.totalCitas)}              color="text-on-surface" />
                <StatCard label="Ingresos est."   value={`${mensual.ingresos.toFixed(0)}€`}   color="text-primary" large />
                <StatCard label="Canceladas"      value={pad(mensual.canceladas)}              color="text-error" />
                <StatCard label="Clientes nuevos" value={pad(mensual.clientesNuevos)}          color="text-on-surface" />
              </div>
              {mensual.totalCitas > 0 && <CancelBar canceladas={mensual.canceladas} total={mensual.totalCitas} />}
            </section>

            {/* COMPARATIVA ─── */}
            <section>
              <SectionTitle overline="Comparativa" title="Semana vs Mes" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline/5">
                <ComparativaRow label="Citas"           semanal={semanal.totalCitas}  mensual={mensual.totalCitas}  formato={(v) => pad(v)} />
                <ComparativaRow label="Ingresos"        semanal={semanal.ingresos}    mensual={mensual.ingresos}    formato={(v) => `${v.toFixed(0)}€`} highlight />
                <ComparativaRow label="Canceladas"      semanal={semanal.canceladas}  mensual={mensual.canceladas}  formato={(v) => pad(v)} />
                <ComparativaRow label="Clientes nuevos" semanal={semanal.clientesNuevos} mensual={mensual.clientesNuevos} formato={(v) => pad(v)} />
              </div>
            </section>

          </div>
        )}

        {/* ── TAB CALENDARIO ───────────────────────────────────────────────── */}
        {tab === "calendario" && (
          <div className="space-y-4 max-w-4xl">
            <p className="text-outline text-xs font-body">
              Los fines de semana están cerrados por defecto. Puedes abrir días concretos, cerrar días entre semana o bloquear un rango de vacaciones.
            </p>
            <CalendarioCliente
              diasCerradosIniciales={diasCerrados}
              diasAbiertosIniciales={diasAbiertos}
              diasSemanaAbiertos={diasSemanaAbiertos}
              ausenciasIniciales={ausencias}
            />
          </div>
        )}

      </div>
    </div>
  );
}

// ── Sub-componentes UI ─────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 font-label text-xs uppercase tracking-widest transition-all ${
        active
          ? "bg-surface text-primary border-b-2 border-primary"
          : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function SectionTitle({ overline, title }: { overline: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div>
        <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-label font-bold mb-0.5">{overline}</p>
        <h3 className="font-headline text-xl font-bold text-on-surface uppercase tracking-tight">{title}</h3>
      </div>
      <div className="h-px flex-1 bg-outline/10" />
    </div>
  );
}

function CancelBar({ canceladas, total }: { canceladas: number; total: number }) {
  return (
    <div className="mt-3 bg-surface-container-low px-5 py-4 flex items-center gap-4">
      <span className="text-[10px] text-outline uppercase tracking-widest font-label w-28 shrink-0">Tasa cancelación</span>
      <div className="flex-1 bg-surface-container-high h-1.5 overflow-hidden">
        <div className="h-full bg-error transition-all" style={{ width: `${Math.round((canceladas / total) * 100)}%` }} />
      </div>
      <span className="text-[10px] text-outline font-label w-10 text-right">
        {Math.round((canceladas / total) * 100)}%
      </span>
    </div>
  );
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function StatCard({ label, value, color, large = false }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div className="bg-surface-container-low px-4 md:px-6 py-5">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-outline font-label mb-2">{label}</p>
      <p className={`font-headline font-bold ${color} ${large ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl"}`}>{value}</p>
    </div>
  );
}

function ComparativaRow({ label, semanal, mensual, formato, highlight = false }: {
  label: string; semanal: number; mensual: number;
  formato: (v: number) => string; highlight?: boolean;
}) {
  return (
    <div className="bg-surface-container-low px-5 py-5 flex items-center justify-between gap-4">
      <span className="text-[10px] text-outline uppercase tracking-widest font-label w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-6 ml-auto">
        <div className="text-right">
          <p className="text-[9px] text-outline uppercase tracking-wider font-label mb-0.5">Semana</p>
          <p className={`font-headline font-bold text-lg ${highlight ? "text-primary" : "text-on-surface"}`}>{formato(semanal)}</p>
        </div>
        <div className="w-px h-8 bg-outline/10" />
        <div className="text-right">
          <p className="text-[9px] text-outline uppercase tracking-wider font-label mb-0.5">Mes</p>
          <p className={`font-headline font-bold text-lg ${highlight ? "text-primary" : "text-on-surface"}`}>{formato(mensual)}</p>
        </div>
      </div>
    </div>
  );
}
