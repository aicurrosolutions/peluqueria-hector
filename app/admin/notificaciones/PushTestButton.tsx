"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

type Estado = "idle" | "cargando" | "ok" | "error" | "sin-suscripciones";

export default function PushTestButton() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const enviar = async () => {
    setEstado("cargando");
    setMsg(null);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");

      if (data.total === 0) {
        setEstado("sin-suscripciones");
        setMsg("No hay dispositivos suscritos. Activá las notificaciones primero.");
        return;
      }

      const eliminadas = data.total - data.enviadas;
      setMsg(
        eliminadas > 0
          ? `Enviada a ${data.enviadas} de ${data.total} (${eliminadas} suscripción${eliminadas > 1 ? "es" : ""} expirada${eliminadas > 1 ? "s" : ""} eliminada${eliminadas > 1 ? "s" : ""})`
          : `Enviada a ${data.enviadas} dispositivo${data.enviadas !== 1 ? "s" : ""}`
      );
      setEstado("ok");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error al enviar");
      setEstado("error");
    }
  };

  const iconoEstado = estado === "ok"
    ? <CheckCircle size={12} className="shrink-0 text-primary" />
    : estado === "error" || estado === "sin-suscripciones"
    ? <AlertCircle size={12} className="shrink-0 text-error" />
    : <Send size={12} className="shrink-0" />;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={enviar}
        disabled={estado === "cargando"}
        className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container transition-colors font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface disabled:opacity-40 w-full"
      >
        {iconoEstado}
        {estado === "cargando" ? "Enviando..." : "Enviar notificación de prueba"}
      </button>
      {msg && (
        <p className={`text-[10px] font-label px-4 ${
          estado === "ok" ? "text-primary" : "text-error"
        }`}>
          {msg}
        </p>
      )}
    </div>
  );
}
