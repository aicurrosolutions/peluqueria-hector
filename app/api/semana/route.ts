import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const inicioStr = searchParams.get("inicio");
  if (!inicioStr) return NextResponse.json({ error: "Falta inicio" }, { status: 400 });

  const inicio = parseISO(inicioStr);
  const fin = endOfWeek(inicio, { weekStartsOn: 1 });

  const citas = await prisma.cita.findMany({
    where: {
      fecha: { gte: startOfDay(inicio), lte: endOfDay(fin) },
    },
    include: { servicio: true },
    orderBy: { hora: "asc" },
  });

  return NextResponse.json(
    citas.map((c) => ({
      id: c.id,
      hora: c.hora,
      nombre: c.nombre,
      estado: c.estado,
      fecha: c.fecha.toISOString(),
      servicio: { nombre: c.servicio.nombre, precio: c.servicio.precio },
    }))
  );
}
