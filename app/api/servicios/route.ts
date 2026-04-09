import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

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

  const { nombre, precio, duracion, nota } = await req.json();
  if (!nombre || !precio || !duracion) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const servicio = await prisma.servicio.create({
    data: { nombre, precio: Number(precio), duracion: Number(duracion), nota: nota ?? null },
  });
  return NextResponse.json(servicio, { status: 201 });
}
