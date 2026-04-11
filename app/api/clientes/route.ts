import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const ClienteGetSchema = z.object({
  q: z.string().min(2).max(100),
});

const ClientePostSchema = z.object({
  nombre: z.string().min(1).max(100),
  telefono: z.string().min(6).max(20),
  email: z.string().email().optional().or(z.literal("")),
});

// GET /api/clientes?q=nombre_o_telefono
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = ClienteGetSchema.safeParse({
    q: req.nextUrl.searchParams.get("q")?.trim() ?? "",
  });

  if (!parsed.success) return NextResponse.json([]);

  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: parsed.data.q, mode: "insensitive" } },
          { telefono: { contains: parsed.data.q } },
        ],
      },
      orderBy: { nombre: "asc" },
      take: 8,
      select: { id: true, nombre: true, telefono: true, email: true },
    });
    return NextResponse.json(clientes);
  } catch (e) {
    console.error("[GET /api/clientes]", e);
    return NextResponse.json({ error: "Error al buscar clientes" }, { status: 500 });
  }
}

// POST /api/clientes — crear o actualizar cliente por teléfono
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ClientePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { nombre, telefono, email } = parsed.data;

    const cliente = await prisma.cliente.upsert({
      where: { telefono },
      update: { nombre, email: email || null },
      create: { nombre, telefono, email: email || null },
    });

    return NextResponse.json(cliente);
  } catch (e) {
    console.error("[POST /api/clientes]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
