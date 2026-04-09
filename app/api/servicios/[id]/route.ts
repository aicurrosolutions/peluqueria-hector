import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const servicio = await prisma.servicio.update({
    where: { id },
    data: {
      nombre: body.nombre,
      precio: body.precio !== undefined ? Number(body.precio) : undefined,
      duracion: body.duracion !== undefined ? Number(body.duracion) : undefined,
      nota: body.nota !== undefined ? body.nota : undefined,
      activo: body.activo,
    },
  });
  return NextResponse.json(servicio);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.servicio.update({ where: { id }, data: { activo: false } });
  return NextResponse.json({ ok: true });
}
