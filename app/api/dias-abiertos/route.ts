import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { parseISO, startOfDay } from "date-fns";

export async function GET() {
  const dias = await prisma.diaAbierto.findMany({ orderBy: { fecha: "asc" } });
  return NextResponse.json(dias);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { fecha, motivo } = await req.json();
  const dia = await prisma.diaAbierto.create({
    data: { fecha: startOfDay(parseISO(fecha)), motivo: motivo ?? null },
  });
  return NextResponse.json(dia, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await req.json();
  await prisma.diaAbierto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
