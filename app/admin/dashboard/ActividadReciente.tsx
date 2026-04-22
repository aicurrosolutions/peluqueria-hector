"use client";

import { useEffect, useState, useCallback } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, XCircle, Pencil, RefreshCw } from "lucide-react";
import type { ItemActividad, TipoActividad } from "@/app/api/admin/actividad/route";

const CONFIG: Record<
  TipoActividad,
  { label: string; textColor: string; bgColor: string; dotColor: string; icon: React.ElementType }
> = {
  nueva: {
    label: "Nueva reserva",
    textColor: "text-success",
    bgColor: "bg-success-container",
    dotColor: "bg-success",
    icon: CheckCircle,
  },
  cancelada: {
    label: "Cancelada",
    textColor: "text-error",
    bgColor: "bg-error/10",
    dotColor: "bg-error",
    icon: XCircle,
  },
  modificada: {
    label: "Modificada",
    textColor: "text-warning",
    bgColor: "bg-warning/10",
    dotColor: "bg-warning",
    icon: Pencil,
  },
};

export default function ActividadReciente() {
  const [items, setItems] = useState<ItemActividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    else setActualizando(true);
    try {
      const res = await fetch("/api/admin/actividad");
      if (res.ok) setItems(await res.json());
    } catch { /* silencioso */ }
    finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    // Refresca automáticamente cada 60 s
    const interval = setInterval(() => cargar(true), 60_000);
    return () => clearInterval(interval);
  }, [cargar]);

  return (
    <section>
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline font-label">
          Actividad reciente
        </h3>
        <div className="h-px flex-1 bg-outline/10" />
        <button
          onClick={() => cargar(true)}
          disabled={actualizando}
          title="Actualizar"
          className="p-1 text-outline/50 hover:text-outline transition-colors disabled:opacity-30"
        >
          <RefreshCw size={11} className={actualizando ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Estados */}
      {cargando ? (
        <div className="space-y-px">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[60px] bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-low px-6 py-10 text-center">
          <p className="text-outline text-xs font-label uppercase tracking-widest">
            Sin actividad reciente
          </p>
        </div>
      ) : (
        <div className="space-y-px">
          {items.map((item) => {
            const cfg = CONFIG[item.tipo];
            const Icon = cfg.icon;
            const fechaCita = format(parseISO(item.fecha), "d MMM", { locale: es });
            const hace = formatDistanceToNow(parseISO(item.timestamp), {
              locale: es,
              addSuffix: true,
            });

            return (
              <div
                key={item.id}
                className="bg-surface-container-low hover:bg-surface-container transition-colors px-4 py-3 flex items-center gap-3"
              >
                {/* Icono */}
                <div className={`w-7 h-7 shrink-0 flex items-center justify-center ${cfg.bgColor}`}>
                  <Icon size={13} className={cfg.textColor} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-headline font-bold text-on-surface uppercase tracking-tight truncate leading-tight">
                      {item.nombre}
                    </span>
                    <span
                      className={`text-[9px] font-label font-bold uppercase tracking-widest px-1.5 py-0.5 shrink-0 ${cfg.bgColor} ${cfg.textColor}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-outline font-label truncate mt-0.5">
                    {item.servicio}
                    <span className="text-outline/40 mx-1">·</span>
                    {fechaCita} {item.hora}
                  </p>
                </div>

                {/* Timestamp relativo */}
                <p className="text-[9px] text-outline/50 font-label shrink-0 text-right whitespace-nowrap">
                  {hace}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
