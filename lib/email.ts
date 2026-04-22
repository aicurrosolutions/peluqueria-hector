import { Resend } from "resend";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BUSINESS, ADMIN } from "@/lib/config";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

// ─── Colores (modo claro forzado) ──────────────────────
const C = {
  bg:       "#FFFFFF",
  surface:  "#F5F3EE",
  border:   "rgba(0,0,0,0.10)",
  gold:     "#A07830",
  goldDim:  "#7A5C20",
  text:     "#1A1A1A",
  muted:    "#555555",
  faint:    "#999999",
  error:    "#BA1A1A",
  success:  "#15803D",
};

// ─── Componentes reutilizables ──────────────────────────
function header(titulo: string, subtitulo?: string) {
  return `
    <div style="text-align:center;padding:40px 0 32px;">
      <p style="color:${C.gold};font-size:10px;letter-spacing:5px;text-transform:uppercase;margin:0 0 12px;font-family:Georgia,serif;">
        ${BUSINESS.name}
      </p>
      <h1 style="color:${C.text};font-size:26px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0;font-family:Georgia,serif;line-height:1.2;">
        ${titulo}
      </h1>
      ${subtitulo ? `<p style="color:${C.muted};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:10px 0 0;">${subtitulo}</p>` : ""}
    </div>
    <div style="height:1px;background:linear-gradient(to right,transparent,${C.gold},transparent);margin-bottom:32px;"></div>
  `;
}

function row(label: string, value: string, highlight = false) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid ${C.border};">
      <span style="color:${C.muted};font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Georgia,serif;">${label}</span>
      <span style="color:${highlight ? C.gold : C.text};font-size:${highlight ? "16px" : "13px"};font-weight:${highlight ? "700" : "400"};font-family:Georgia,serif;">${value}</span>
    </div>
  `;
}

function button(texto: string, href: string, color = C.gold) {
  return `
    <div style="text-align:center;margin:32px 0;">
      <a href="${href}" style="display:inline-block;background:${color};color:#0D0D0D;font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:16px 40px;text-decoration:none;">
        ${texto}
      </a>
    </div>
  `;
}

function footer(ref?: string) {
  return `
    <div style="height:1px;background:linear-gradient(to right,transparent,${C.border},transparent);margin:32px 0 24px;"></div>
    ${ref ? `<p style="color:${C.faint};font-size:10px;letter-spacing:2px;text-align:center;text-transform:uppercase;margin:0 0 8px;">Ref: <span style="color:${C.goldDim}">${ref}</span></p>` : ""}
    <p style="color:${C.faint};font-size:10px;letter-spacing:2px;text-align:center;text-transform:uppercase;margin:0;">
      ${BUSINESS.name} &nbsp;·&nbsp; @${BUSINESS.instagram}
    </p>
    <p style="color:${C.faint};font-size:10px;text-align:center;margin:6px 0 0;">${BUSINESS.direccion}</p>
  `;
}

function wrap(contenido: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <!-- Fuerza modo claro en todos los clientes de correo que respetan esta meta -->
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <style>
        /* Bloquea dark-mode automático en Apple Mail, Gmail, Outlook */
        :root { color-scheme: light !important; }
        * { color-scheme: light !important; }
        @media (prefers-color-scheme: dark) {
          body { background-color: ${C.bg} !important; color: ${C.text} !important; }
          div  { background-color: ${C.bg} !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:${C.bg};color:${C.text};color-scheme:light;">
      <div style="max-width:560px;margin:0 auto;padding:0 24px 48px;background-color:${C.bg};color-scheme:light;">
        ${contenido}
      </div>
    </body>
    </html>
  `;
}

// ─── Tipos ─────────────────────────────────────────────
interface DatosEmail {
  nombre: string;
  email: string;
  servicio: string;
  fecha: Date;
  hora: string;
  citaId: string;
}

// ─── Confirmación de reserva ────────────────────────────
export async function enviarConfirmacion(datos: DatosEmail) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Cita confirmada — ${datos.hora} · ${format(datos.fecha, "d MMM", { locale: es })}`,
    html: wrap(`
      ${header("Cita Confirmada", "Reserva completada")}

      <div style="background:${C.surface};padding:24px;margin-bottom:8px;">
        ${row("Cliente", datos.nombre)}
        ${row("Servicio", datos.servicio)}
        ${row("Fecha", fechaFormato)}
        ${row("Hora", datos.hora, true)}
      </div>

      <p style="color:${C.muted};font-size:12px;text-align:center;margin:20px 0 0;letter-spacing:1px;">
        Cancelación gratuita hasta 24h antes de la cita
      </p>

      ${button("Gestionar mi cita", `${BUSINESS.url}/cancelar/${datos.citaId}`)}

      <p style="color:${C.faint};font-size:10px;text-align:center;letter-spacing:1px;margin:0;">
        O copia este enlace: <span style="color:${C.goldDim}">${BUSINESS.url}/cancelar/${datos.citaId}</span>
      </p>

      ${footer(datos.citaId.slice(0, 8).toUpperCase())}
    `),
  });
}

// ─── Notificación al barber ─────────────────────────────
export async function notificarBarber(datos: DatosEmail & { telefono: string }) {
  const emailDestino = ADMIN.emailNotificaciones;
  if (!emailDestino) return;

  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: emailDestino,
    subject: `Nueva reserva — ${datos.nombre} · ${datos.hora} · ${format(datos.fecha, "d MMM", { locale: es })}`,
    html: wrap(`
      ${header("Nueva Reserva", "Acaba de entrar una cita")}

      <div style="background:${C.surface};padding:24px;margin-bottom:8px;">
        ${row("Cliente", datos.nombre)}
        ${row("Teléfono", datos.telefono)}
        ${datos.email ? row("Email", datos.email) : ""}
        ${row("Servicio", datos.servicio)}
        ${row("Fecha", fechaFormato)}
        ${row("Hora", datos.hora, true)}
      </div>

      ${button("Ver en el panel", `${BUSINESS.url}/admin/dashboard`)}

      ${footer(datos.citaId.slice(0, 8).toUpperCase())}
    `),
  });
}

// ─── Modificación de cita ───────────────────────────────
export async function enviarModificacion(datos: DatosEmail) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Cita modificada — ${datos.hora} · ${format(datos.fecha, "d MMM", { locale: es })}`,
    html: wrap(`
      ${header("Cita Modificada", "Tu reserva ha sido actualizada")}

      <div style="background:${C.surface};padding:24px;margin-bottom:8px;">
        ${row("Cliente", datos.nombre)}
        ${row("Servicio", datos.servicio)}
        ${row("Nueva fecha", fechaFormato)}
        ${row("Nueva hora", datos.hora, true)}
      </div>

      <p style="color:${C.muted};font-size:12px;text-align:center;margin:20px 0 0;letter-spacing:1px;">
        ¿Necesitas volver a cambiarla? Tienes hasta 24h antes.
      </p>

      ${button("Gestionar mi cita", `${BUSINESS.url}/cancelar/${datos.citaId}`)}

      ${footer(datos.citaId.slice(0, 8).toUpperCase())}
    `),
  });
}

// ─── Recordatorio 24h antes ────────────────────────────
export async function enviarRecordatorio(datos: DatosEmail) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Recuerda tu cita mañana — ${datos.hora} · ${format(datos.fecha, "d MMM", { locale: es })}`,
    html: wrap(`
      ${header("Recuerda tu cita", "Mañana te esperamos")}

      <div style="background:${C.surface};padding:24px;margin-bottom:8px;">
        ${row("Servicio", datos.servicio)}
        ${row("Fecha", fechaFormato)}
        ${row("Hora", datos.hora, true)}
      </div>

      <p style="color:${C.muted};font-size:12px;text-align:center;margin:20px 0 4px;letter-spacing:1px;">
        ${BUSINESS.direccion}
      </p>
      <p style="color:${C.faint};font-size:11px;text-align:center;margin:0;letter-spacing:1px;">
        Si no puedes venir, cancela con al menos 24h de antelación.
      </p>

      ${button("Gestionar mi cita", `${BUSINESS.url}/cancelar/${datos.citaId}`)}

      ${footer(datos.citaId.slice(0, 8).toUpperCase())}
    `),
  });
}

// ─── Cancelación de cita ────────────────────────────────
export async function enviarCancelacion(datos: Omit<DatosEmail, "citaId">) {
  const fechaFormato = format(datos.fecha, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  await resend.emails.send({
    from: `${BUSINESS.name} <${FROM}>`,
    to: datos.email,
    subject: `Cita cancelada — ${BUSINESS.name}`,
    html: wrap(`
      ${header("Cita Cancelada")}

      <div style="background:${C.surface};padding:24px;margin-bottom:8px;">
        ${row("Servicio", datos.servicio)}
        ${row("Fecha", fechaFormato)}
        ${row("Hora", datos.hora)}
      </div>

      <p style="color:${C.muted};font-size:12px;text-align:center;margin:24px 0 0;letter-spacing:1px;">
        Tu cita ha sido cancelada correctamente.<br>Reserva cuando quieras desde nuestra web.
      </p>

      ${button("Reservar nueva cita", `${BUSINESS.url}/reservar`)}

      ${footer()}
    `),
  });
}
