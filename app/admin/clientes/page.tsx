import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { calcularStatsCliente } from "@/lib/cliente-stats";
import type { ClienteConStats } from "@/lib/types";
import ClientesView from "./ClientesView";

export const revalidate = 0;

export type { ClienteConStats };

export default async function ClientesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const hoy = new Date();

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

  const data: ClienteConStats[] = clientes.map((c) => calcularStatsCliente(c, hoy));

  return <ClientesView clientes={data} />;
}
