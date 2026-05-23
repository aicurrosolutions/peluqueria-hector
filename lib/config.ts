// ============================================================
// CONFIGURACIÓN DEL NEGOCIO
// Todos los valores se leen de variables de entorno.
// Los fallbacks son los valores del cliente actual (Héctor Lacorte).
// Para un cliente nuevo, define las env vars en Vercel y listo.
// ============================================================

export const BUSINESS = {
  name:         process.env.NEXT_PUBLIC_BARBERIA_NOMBRE      ?? "Héctor Lacorte",
  role:         process.env.NEXT_PUBLIC_BARBERIA_ROLE         ?? "Master Barber",
  tagline:      process.env.NEXT_PUBLIC_BARBERIA_TAGLINE      ?? "El corte perfecto. Solo para caballeros.",
  description:  process.env.NEXT_PUBLIC_BARBERIA_DESCRIPCION  ?? "Barbería de autor centrada en la excelencia y el trato personalizado para el caballero moderno.",
  instagram:    process.env.NEXT_PUBLIC_BARBERIA_INSTAGRAM    ?? "hector.lacorte",
  telefono:     process.env.NEXT_PUBLIC_BARBERIA_TELEFONO     ?? "605 29 28 90",
  direccion:    process.env.NEXT_PUBLIC_BARBERIA_DIRECCION    ?? "C. Martinetes, 7, Local 10, 41800 Sanlúcar la Mayor, Sevilla",
  ciudad:       process.env.NEXT_PUBLIC_BARBERIA_CIUDAD       ?? "Sanlúcar la Mayor, Sevilla",
  url:          process.env.NEXT_PUBLIC_BARBERIA_URL          ?? "https://peluqueria-hector.vercel.app",
  // Dirección desglosada para JSON-LD Schema.org
  calle:        process.env.NEXT_PUBLIC_BARBERIA_CALLE        ?? "C. Martinetes, 7, Local 10",
  codigoPostal: process.env.NEXT_PUBLIC_BARBERIA_CP           ?? "41800",
  localidad:    process.env.NEXT_PUBLIC_BARBERIA_LOCALIDAD    ?? "Sanlúcar la Mayor",
  provincia:    process.env.NEXT_PUBLIC_BARBERIA_PROVINCIA    ?? "Sevilla",
  latitud:      parseFloat(process.env.NEXT_PUBLIC_BARBERIA_LATITUD  ?? "37.3869"),
  longitud:     parseFloat(process.env.NEXT_PUBLIC_BARBERIA_LONGITUD ?? "-6.2024"),
  // Foto del profesional — URL absoluta (https://...) o ruta relativa (/foto.jpg)
  fotoUrl:      process.env.NEXT_PUBLIC_BARBERIA_FOTO_URL     ?? "/hector.jpg",
};

// ──────────────────────────────────────────
// TEXTOS DE LA SECCIÓN "SOBRE MÍ"
// ──────────────────────────────────────────
export const SOBRE_MI = {
  bio: [
    process.env.NEXT_PUBLIC_SOBRE_MI_BIO_1 ?? "Con más de una década perfeccionando el arte de la barbería tradicional, Héctor ha creado un espacio donde la técnica se encuentra con la individualidad.",
    process.env.NEXT_PUBLIC_SOBRE_MI_BIO_2 ?? "Cada cliente que entra en mi estudio recibe más que un simple corte; recibe una asesoría completa basada en sus facciones, estilo de vida y personalidad única.",
  ],
  quote: process.env.NEXT_PUBLIC_SOBRE_MI_QUOTE ?? "La precisión no es una opción, es nuestra firma.",
  stats: [
    {
      valor:    process.env.NEXT_PUBLIC_SOBRE_MI_STAT1_VALOR ?? "12+",
      etiqueta: process.env.NEXT_PUBLIC_SOBRE_MI_STAT1_LABEL ?? "Años de experiencia",
    },
    {
      valor:    process.env.NEXT_PUBLIC_SOBRE_MI_STAT2_VALOR ?? "5k+",
      etiqueta: process.env.NEXT_PUBLIC_SOBRE_MI_STAT2_LABEL ?? "Cortes realizados",
    },
  ],
};

// ──────────────────────────────────────────
// SEO / META
// ──────────────────────────────────────────
export const SEO = {
  titleHome:    process.env.NEXT_PUBLIC_SEO_TITLE_HOME    ?? `${BUSINESS.name} — Barbería de Caballeros`,
  titleReserva: process.env.NEXT_PUBLIC_SEO_TITLE_RESERVA ?? `Reservar Cita — ${BUSINESS.name}`,
  descHome:     process.env.NEXT_PUBLIC_SEO_DESC_HOME     ?? `Reserva tu cita en ${BUSINESS.name}. Corte, barba y asesoramiento personalizado.`,
  descReserva:  process.env.NEXT_PUBLIC_SEO_DESC_RESERVA  ?? `Reserva tu cita online en ${BUSINESS.name}.`,
};

// ──────────────────────────────────────────
// ADMIN
// Email del barber — recibe notificación cada vez que entra una reserva
// ──────────────────────────────────────────
export const ADMIN = {
  emailNotificaciones: process.env.ADMIN_NOTIFICATION_EMAIL ?? "",
};

// ──────────────────────────────────────────
// LEGAL
// ──────────────────────────────────────────
export const LEGAL = {
  responsable:   process.env.NEXT_PUBLIC_LEGAL_RESPONSABLE ?? "Héctor Lacorte",
  emailContacto: process.env.NEXT_PUBLIC_LEGAL_EMAIL       ?? "info@hectorlacorte.com",
};
