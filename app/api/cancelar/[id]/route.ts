import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarCancelacion, enviarModificacion } from "@/lib/email";
import { isBefore, parseISO, startOfDay, endOfDay, subHours } from "date-fns";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { telefono, fecha, hora } = await req.json();

  if (!telefono || !fecha || !hora) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const cita = await prisma.cita.findUnique({
    where: { id },
    include: { servicio: true },
  });

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
  if (cita.estado === "CANCELADA") return NextResponse.json({ error: "Esta cita ya está cancelada" }, { status: 409 });
  if (cita.estado === "COMPLETADA") return NextResponse.json({ error: "Esta cita ya fue completada" }, { status: 409 });

  // Verificar teléfono: últimos 4 dígitos
  const digitos = telefono.replace(/\D/g, "");
  const digitosCita = cita.telefono.replace(/\D/g, "");
  if (!digitosCita.endsWith(digitos.slice(-4))) {
    return NextResponse.json({ error: "El teléfono no coincide con la reserva" }, { status: 403 });
  }

  // Política 24h sobre la cita actual
  const ahora = new Date();
  const [hAct, mAct] = cita.hora.split(":").map(Number);
  const fechaCitaActual = new Date(cita.fecha);
  fechaCitaActual.setHours(hAct, mAct, 0, 0);
  if (isBefore(fechaCitaActual, new Date(ahora.getTime() + 24 * 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Solo se pueden modificar citas con más de 24h de antelación" }, { status: 400 });
  }

  // La nueva cita también debe ser futura (+24h)
  const nuevaFecha = parseISO(fecha);
  const [hNew, mNew] = hora.split(":").map(Number);
  const nuevaFechaHora = new Date(nuevaFecha);
  nuevaFechaHora.setHours(hNew, mNew, 0, 0);
  if (isBefore(nuevaFechaHora, new Date(ahora.getTime() + 24 * 60 * 60 * 1000))) {
    return NextResponse.json({ error: "La nueva cita debe ser con más de 24h de antelación" }, { status: 400 });
  }

  // Verificar disponibilidad del nuevo slot (excluyendo la cita actual)
  const citasDelDia = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(nuevaFecha), lte: endOfDay(nuevaFecha) },
      estado: { not: "CANCELADA" },
      id: { not: id },
    },
    select: { hora: true, servicio: { select: { duracion: true } } },
  });

  const slotInicio = hNew * 60 + mNew;
  const slotFin = slotInicio + cita.servicio.duracion;
  const hayConflicto = citasDelDia.some((c) => {
    const [ch, cm] = c.hora.split(":").map(Number);
    const cInicio = ch * 60 + cm;
    const cFin = cInicio + c.servicio.duracion;
    return cInicio < slotFin && cFin > slotInicio;
  });

  if (hayConflicto) {
    return NextResponse.json({ error: "Ese horario ya no está disponible, elige otro" }, { status: 409 });
  }

  // Actualizar cita
  await prisma.cita.update({
    where: { id },
    data: { fecha: startOfDay(nuevaFecha), hora },
  });

  // Email de confirmación del cambio
  if (cita.email) {
    try {
      await enviarModificacion({
        nombre: cita.nombre,
        email: cita.email,
        servicio: cita.servicio.nombre,
        fecha: nuevaFecha,
        hora,
        citaId: id,
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

  return NextResponse.json({
    id: cita.id,
    nombre: cita.nombre,
    servicio: cita.servicio.nombre,
    duracion: cita.servicio.duracion,
    fecha: cita.fecha.toISOString(),
    hora: cita.hora,
    estado: cita.estado,
  });
}
