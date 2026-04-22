"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ItemActividad } from "@/app/api/admin/actividad/route";

const STORAGE_KEY = "hl_notif_last_visit";

export default function NotifBell() {
  const [hasUnread, setHasUnread] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Al visitar la página de notificaciones, marcar todo como leído
    if (pathname === "/admin/notificaciones") {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setHasUnread(false);
      return;
    }

    // En cualquier otra página: comprobar si hay actividad más nueva que la última visita
    fetch("/api/admin/actividad")
      .then((r) => (r.ok ? r.json() : []))
      .then((items: ItemActividad[]) => {
        if (!items.length) return;
        const lastVisit = localStorage.getItem(STORAGE_KEY);
        if (!lastVisit) {
          setHasUnread(true);
          return;
        }
        setHasUnread(new Date(items[0].timestamp) > new Date(lastVisit));
      })
      .catch(() => {});
  }, [pathname]);

  const isActive = pathname === "/admin/notificaciones";

  return (
    <Link
      href="/admin/notificaciones"
      title="Notificaciones"
      className={cn(
        "relative p-2 transition-colors",
        isActive ? "text-primary" : "text-outline hover:text-on-surface"
      )}
    >
      <Bell size={18} />
      {hasUnread && (
        <span
          aria-label="Notificaciones no leídas"
          className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-1 ring-surface-container"
        />
      )}
    </Link>
  );
}
