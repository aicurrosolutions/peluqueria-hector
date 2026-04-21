"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

type Estado = "desconocido" | "activo" | "inactivo" | "denegado" | "no-soportado";

export default function PushToggle() {
  const [estado, setEstado] = useState<Estado>("desconocido");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEstado("no-soportado");
      return;
    }
    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setEstado(sub ? "activo" : "inactivo");
    });
  }, []);

  const activar = async () => {
    setCargando(true);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") { setEstado("denegado"); return; }

      const keyRes = await fetch("/api/push/vapid-key");
      if (!keyRes.ok) return;
      const { publicKey } = await keyRes.json();

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setEstado("activo");
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  };

  const desactivar = async () => {
    setCargando(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEstado("inactivo");
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  };

  // Registrar SW al montar
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (estado === "no-soportado") return null;

  const activo = estado === "activo";
  const tooltip = estado === "denegado"
    ? "Notificaciones bloqueadas en el navegador"
    : activo ? "Desactivar notificaciones push" : "Activar notificaciones push";

  return (
    <button
      onClick={activo ? desactivar : activar}
      disabled={cargando || estado === "denegado" || estado === "desconocido"}
      title={tooltip}
      className={`flex items-center gap-2 px-4 py-2.5 transition-colors font-label text-[10px] uppercase tracking-widest w-full ${
        activo
          ? "text-primary hover:text-primary/70"
          : estado === "denegado"
          ? "text-outline/30 cursor-not-allowed"
          : "text-on-surface-variant hover:text-on-surface"
      } disabled:opacity-40`}
    >
      {activo ? <Bell size={12} className="shrink-0" /> : <BellOff size={12} className="shrink-0" />}
      {activo ? "Notificaciones activas" : estado === "denegado" ? "Notificaciones bloqueadas" : "Activar notificaciones"}
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return buffer;
}
