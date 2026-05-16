"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";

type Estado = "desconocido" | "activo" | "inactivo" | "denegado" | "no-soportado" | "instalar-primero";

function solicitarPermiso(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    const result = Notification.requestPermission((perm) => resolve(perm));
    if (result instanceof Promise) result.then(resolve).catch(() => resolve("denied"));
  });
}

function esIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function esStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Retorna Uint8Array en lugar de ArrayBuffer — más compatible con iOS Safari
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const view = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return view;
}

export default function PushToggle({ compact = false }: { compact?: boolean }) {
  const [estado, setEstado] = useState<Estado>("desconocido");
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      setEstado("no-soportado");
      return;
    }

    // En iOS fuera de modo standalone, PushManager no existe — guiar instalación
    if (!("PushManager" in window)) {
      setEstado(esIOS() && !esStandalone() ? "instalar-primero" : "no-soportado");
      return;
    }

    if (Notification.permission === "denied") {
      setEstado("denegado");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? "activo" : "inactivo"))
      .catch(() => setEstado("no-soportado"));
  }, []);

  const activar = async () => {
    setCargando(true);
    setErrorMsg(null);
    try {
      const permiso = await solicitarPermiso();
      if (permiso !== "granted") {
        setEstado("denegado");
        return;
      }

      const keyRes = await fetch("/api/push/vapid-key");
      if (!keyRes.ok) throw new Error("No se pudo obtener la clave VAPID");
      const { publicKey } = await keyRes.json();

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("No se pudo guardar la suscripción en el servidor");

      setEstado("activo");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "No se pudo activar. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const desactivar = async () => {
    setCargando(true);
    setErrorMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const res = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        if (!res.ok) throw new Error("No se pudo eliminar la suscripción del servidor");
        await sub.unsubscribe();
      }
      setEstado("inactivo");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "No se pudo desactivar. Intentá de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // ── Modo compacto (sidebar, header) ─────────────────────────────────────
  if (compact) {
    if (estado === "no-soportado" || estado === "desconocido") return null;

    if (estado === "instalar-primero") {
      return (
        <button
          disabled
          title="Abrí la app instalada para activar notificaciones"
          className="p-2 text-outline/40 cursor-default"
        >
          <Smartphone size={18} />
        </button>
      );
    }

    const activo = estado === "activo";
    return (
      <button
        onClick={activo ? desactivar : activar}
        disabled={cargando || estado === "denegado"}
        title={
          estado === "denegado"
            ? "Notificaciones bloqueadas — habilitá en Ajustes"
            : activo
            ? "Desactivar notificaciones push"
            : "Activar notificaciones push"
        }
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

  // ── Modo completo (sidebar desktop, página notificaciones) ───────────────
  if (estado === "no-soportado" || estado === "desconocido") return null;

  if (estado === "instalar-primero") {
    return (
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Smartphone size={12} className="shrink-0" />
          <span className="text-[10px] font-label uppercase tracking-widest">Notificaciones — iOS</span>
        </div>
        <p className="text-[10px] text-on-surface-variant/70 leading-relaxed">
          Safari → <strong>Compartir</strong> → <strong>"Agregar a pantalla de inicio"</strong> → Abrí la app desde el ícono.
        </p>
      </div>
    );
  }

  const activo = estado === "activo";

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={activo ? desactivar : activar}
        disabled={cargando || estado === "denegado"}
        title={
          estado === "denegado"
            ? "Habilitá las notificaciones en Ajustes del navegador"
            : activo
            ? "Desactivar notificaciones push"
            : "Activar notificaciones push"
        }
        className={`flex items-center gap-2 px-4 py-2.5 transition-colors font-label text-[10px] uppercase tracking-widest w-full disabled:opacity-40 ${
          activo
            ? "text-primary hover:text-primary/70"
            : estado === "denegado"
            ? "text-outline/30 cursor-not-allowed"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        {activo ? <Bell size={12} className="shrink-0" /> : <BellOff size={12} className="shrink-0" />}
        {activo
          ? "Notificaciones activas"
          : estado === "denegado"
          ? "Notificaciones bloqueadas"
          : cargando
          ? "Activando..."
          : "Activar notificaciones"}
      </button>
      {errorMsg && (
        <p className="text-[10px] font-label text-error px-4">{errorMsg}</p>
      )}
      {estado === "denegado" && (
        <p className="text-[10px] font-label text-on-surface-variant/50 px-4">
          Habilitá en Ajustes del navegador
        </p>
      )}
    </div>
  );
}
