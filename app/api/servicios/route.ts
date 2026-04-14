import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function GET() {
  const servicios = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: { precio: "asc" },
  });
  return NextResponse.json(servicios);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { nombre, precio, duracion, nota, diasDisponibles } = await req.json();
  if (!nombre || !precio || !duracion) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const dias = Array.isArray(diasDisponibles) ? diasDisponibles.map(Number).filter((d) => d >= 0 && d <= 6) : [];

  const servicio = await prisma.servicio.create({
    data: { nombre, precio: Number(precio), duracion: Number(duracion), nota: nota ?? null, diasDisponibles: dias },
  });

  await audit({
    accion: "SERVICIO_CREADO",
    entidad: "Servicio",
    entidadId: servicio.id,
    datos: { nombre, precio: Number(precio), duracion: Number(duracion), nota: nota ?? null, diasDisponibles: dias },
  });

  return NextResponse.json(servicio, { status: 201 });
}
