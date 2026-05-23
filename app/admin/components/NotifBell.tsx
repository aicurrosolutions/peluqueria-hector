"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ItemActividad } from "@/app/api/admin/actividad/route";

const STORAGE_KEY = "hl_notif_last_visit";
const POLL_INTERVAL = 30_000;

function useHasUnread(pathname: string) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/notificaciones") {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setHasUnread(false);
      return;
    }

    const check = () => {
      fetch("/api/admin/actividad")
        .then((r) => (r.ok ? r.json() : []))
        .then((items: ItemActividad[]) => {
          if (!items.length) return;
          const lastVisit = localStorage.getItem(STORAGE_KEY);
          if (!lastVisit) { setHasUnread(true); return; }
          setHasUnread(new Date(items[0].timestamp) > new Date(lastVisit));
        })
        .catch(() => {});
    };

    check();
    const id = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [pathname]);

  return hasUnread;
}

export default function NotifBell({ variant = "icon" }: { variant?: "icon" | "sidebar" }) {
  const pathname = usePathname();
  const hasUnread = useHasUnread(pathname);
  const isActive = pathname === "/admin/notificaciones";

  if (variant === "sidebar") {
    return (
      <Link
        href="/admin/notificaciones"
        className={cn(
          "flex items-center gap-4 px-4 py-4 transition-all font-label text-xs uppercase tracking-widest",
          isActive
            ? "text-primary bg-surface-container-high"
            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        )}
      >
        <div className="relative">
          <Bell size={16} />
          {hasUnread && (
            <span
              aria-label="Notificaciones no leídas"
              className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full ring-1 ring-surface-container"
            />
          )}
        </div>
        Notificaciones
      </Link>
    );
  }

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
