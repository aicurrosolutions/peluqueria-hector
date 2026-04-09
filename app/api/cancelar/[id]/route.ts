import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarCancelacion } from "@/lib/email";
import { isBefore, subHours } from "date-fns";
import { parseISO } from "date-fns";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { telefono } = await req.json();

  if (!telefono) {
    return NextResponse.json({ error: "Teléfono requerido para verificar tu identidad" }, { status: 400 });
  }

  const cita = await prisma.cita.findUnique({
    where: { id },
    include: { servicio: true },
  });

  if (!cita) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  }

  if (cita.estado === "CANCELADA") {
    return NextResponse.json({ error: "Esta cita ya está cancelada" }, { status: 409 });
  }

  if (cita.estado === "COMPLETADA") {
    return NextResponse.json({ error: "Esta cita ya fue completada y no puede cancelarse" }, { status: 409 });
  }

  // Verificar teléfono: últimos 4 dígitos
  const digitos = telefono.replace(/\D/g, "");
  const digitosCita = cita.telefono.replace(/\D/g, "");
  if (!digitosCita.endsWith(digitos.slice(-4))) {
    return NextResponse.json({ error: "El teléfono no coincide con la reserva" }, { status: 403 });
  }

  // Verificar política de cancelación: mínimo 24h antes
  const ahora = new Date();
  const [h, m] = cita.hora.split(":").map(Number);
  const fechaCita = new Date(cita.fecha);
  fechaCita.setHours(h, m, 0, 0);

  if (isBefore(fechaCita, subHours(ahora, 0)) || isBefore(fechaCita, new Date(ahora.getTime() + 24 * 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Solo se pueden cancelar citas con más de 24 horas de antelación" }, { status: 400 });
  }

  // Cancelar
  await prisma.cita.update({ where: { id }, data: { estado: "CANCELADA" } });

  // Email de cancelación al cliente si tiene email
  if (cita.email) {
    try {
      await enviarCancelacion({
        nombre: cita.nombre,
        email: cita.email,
        servicio: cita.servicio.nombre,
        fecha: cita.fecha,
        hora: cita.hora,
      });
    } catch {
      // falla silenciosamente
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cita = await prisma.cita.findUnique({
    where: { id },
    include: { servicio: true },
  });

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

  // Solo devolvemos datos no sensibles para mostrar en la página
  return NextResponse.json({
    id: cita.id,
    nombre: cita.nombre,
    servicio: cita.servicio.nombre,
    fecha: cita.fecha.toISOString(),
    hora: cita.hora,
    estado: cita.estado,
  });
}
