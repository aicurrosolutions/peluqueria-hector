"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Scissors, Calendar, BarChart2, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSINESS } from "@/lib/config";

const NAV = [
  { href: "/admin/dashboard", label: "Agenda", icon: LayoutDashboard },
  { href: "/admin/servicios", label: "Servicios", icon: Scissors },
  { href: "/admin/calendario", label: "Calendario", icon: Calendar },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart2 },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin") return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <>
      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden lg:flex bg-surface-container text-primary flex-col h-screen w-64 shrink-0 fixed top-0 left-0 z-40">
        {/* Profile */}
        <div className="px-8 py-10 flex flex-col items-center border-b border-outline/15">
          <div className="w-16 h-16 bg-surface-container-high mb-4 overflow-hidden relative">
            <Image src="/logo.png" alt="HL" fill className="object-contain opacity-80 p-3" />
          </div>
          <h1 className="text-base font-black text-primary font-headline uppercase tracking-tighter">{BUSINESS.name}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mt-1 font-label">{BUSINESS.role}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 px-4 py-4 transition-all font-label text-xs uppercase tracking-widest",
                pathname === href
                  ? "text-primary bg-surface-container-high"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="p-4 space-y-3">
          <Link
            href="/admin/dashboard?nueva=1"
            className="w-full block py-4 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest text-center hover:bg-primary-dim transition-all"
          >
            Nueva cita
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-on-surface-variant hover:text-on-surface transition-colors font-label text-[10px] uppercase tracking-widest"
          >
            <LogOut size={12} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── HEADER MÓVIL ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-surface-container border-b border-outline/15 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-surface-container-high overflow-hidden relative shrink-0">
            <Image src="/logo.png" alt="HL" fill className="object-contain opacity-80 p-1.5" />
          </div>
          <span className="font-headline font-black text-sm uppercase tracking-tighter text-on-surface">{BUSINESS.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard?nueva=1"
            className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-2 font-headline font-bold uppercase text-[10px] tracking-wider"
          >
            <Plus size={12} />
            Nueva
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-outline hover:text-on-surface transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── BOTTOM NAV MÓVIL ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline/15 flex">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors",
              pathname === href
                ? "text-primary"
                : "text-on-surface-variant"
            )}
          >
            <Icon size={20} />
            <span className="text-[9px] uppercase tracking-wider font-label">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
