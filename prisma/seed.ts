import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Insertar servicios iniciales
  const servicios = [
    { nombre: "Corte & Asesoramiento", precio: 12, duracion: 30 },
    { nombre: "Corte", precio: 10, duracion: 30 },
    { nombre: "Corte + Barba", precio: 15, duracion: 35 },
    { nombre: "Corte VIP", precio: 18, duracion: 40 },
  ];

  for (const s of servicios) {
    const existe = await prisma.servicio.findFirst({ where: { nombre: s.nombre } });
    if (!existe) {
      await prisma.servicio.create({ data: s });
      console.log(`✓ Servicio creado: ${s.nombre}`);
    }
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
