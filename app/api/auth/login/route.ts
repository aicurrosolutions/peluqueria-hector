import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const validUser = process.env.ADMIN_USERNAME ?? "hector";

    if (username !== validUser) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // 1. Verificar contra la BD (credencial almacenada)
    const dbCredential = await prisma.adminCredential.findUnique({
      where: { id: "singleton" },
    }).catch(() => null);

    let isValid = false;

    if (dbCredential) {
      isValid = await verifyPassword(password, dbCredential.passwordHash);
    } else {
      // 2. Fallback: contraseña de env var (primera vez o setup inicial)
      const envPass = process.env.ADMIN_PASSWORD ?? "hector1234";
      isValid = password === envPass;

      // Si la credencial aún no existe en BD, la creamos automáticamente
      if (isValid) {
        const hash = await hashPassword(envPass);
        await prisma.adminCredential.create({
          data: { id: "singleton", passwordHash: hash },
        }).catch(() => {
          // Falla silenciosamente — no bloquea el login
        });
      }
    }

    // 3. Permitir login con ADMIN_SETUP_TOKEN (recuperación de emergencia)
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!isValid && setupToken && password === setupToken) {
      isValid = true;
      logger.warn("Login con ADMIN_SETUP_TOKEN de emergencia", { route: "POST /api/auth/login" });
    }

    if (!isValid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const token = await signAdminToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 año — sesión persistente para el barbero
      path: "/",
    });

    return res;
  } catch (e) {
    logger.error("Error en login", e, { route: "POST /api/auth/login" });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
