import { Resend } from "resend";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BUSINESS, ADMIN } from "@/lib/config";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

interface DatosEmail {
  nombre: string;
  email: string;
  servicio: string;
  fecha: Date;
  hora: string;
  citaId: string;
}

export async function enviarConfirmacion(datos: DatosEmail) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Cita confirmada — ${BUSINESS.name}`,
    html: `
      <div style="background:#0a0a0a;color:#F5F0EB;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#C9A84C;font-size:28px;letter-spacing:4px;text-transform:uppercase;margin:0;">${BUSINESS.name}</h1>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">${BUSINESS.role}</p>
        </div>
        <div style="border-top:1px solid #C9A84C33;border-bottom:1px solid #C9A84C33;padding:24px 0;margin:24px 0;">
          <h2 style="color:#F5F0EB;font-size:18px;margin:0 0 16px;">Tu cita está confirmada</h2>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Servicio:</strong> ${datos.servicio}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Fecha:</strong> ${fechaFormato}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Hora:</strong> ${datos.hora}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Nombre:</strong> ${datos.nombre}</p>
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          Si necesitas cancelar tu cita (mínimo 24h antes), puedes hacerlo aquí:
        </p>
        <p style="margin:12px 0;">
          <a href="${BUSINESS.url}/cancelar/${datos.citaId}" style="color:#C9A84C;font-size:13px;">
            ${BUSINESS.url}/cancelar/${datos.citaId}
          </a>
        </p>
        <p style="color:#555;font-size:11px;">
          Ref: <strong style="color:#C9A84C;">${datos.citaId.slice(0, 8).toUpperCase()}</strong>
        </p>
        <p style="color:#555;font-size:11px;margin-top:32px;text-align:center;">
          ${BUSINESS.name} · @${BUSINESS.instagram}
        </p>
      </div>
    `,
  });
}

export async function notificarBarber(datos: DatosEmail & { telefono: string }) {
  const emailDestino = ADMIN.emailNotificaciones;
  if (!emailDestino) return; // sin configurar, skip silencioso

  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: emailDestino,
    subject: `📅 Nueva cita — ${datos.nombre} · ${datos.hora}`,
    html: `
      <div style="background:#0a0a0a;color:#F5F0EB;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#C9A84C;font-size:22px;letter-spacing:4px;text-transform:uppercase;margin:0;">Nueva reserva</h1>
          <p style="color:#888;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">${BUSINESS.name}</p>
        </div>
        <div style="border-top:1px solid #C9A84C33;border-bottom:1px solid #C9A84C33;padding:24px 0;margin:24px 0;">
          <p style="margin:8px 0;color:#ccc;font-size:15px;"><strong style="color:#C9A84C;">Cliente:</strong> ${datos.nombre}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Teléfono:</strong> <a href="tel:${datos.telefono}" style="color:#C9A84C;">${datos.telefono}</a></p>
          ${datos.email ? `<p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Email:</strong> ${datos.email}</p>` : ""}
          <p style="margin:16px 0 8px;color:#ccc;"><strong style="color:#C9A84C;">Servicio:</strong> ${datos.servicio}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Fecha:</strong> ${fechaFormato}</p>
          <p style="margin:8px 0;color:#F5F0EB;font-size:20px;font-weight:bold;"><strong style="color:#C9A84C;">Hora:</strong> ${datos.hora}</p>
        </div>
        <p style="color:#555;font-size:11px;margin-top:24px;text-align:center;">
          Ref: ${datos.citaId.slice(0, 8).toUpperCase()}
        </p>
      </div>
    `,
  });
}

export async function enviarModificacion(datos: DatosEmail) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Cita modificada — ${BUSINESS.name}`,
    html: `
      <div style="background:#0a0a0a;color:#F5F0EB;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#C9A84C;font-size:28px;letter-spacing:4px;text-transform:uppercase;margin:0;">${BUSINESS.name}</h1>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:4px 0 0;">${BUSINESS.role}</p>
        </div>
        <div style="border-top:1px solid #C9A84C33;border-bottom:1px solid #C9A84C33;padding:24px 0;margin:24px 0;">
          <h2 style="color:#F5F0EB;font-size:18px;margin:0 0 16px;">Tu cita ha sido modificada</h2>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Servicio:</strong> ${datos.servicio}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Nueva fecha:</strong> ${fechaFormato}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Nueva hora:</strong> ${datos.hora}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Nombre:</strong> ${datos.nombre}</p>
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          Si necesitas volver a modificar o cancelar tu cita (mínimo 24h antes):
        </p>
        <p style="margin:12px 0;">
          <a href="${BUSINESS.url}/cancelar/${datos.citaId}" style="color:#C9A84C;font-size:13px;">
            ${BUSINESS.url}/cancelar/${datos.citaId}
          </a>
        </p>
        <p style="color:#555;font-size:11px;margin-top:32px;text-align:center;">
          ${BUSINESS.name} · @${BUSINESS.instagram}
        </p>
      </div>
    `,
  });
}

export async function enviarCancelacion(datos: Omit<DatosEmail, "citaId">) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Cita cancelada — ${BUSINESS.name}`,
    html: `
      <div style="background:#0a0a0a;color:#F5F0EB;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#C9A84C;font-size:28px;letter-spacing:4px;text-transform:uppercase;margin:0;">${BUSINESS.name}</h1>
        </div>
        <div style="border-top:1px solid #C9A84C33;border-bottom:1px solid #C9A84C33;padding:24px 0;margin:24px 0;">
          <h2 style="color:#F5F0EB;font-size:18px;margin:0 0 16px;">Tu cita ha sido cancelada</h2>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Servicio:</strong> ${datos.servicio}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Fecha:</strong> ${fechaFormato}</p>
          <p style="margin:8px 0;color:#ccc;"><strong style="color:#C9A84C;">Hora:</strong> ${datos.hora}</p>
        </div>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          Puedes reservar una nueva cita cuando quieras en nuestra web.
        </p>
        <p style="color:#555;font-size:11px;margin-top:32px;text-align:center;">
          ${BUSINESS.name} · @${BUSINESS.instagram}
        </p>
      </div>
    `,
  });
}
