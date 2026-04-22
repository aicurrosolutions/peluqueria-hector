"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

type Estado = "desconocido" | "activo" | "inactivo" | "denegado" | "no-soportado";

/**
 * Wrapper cross-browser para Notification.requestPermission.
 * Safari ≤ 15.3 usa API de callback; Chrome/Firefox/Edge/Safari 15.4+ usa Promise.
 * Esta función normaliza ambas variantes.
 */
function solicitarPermiso(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    const result = Notification.requestPermission((perm) => resolve(perm));
    // Si devuelve una Promise (navegadores modernos), la usamos también
    if (result instanceof Promise) result.then(resolve).catch(() => resolve("denied"));
  });
}

export default function PushToggle({ compact = false }: { compact?: boolean }) {
  const [estado, setEstado] = useState<Estado>("desconocido");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setEstado("no-soportado");
      return;
    }
    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }

    // Registrar SW primero, luego comprobar suscripción activa.
    // Evita la race condition de tener dos useEffects independientes.
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // getSubscription sobre el registration recién registrado (o ya activo)
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        setEstado(sub ? "activo" : "inactivo");
      })
      .catch(() => {
        setEstado("no-soportado");
      });
  }, []);

  const activar = async () => {
    setCargando(true);
    try {
      const permiso = await solicitarPermiso();
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

  if (estado === "no-soportado") return null;

  const activo = estado === "activo";
  const tooltip = estado === "denegado"
    ? "Notificaciones bloqueadas en el navegador"
    : activo ? "Desactivar notificaciones push" : "Activar notificaciones push";

  // Modo compacto: solo ícono, para el header móvil
  if (compact) {
    return (
      <button
        onClick={activo ? desactivar : activar}
        disabled={cargando || estado === "denegado" || estado === "desconocido"}
        title={tooltip}
        className={`p-2 transition-colors disabled:opacity-40 ${
          activo
            ? "text-primary"
            : estado === "denegado"
            ? "text-outline/30 cursor-not-allowed"
            : "text-outline hover:text-on-surface"
        }`}
      >
        {activo ? <Bell size={18} /> : <BellOff size={18} />}
      </button>
    );
  }

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
