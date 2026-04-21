import webPush from "web-push";
import { prisma } from "./prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function initVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL ?? "admin@example.com";
  if (!pub || !priv) return false;
  webPush.setVapidDetails(`mailto:${email}`, pub, priv);
  return true;
}

export async function enviarPushNuevaCita(payload: {
  nombre: string;
  servicio: string;
  fecha: Date;
  hora: string;
}) {
  if (!initVapid()) return;

  const subs = await prisma.pushSuscripcion.findMany().catch(() => []);
  if (!subs.length) return;

  const fechaStr = format(payload.fecha, "EEEE d MMM", { locale: es });
  const notification = JSON.stringify({
    title: "Nueva cita reservada",
    body: `${payload.nombre} · ${payload.servicio} · ${fechaStr} ${payload.hora}`,
    url: "/admin/dashboard",
  });

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        );
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "statusCode" in err &&
          (err.statusCode === 410 || err.statusCode === 404)
        ) {
          await prisma.pushSuscripcion
            .delete({ where: { endpoint: sub.endpoint } })
            .catch(() => {});
        }
      }
    })
  );
}
