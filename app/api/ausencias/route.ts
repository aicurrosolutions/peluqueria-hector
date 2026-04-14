import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { startOfDay } from "date-fns";
import { z } from "zod";

const AusenciaSchema = z.object({
  inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fin:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motivo: z.string().optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const ausencias = await prisma.ausencia.findMany({
    orderBy: { inicio: "asc" },
  });

  return NextResponse.json(
    ausencias.map((a) => ({
      id: a.id,
      inicio: a.inicio.toISOString(),
      fin:    a.fin.toISOString(),
      motivo: a.motivo,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = AusenciaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const inicio = startOfDay(new Date(parsed.data.inicio));
  const fin    = startOfDay(new Date(parsed.data.fin));

  if (fin < inicio) {
    return NextResponse.json({ error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 });
  }

  const ausencia = await prisma.ausencia.create({
    data: { inicio, fin, motivo: parsed.data.motivo ?? null },
  });

  return NextResponse.json({ id: ausencia.id, inicio: ausencia.inicio.toISOString(), fin: ausencia.fin.toISOString(), motivo: ausencia.motivo });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.ausencia.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
