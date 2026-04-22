import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const revalidate = 0;

export type TipoActividad = "nueva" | "cancelada" | "modificada";

export interface ItemActividad {
  id: string;
  tipo: TipoActividad;
  nombre: string;
  servicio: string;
  fecha: string;   // ISO — fecha de la cita
  hora: string;
  timestamp: string; // ISO — cuándo ocurrió el evento
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Paralelo: audit logs de Cita + últimas citas creadas (nuevas reservas)
  const [auditLogs, citasNuevas] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entidad: "Cita" },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.cita.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, nombre: true, fecha: true, hora: true, createdAt: true,
        servicio: { select: { nombre: true } },
      },
    }),
  ]);

  // Enriquecer audit logs con los datos de la cita (nombre, servicio, fecha, hora)
  const citaIdsAudit = [
    ...new Set(auditLogs.map((l) => l.entidadId).filter(Boolean)),
  ] as string[];

  const citasAuditMap = new Map<string, { nombre: string; hora: string; fecha: Date; servicio: { nombre: string } }>();
  if (citaIdsAudit.length > 0) {
    const citas = await prisma.cita.findMany({
      where: { id: { in: citaIdsAudit } },
      select: {
        id: true, nombre: true, fecha: true, hora: true,
        servicio: { select: { nombre: true } },
      },
    });
    citas.forEach((c) => citasAuditMap.set(c.id, c));
  }

  const items: ItemActividad[] = [];

  // ── Eventos de audit log (modificaciones y cancelaciones del admin) ──
  for (const log of auditLogs) {
    const cita = log.entidadId ? citasAuditMap.get(log.entidadId) : null;
    if (!cita) continue;

    let tipo: TipoActividad = "modificada";
    if (log.accion.includes("CANCELAD")) tipo = "cancelada";

    items.push({
      id: log.id,
      tipo,
      nombre: cita.nombre,
      servicio: cita.servicio.nombre,
      fecha: cita.fecha.toISOString(),
      hora: cita.hora,
      timestamp: log.createdAt.toISOString(),
    });
  }

  // ── Nuevas reservas (no auditadas en el POST /api/citas público) ──
  for (const cita of citasNuevas) {
    items.push({
      id: `nueva-${cita.id}`,
      tipo: "nueva",
      nombre: cita.nombre,
      servicio: cita.servicio.nombre,
      fecha: cita.fecha.toISOString(),
      hora: cita.hora,
      timestamp: cita.createdAt.toISOString(),
    });
  }

  // Ordenar cronológicamente (más reciente primero) y tomar los 25 más recientes
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(items.slice(0, 25));
}
