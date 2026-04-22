import { Metadata } from "next";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ActividadReciente from "./ActividadReciente";

export const metadata: Metadata = { title: "Notificaciones — Héctor Lacorte" };

export default async function NotificacionesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  return (
    <div className="bg-surface min-h-screen">
      <header className="sticky top-0 z-30 bg-surface px-4 md:px-10 py-5 md:py-8 border-b border-outline/5">
        <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">
          Panel
        </span>
        <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase">
          Notificaciones
        </h2>
      </header>

      <div className="px-4 md:px-10 py-6 md:py-8">
        <ActividadReciente />
      </div>
    </div>
  );
}
