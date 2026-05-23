import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { calcularStatsCliente } from "@/lib/cliente-stats";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const nombre = (body.nombre ?? "").trim();
  const telefono = (body.telefono ?? "").trim();
  const email = (body.email ?? "").trim() || null;
  const notas = (body.notas ?? "").trim() || null;

  if (!nombre || !telefono) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
  }

  const existente = await prisma.cliente.findUnique({ where: { telefono } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un cliente con ese teléfono" }, { status: 409 });
  }

  const cliente = await prisma.cliente.create({ data: { nombre, telefono, email, notas } });
  return NextResponse.json(cliente, { status: 201 });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const clientes = await prisma.cliente.findMany({
    include: {
      citas: {
        where: { estado: { in: ["CONFIRMADA", "COMPLETADA"] } },
        orderBy: { fecha: "desc" },
        select: { fecha: true, servicio: { select: { nombre: true, precio: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  });

  const hoy = new Date();
  const data = clientes.map((c) => calcularStatsCliente(c, hoy));
  return NextResponse.json(data);
}
