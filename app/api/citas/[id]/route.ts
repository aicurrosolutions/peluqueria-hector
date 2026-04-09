import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { parseISO, startOfDay } from "date-fns";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Construir solo los campos enviados
  const data: Record<string, unknown> = {};
  if (body.estado !== undefined) data.estado = body.estado;
  if (body.hora !== undefined) data.hora = body.hora;
  if (body.notas !== undefined) data.notas = body.notas;
  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.telefono !== undefined) data.telefono = body.telefono;
  if (body.email !== undefined) data.email = body.email || null;
  if (body.servicioId !== undefined) data.servicioId = body.servicioId;
  if (body.fecha !== undefined) data.fecha = startOfDay(parseISO(body.fecha));

  const cita = await prisma.cita.update({
    where: { id },
    data,
    include: { servicio: true },
  });

  return NextResponse.json(cita);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.cita.update({ where: { id }, data: { estado: "CANCELADA" } });
  return NextResponse.json({ ok: true });
}
