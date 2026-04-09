import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import { enviarConfirmacion, notificarBarber } from "@/lib/email";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fechaStr = searchParams.get("fecha");

  const where = fechaStr
    ? {
        fecha: {
          gte: startOfDay(parseISO(fechaStr)),
          lte: endOfDay(parseISO(fechaStr)),
        },
      }
    : {};

  const citas = await prisma.cita.findMany({
    where,
    include: { servicio: true },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });

  return NextResponse.json(citas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { servicioId, fecha, hora, nombre, telefono, email } = body;

  if (!servicioId || !fecha || !hora || !nombre || !telefono) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const fechaDate = parseISO(fecha);

  // Verificar que el slot sigue disponible
  const existente = await prisma.cita.findFirst({
    where: {
      fecha: { gte: startOfDay(fechaDate), lte: endOfDay(fechaDate) },
      hora,
      estado: { not: "CANCELADA" },
    },
  });

  if (existente) {
    return NextResponse.json({ error: "Esta hora ya no está disponible" }, { status: 409 });
  }

  const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } });
  if (!servicio) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

  let cita;
  try {
    cita = await prisma.cita.create({
      data: {
        servicioId,
        fecha: startOfDay(fechaDate),
        hora,
        nombre,
        telefono,
        email: email ?? null,
        estado: "CONFIRMADA",
      },
    });
  } catch (e: unknown) {
    // P2002 = violación de restricción unique (doble reserva simultánea)
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "Esta hora acaba de ser reservada por otro cliente. Por favor elige otro horario." }, { status: 409 });
    }
    throw e;
  }

  // Emails en paralelo — fallan silenciosamente para no bloquear la respuesta
  await Promise.allSettled([
    // Confirmación al cliente (solo si dio email)
    email ? enviarConfirmacion({
      nombre,
      email,
      servicio: servicio.nombre,
      fecha: fechaDate,
      hora,
      citaId: cita.id,
    }) : Promise.resolve(),
    // Notificación al barber siempre
    notificarBarber({
      nombre,
      email: email ?? "",
      telefono,
      servicio: servicio.nombre,
      fecha: fechaDate,
      hora,
      citaId: cita.id,
    }),
  ]);

  return NextResponse.json(cita, { status: 201 });
}
