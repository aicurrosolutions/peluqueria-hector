import { prisma } from "./prisma";
import { logger } from "./logger";

interface AuditParams {
  accion: string;
  entidad: string;
  entidadId?: string;
  datos?: Record<string, unknown>;
}

/**
 * Registra una acción de admin en el audit log.
 * Falla silenciosamente para no interrumpir la operación principal.
 */
export async function audit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId ?? null,
        datos: params.datos ?? undefined,
      },
    });
  } catch (e) {
    logger.error("Error registrando audit log", e, { accion: params.accion });
  }
}
