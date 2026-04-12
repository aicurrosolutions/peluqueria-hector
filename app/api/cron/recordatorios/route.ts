import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarRecordatorio } from "@/lib/email";
import { addHours } from "date-fns";

// Vercel llama a este endpoint cada hora (configurado en vercel.json)
// Solo procesa citas cuya hora exacta esté entre 24h y 25h desde ahora
export async function GET(req: NextRequest) {
  // Autenticación: Vercel pasa automáticamente el CRON_SECRET como Bearer token
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ahora = new Date();
  const ventanaInicio = addHours(ahora, 24);
  const ventanaFin = addHours(ahora, 25);

  // Citas pendientes o confirmadas, con email, no recordadas aún
  // Filtramos por fecha (día) — la hora exacta la filtramos en código
  const candidatas = await prisma.cita.findMany({
    where: {
      estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      recordatorioEnviado: false,
      email: { not: null },
      fecha: {
        // Buscamos citas en el día de ventanaInicio (pueden caer entre 24h y 25h)
        gte: new Date(ventanaInicio.getFullYear(), ventanaInicio.getMonth(), ventanaInicio.getDate()),
        lte: new Date(ventanaFin.getFullYear(), ventanaFin.getMonth(), ventanaFin.getDate(), 23, 59, 59),
      },
    },
    include: { servicio: true },
  });

  // Filtro exacto por hora: solo las que caen dentro de la ventana 24h-25h
  const aRecordar = candidatas.filter((cita) => {
    const [h, m] = cita.hora.split(":").map(Number);
    const fechaCita = new Date(cita.fecha);
    fechaCita.setHours(h, m, 0, 0);
    return fechaCita >= ventanaInicio && fechaCita <= ventanaFin;
  });

  const resultados = await Promise.allSettled(
    aRecordar.map(async (cita) => {
      await enviarRecordatorio({
        nombre: cita.nombre,
        email: cita.email!,
        servicio: cita.servicio.nombre,
        fecha: cita.fecha,
        hora: cita.hora,
        citaId: cita.id,
      });
      await prisma.cita.update({
        where: { id: cita.id },
        data: { recordatorioEnviado: true },
      });
    })
  );

  const enviados = resultados.filter((r) => r.status === "fulfilled").length;
  const errores = resultados.filter((r) => r.status === "rejected").length;

  console.log(`[cron/recordatorios] enviados=${enviados} errores=${errores} total=${aRecordar.length}`);

  return NextResponse.json({ ok: true, enviados, errores, total: aRecordar.length });
}
