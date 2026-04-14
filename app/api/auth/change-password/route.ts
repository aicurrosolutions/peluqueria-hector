import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { z } from "zod";

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "La contraseña nueva debe tener al menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Obtener credencial actual
    const credential = await prisma.adminCredential.findUnique({
      where: { id: "singleton" },
    });

    let currentIsValid = false;

    if (credential) {
      currentIsValid = await verifyPassword(currentPassword, credential.passwordHash);
    } else {
      // Aún no hay credencial en BD — verificar contra env var
      const envPass = process.env.ADMIN_PASSWORD ?? "hector1234";
      currentIsValid = currentPassword === envPass;
    }

    // También aceptar ADMIN_SETUP_TOKEN como contraseña actual (recuperación)
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!currentIsValid && setupToken && currentPassword === setupToken) {
      currentIsValid = true;
    }

    if (!currentIsValid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 403 });
    }

    const newHash = await hashPassword(newPassword);

    await prisma.adminCredential.upsert({
      where: { id: "singleton" },
      update: { passwordHash: newHash },
      create: { id: "singleton", passwordHash: newHash },
    });

    await audit({ accion: "PASSWORD_CAMBIADA", entidad: "AdminCredential" });

    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error("Error cambiando contraseña", e, { route: "POST /api/auth/change-password" });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
