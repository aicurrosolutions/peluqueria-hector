import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { HORARIO_DEFAULT, DIAS_SEMANA } from "@/lib/horarios";
import { z } from "zod";

const FranjaSchema = z.object({
  inicio: z.string().regex(/^\d{2}:\d{2}$/),
  fin: z.string().regex(/^\d{2}:\d{2}$/),
});

const GuardarDiaSchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  franjas: z.array(FranjaSchema),
});

// GET — devuelve el horario completo agrupado por día (con auto-seed si está vacío)
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let franjas = await prisma.horarioFranja.findMany({
    orderBy: [{ diaSemana: "asc" }, { inicio: "asc" }],
  });

  // Auto-seed: si no hay datos en BD, insertar el horario por defecto
  if (franjas.length === 0) {
    const inserts = Object.entries(HORARIO_DEFAULT).flatMap(([dia, franjasDia]) =>
      franjasDia.map((f) => ({
        diaSemana: parseInt(dia),
        inicio: f.inicio,
        fin: f.fin,
        activo: true,
      }))
    );
    if (inserts.length) {
      await prisma.horarioFranja.createMany({ data: inserts });
      franjas = await prisma.horarioFranja.findMany({
        orderBy: [{ diaSemana: "asc" }, { inicio: "asc" }],
      });
    }
  }

  // Agrupar por día
  const porDia: Record<number, { id: string; inicio: string; fin: string; activo: boolean }[]> = {};
  for (let i = 0; i <= 6; i++) porDia[i] = [];
  for (const f of franjas) {
    porDia[f.diaSemana].push({ id: f.id, inicio: f.inicio, fin: f.fin, activo: f.activo });
  }

  return NextResponse.json({
    dias: Object.entries(porDia).map(([dia, fr]) => ({
      diaSemana: parseInt(dia),
      nombre: DIAS_SEMANA[parseInt(dia)],
      franjas: fr,
    })),
  });
}

// POST — reemplaza todas las franjas de un día concreto
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = GuardarDiaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { diaSemana, franjas } = parsed.data;

  // Reemplazar franjas del día: borrar las existentes e insertar las nuevas
  await prisma.$transaction([
    prisma.horarioFranja.deleteMany({ where: { diaSemana } }),
    ...(franjas.length
      ? [prisma.horarioFranja.createMany({
          data: franjas.map((f) => ({ diaSemana, inicio: f.inicio, fin: f.fin, activo: true })),
        })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
