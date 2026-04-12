// ============================================================
// CONFIGURACIÓN DEL NEGOCIO
// Edita solo este archivo para adaptar la web a un nuevo cliente
// ============================================================

export const BUSINESS = {
  // Nombre que aparece en toda la web, emails y SEO
  name: "Héctor Lacorte",

  // Subtítulo que aparece bajo el nombre (nav, admin sidebar)
  role: "Master Barber",

  // Tagline principal del hero
  tagline: "El corte perfecto. Solo para caballeros.",

  // Descripción corta para footer y emails
  description: "Barbería de autor centrada en la excelencia y el trato personalizado para el caballero moderno.",

  // Instagram (sin @)
  instagram: "hector.lacorte",

  // Teléfono (opcional, déjalo vacío si no se quiere mostrar)
  telefono: "605 29 28 90",

  // Dirección física (opcional)
  direccion: "C. Martinetes, 7, Local 10, 41800 Sanlúcar la Mayor, Sevilla",

  // Ciudad (para el SEO y legal)
  ciudad: "Sanlúcar la Mayor, Sevilla",

  // URL pública de la web (sin barra final)
  url: "https://peluqueria-hector.vercel.app",
} as const;

// ──────────────────────────────────────────
// TEXTOS DE LA SECCIÓN "SOBRE MÍ"
// ──────────────────────────────────────────
export const SOBRE_MI = {
  bio: [
    "Con más de una década perfeccionando el arte de la barbería tradicional, Héctor ha creado un espacio donde la técnica se encuentra con la individualidad.",
    "Cada cliente que entra en mi estudio recibe más que un simple corte; recibe una asesoría completa basada en sus facciones, estilo de vida y personalidad única.",
  ],
  quote: "La precisión no es una opción, es nuestra firma.",
  stats: [
    { valor: "12+", etiqueta: "Años de experiencia" },
    { valor: "5k+", etiqueta: "Cortes realizados" },
  ],
} as const;

// ──────────────────────────────────────────
// SEO / META
// ──────────────────────────────────────────
export const SEO = {
  titleHome:    `${BUSINESS.name} — Barbería de Caballeros`,
  titleReserva: `Reservar Cita — ${BUSINESS.name}`,
  descHome:     `Reserva tu cita en ${BUSINESS.name}. Corte, barba y asesoramiento personalizado.`,
  descReserva:  `Reserva tu cita online en ${BUSINESS.name}.`,
} as const;

// ──────────────────────────────────────────
// ADMIN
// Email del barber — recibe notificación cada vez que entra una reserva
// ──────────────────────────────────────────
export const ADMIN = {
  emailNotificaciones: process.env.ADMIN_NOTIFICATION_EMAIL ?? "",
} as const;

// ──────────────────────────────────────────
// LEGAL
// ──────────────────────────────────────────
export const LEGAL = {
  // Nombre legal del responsable del tratamiento de datos
  responsable: "Héctor Lacorte",
  // Email de contacto para ejercer derechos RGPD
  emailContacto: "info@hectorlacorte.com",
} as const;
