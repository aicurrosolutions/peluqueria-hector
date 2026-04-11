import Image from "next/image";
import Link from "next/link";
import { BUSINESS, HORARIO_VISIBLE, SERVICIOS_LANDING, SOBRE_MI } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-on-surface">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt={BUSINESS.name} width={32} height={32} className="invert opacity-90" />
          <span className="text-xl font-black tracking-tighter text-on-surface font-headline uppercase">{BUSINESS.name}</span>
        </div>
        <div className="hidden md:flex items-center space-x-12">
          <a href="#servicios" className="text-primary border-b border-primary pb-0.5 font-headline uppercase tracking-widest text-xs">Servicios</a>
          <a href="#galeria" className="text-on-surface hover:text-primary transition-colors font-headline uppercase tracking-widest text-xs">Galería</a>
          <a href="#sobre-mi" className="text-on-surface hover:text-primary transition-colors font-headline uppercase tracking-widest text-xs">Sobre mí</a>
          <a href="#contacto" className="text-on-surface hover:text-primary transition-colors font-headline uppercase tracking-widest text-xs">Contacto</a>
        </div>
        <Link href="/reservar" className="bg-primary text-on-primary px-8 py-3 font-headline font-bold uppercase tracking-wider hover:bg-primary-dim active:scale-95 transition-all text-sm">
          Reservar cita
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          <Image
            src="/fondo.hero.jpg"
            alt={`Barbería ${BUSINESS.name}`}
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="relative z-20 text-center px-4">
          <h1 className="font-headline text-[11vw] leading-none font-bold tracking-tighter text-on-surface mb-6 select-none">
            {BUSINESS.name}
          </h1>
          <p className="font-headline text-lg md:text-2xl font-light tracking-[0.3em] text-primary uppercase mb-12">
            {BUSINESS.tagline}
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/reservar" className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 font-headline font-bold uppercase tracking-[0.2em] hover:bg-primary-dim transition-all active:scale-95 text-sm">
              Reservar cita
            </Link>
            <a href="#servicios" className="w-full md:w-auto px-12 py-5 border border-outline/30 font-headline font-bold uppercase tracking-[0.2em] text-on-surface hover:bg-surface-bright transition-all text-sm">
              Servicios
            </a>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-32 bg-surface px-8 md:px-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <span className="text-primary font-headline tracking-[0.4em] uppercase text-xs mb-4 block">Maestría y Precisión</span>
            <h2 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-on-surface">Servicios</h2>
          </div>
          <p className="text-outline max-w-sm font-body font-light leading-relaxed text-sm">
            Cada corte es una declaración de identidad. Técnicas clásicas con visión moderna.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-px bg-outline/10">
          {SERVICIOS_LANDING.map((s) => (
            <div key={s.nombre} className="group relative flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest p-10 md:p-12 hover:bg-surface-container transition-colors duration-500">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">{s.nombre}</h3>
                <p className="text-outline text-sm font-body font-light max-w-md">{s.descripcion}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-2 text-outline text-xs uppercase tracking-widest font-label font-bold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {s.duracion} min
                  </span>
                  {s.nota && (
                    <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] uppercase font-bold tracking-tight font-label">
                      {s.nota}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-10 mt-8 md:mt-0">
                <span className="text-4xl md:text-5xl font-headline font-bold text-primary">{s.precio}€</span>
                <Link href="/reservar" className="bg-surface-bright text-on-surface px-6 py-3 font-headline font-bold uppercase text-xs tracking-widest group-hover:bg-primary group-hover:text-on-primary transition-all">
                  Reservar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="py-32 bg-surface-container-lowest">
        <div className="px-8 md:px-24 mb-16">
          <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-on-surface mb-4">Nuestros Cortes</h2>
          <div className="h-1 w-24 bg-primary" />
        </div>
        {/* Mobile: 2 columnas uniformes */}
        <div className="grid grid-cols-2 gap-2 px-4 md:hidden">
          {["/galeria-1.png", "/galeria-2.png", "/galeria-3.png", "/galeria-4.png"].map((src, i) => (
            <div key={i} className="aspect-[3/4] relative overflow-hidden group">
              <Image
                src={src}
                alt={`Corte ${i + 1} - ${BUSINESS.name}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
        {/* Desktop: 4 columnas uniformes */}
        <div className="hidden md:grid grid-cols-4 gap-3 px-4">
          {["/galeria-1.png", "/galeria-2.png", "/galeria-3.png", "/galeria-4.png"].map((src, i) => (
            <div key={i} className="aspect-[3/4] relative overflow-hidden group">
              <Image
                src={src}
                alt={`Corte ${i + 1} - ${BUSINESS.name}`}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE MÍ */}
      <section id="sobre-mi" className="py-32 bg-surface">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row items-center gap-20">
          <div className="relative w-full md:w-1/2 group shrink-0">
            <div className="absolute -top-4 -left-4 w-full h-full border border-primary opacity-20 group-hover:top-0 group-hover:left-0 transition-all duration-500" />
            <div className="w-full h-[500px] md:h-[600px] relative overflow-hidden">
              <Image src="/hector.jpg" alt={BUSINESS.name} fill className="object-cover" />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-primary font-headline tracking-[0.4em] uppercase text-xs mb-6 block">{BUSINESS.role}</span>
            <h2 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-on-surface mb-8">{BUSINESS.name}</h2>
            <div className="space-y-6 text-outline font-body font-light leading-relaxed text-base">
              {SOBRE_MI.bio.map((p, i) => <p key={i}>{p}</p>)}
              <p className="font-headline italic text-on-surface text-xl">&ldquo;{SOBRE_MI.quote}&rdquo;</p>
            </div>
            <div className="mt-12 flex gap-12 border-t border-outline/10 pt-8">
              {SOBRE_MI.stats.map((s) => (
                <div key={s.etiqueta}>
                  <span className="block text-2xl font-headline font-bold text-on-surface">{s.valor}</span>
                  <span className="text-[10px] uppercase tracking-widest text-outline font-label">{s.etiqueta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* UBICACIÓN Y CONTACTO */}
      <section id="contacto" className="py-32 bg-surface">
        <div className="max-w-6xl mx-auto px-8 md:px-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="text-primary font-headline tracking-[0.4em] uppercase text-xs mb-4 block">Encuéntranos</span>
              <h2 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-on-surface">Ubicación</h2>
            </div>
            <div className="flex flex-col gap-4 text-right">
              <a
                href={`tel:${BUSINESS.telefono.replace(/\s/g, "")}`}
                className="group flex items-center justify-end gap-3 hover:text-primary transition-colors"
              >
                <span className="font-headline font-bold text-on-surface text-lg group-hover:text-primary transition-colors">
                  {BUSINESS.telefono}
                </span>
                <div className="w-9 h-9 border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                  <svg className="w-4 h-4 text-primary group-hover:text-on-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </div>
              </a>
              <p className="text-outline text-sm font-body font-light max-w-xs text-right leading-relaxed">
                {BUSINESS.direccion}
              </p>
              <Link
                href="/reservar"
                className="mt-2 inline-block bg-primary text-on-primary px-8 py-3 font-headline font-bold uppercase tracking-wider hover:bg-primary-dim transition-all text-sm text-center"
              >
                Reservar cita
              </Link>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative w-full overflow-hidden" style={{ paddingBottom: "45%" }}>
            <iframe
              title="Ubicación Héctor Lacorte"
              src="https://maps.google.com/maps?q=H%C3%A9ctor+Lacorte,+C.+Martinetes+7,+Sanl%C3%BAcar+la+Mayor,+Sevilla&output=embed&hl=es&z=16"
              className="absolute inset-0 w-full h-full border-0 grayscale contrast-125"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Overlay de marca */}
            <div className="absolute top-4 left-4 bg-surface/95 backdrop-blur-sm px-4 py-3 pointer-events-none">
              <p className="text-[10px] uppercase tracking-widest text-primary font-label font-bold">Barbería</p>
              <p className="text-sm font-headline font-bold text-on-surface uppercase">{BUSINESS.name}</p>
              <p className="text-[10px] text-outline font-label mt-0.5">{BUSINESS.direccion}</p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline/5 mt-px">
            <div className="bg-surface-container-low p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-widest text-primary font-label font-bold mb-3">Dirección</p>
              <p className="text-sm font-body text-on-surface leading-relaxed">{BUSINESS.direccion}</p>
              <a
                href={`https://maps.google.com/maps?q=H%C3%A9ctor+Lacorte,+C.+Martinetes+7,+Sanl%C3%BAcar+la+Mayor`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-[10px] uppercase tracking-widest text-primary hover:underline font-label"
              >
                Abrir en Google Maps →
              </a>
            </div>
            <div className="bg-surface-container-low p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-widest text-primary font-label font-bold mb-3">Contacto</p>
              <a href={`tel:${BUSINESS.telefono.replace(/\s/g, "")}`} className="text-sm font-body text-on-surface hover:text-primary transition-colors block">{BUSINESS.telefono}</a>
              <a href={`https://instagram.com/${BUSINESS.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm font-body text-on-surface hover:text-primary transition-colors block mt-1">@{BUSINESS.instagram}</a>
            </div>
            <div className="bg-surface-container-low p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-widest text-primary font-label font-bold mb-3">Horario</p>
              <div className="space-y-1">
                {HORARIO_VISIBLE.slice(0, 4).map((h) => (
                  <div key={h.dia} className="flex justify-between text-xs font-label">
                    <span className="text-outline uppercase tracking-wider">{h.dia}</span>
                    <span className={h.horas === "Cerrado" ? "text-outline/40" : "text-on-surface"}>{h.horas}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM STRIP */}
      <section className="py-16 bg-surface-container-lowest border-y border-outline/5">
        <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-24 gap-8">
          <div className="flex items-center gap-5">
            <svg className="text-primary w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
            <div>
              <h4 className="font-headline font-bold text-xl text-on-surface">@{BUSINESS.instagram}</h4>
              <p className="text-outline text-[10px] uppercase tracking-widest font-label">Síguenos para inspiración diaria</p>
            </div>
          </div>
          <a href={`https://instagram.com/${BUSINESS.instagram}`} target="_blank" rel="noopener noreferrer" className="px-10 py-4 border border-primary text-primary font-headline font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all text-sm">
            Seguir en Instagram
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface-container-lowest grid grid-cols-1 md:grid-cols-3 gap-12 px-8 md:px-12 py-20 border-t border-outline/5">
        <div className="flex flex-col gap-6">
          <span className="text-lg font-black text-on-surface font-headline uppercase">{BUSINESS.name}</span>
          <p className="text-outline font-body font-light leading-relaxed text-xs max-w-xs">
            {BUSINESS.description}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-[0.3em]">Horario</span>
          {HORARIO_VISIBLE.map((h) => (
            <div key={h.dia}>
              <p className="text-on-surface font-label text-xs uppercase tracking-wider">{h.dia}</p>
              <p className={`font-label text-xs mt-0.5 ${h.horas === "Cerrado" ? "text-outline/40" : "text-outline"}`}>{h.horas}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <span className="text-primary font-headline font-bold text-[10px] uppercase tracking-[0.3em]">Contacto</span>
          <a href={`https://instagram.com/${BUSINESS.instagram}`} target="_blank" rel="noopener noreferrer" className="text-outline hover:text-primary underline decoration-1 transition-colors font-label text-xs uppercase tracking-wider">
            Instagram @{BUSINESS.instagram}
          </a>
          {BUSINESS.telefono && (
            <a href={`tel:${BUSINESS.telefono}`} className="text-outline hover:text-primary underline decoration-1 transition-colors font-label text-xs uppercase tracking-wider">
              {BUSINESS.telefono}
            </a>
          )}
          {BUSINESS.direccion && (
            <p className="text-outline font-label text-xs uppercase tracking-wider">{BUSINESS.direccion}</p>
          )}
          <Link href="/reservar" className="text-outline hover:text-primary underline decoration-1 transition-colors font-label text-xs uppercase tracking-wider">
            Reservar cita
          </Link>
          <Link href="/privacidad" className="text-outline/50 hover:text-outline underline decoration-1 transition-colors font-label text-xs uppercase tracking-wider">
            Política de privacidad
          </Link>
        </div>
        <div className="md:col-span-3 border-t border-outline/5 pt-8">
          <p className="text-outline/40 text-[10px] uppercase tracking-[0.2em] font-label">© {new Date().getFullYear()} {BUSINESS.name}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
