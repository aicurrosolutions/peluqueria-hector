import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const servicios = [
    { nombre: "Corte & Asesoramiento", precio: 12, duracion: 30, nota: null },
    { nombre: "Corte",                 precio: 10, duracion: 30, nota: "Solo lunes y martes" },
    { nombre: "Corte + Barba",         precio: 15, duracion: 35, nota: null },
    { nombre: "Corte VIP",             precio: 18, duracion: 40, nota: null },
  ];

  for (const s of servicios) {
    const existe = await prisma.servicio.findFirst({ where: { nombre: s.nombre } });
    if (!existe) {
      await prisma.servicio.create({ data: s });
      console.log(`✓ Creado: ${s.nombre}`);
    } else {
      // Actualiza precio, duración y nota por si han cambiado
      await prisma.servicio.update({ where: { id: existe.id }, data: { precio: s.precio, duracion: s.duracion, nota: s.nota } });
      console.log(`↺ Actualizado: ${s.nombre}`);
    }
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
