import Link from "next/link";
import { Metadata } from "next";
import { BUSINESS, LEGAL, SEO } from "@/lib/config";

export const metadata: Metadata = {
  title: `Política de Privacidad — ${BUSINESS.name}`,
  description: `Política de privacidad y protección de datos de ${BUSINESS.name}.`,
};

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      {/* Nav mínimo */}
      <nav className="border-b border-outline/5 px-8 py-6 flex justify-between items-center">
        <Link href="/" className="font-headline font-black uppercase tracking-tighter text-on-surface hover:text-primary transition-colors">
          {BUSINESS.name}
        </Link>
        <Link href="/" className="text-outline hover:text-on-surface text-xs uppercase tracking-widest font-label transition-colors">
          ← Volver
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-20 space-y-12">
        <div>
          <span className="text-primary font-label text-xs uppercase tracking-[0.4em] mb-3 block">Legal</span>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-on-surface uppercase">
            Política de Privacidad
          </h1>
          <p className="text-outline text-sm mt-4 font-body">Última actualización: {new Date().getFullYear()}</p>
        </div>

        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de sus datos personales es <strong className="text-on-surface">{LEGAL.responsable}</strong>,
            con domicilio en {BUSINESS.ciudad}, accesible a través de {BUSINESS.url}.
          </p>
          <p>Para cualquier consulta relacionada con sus datos, puede contactar en: <strong className="text-on-surface">{LEGAL.emailContacto}</strong></p>
        </Section>

        <Section title="2. Datos que recogemos">
          <p>Al realizar una reserva de cita a través de nuestra web, recogemos los siguientes datos personales:</p>
          <ul className="list-disc list-inside space-y-1 text-outline">
            <li>Nombre completo</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Dirección de correo electrónico (opcional)</li>
            <li>Fecha y hora de la cita solicitada</li>
            <li>Servicio elegido</li>
          </ul>
          <p>No recogemos datos especialmente protegidos, datos de menores ni información de pago.</p>
        </Section>

        <Section title="3. Finalidad y base jurídica del tratamiento">
          <p>Sus datos se utilizan exclusivamente para:</p>
          <ul className="list-disc list-inside space-y-1 text-outline">
            <li>Gestionar y confirmar su cita (base jurídica: ejecución de un contrato)</li>
            <li>Enviarle recordatorios o notificaciones relacionadas con su cita (interés legítimo)</li>
            <li>Comunicarle cambios en su cita (interés legítimo)</li>
          </ul>
          <p>No utilizamos sus datos para envíos de marketing ni los cedemos a terceros salvo por obligación legal.</p>
        </Section>

        <Section title="4. Conservación de los datos">
          <p>
            Sus datos se conservarán durante el tiempo necesario para la prestación del servicio y, posteriormente,
            durante los plazos legalmente establecidos para la atención de posibles responsabilidades.
            En todo caso, procederemos a su supresión transcurrido un plazo máximo de 2 años desde la última cita.
          </p>
        </Section>

        <Section title="5. Destinatarios">
          <p>Sus datos no se ceden a terceros, salvo:</p>
          <ul className="list-disc list-inside space-y-1 text-outline">
            <li><strong className="text-on-surface">Resend</strong> — proveedor de envío de correos electrónicos de confirmación (procesador de datos, con acuerdo de encargo de tratamiento)</li>
            <li>Obligación legal o requerimiento de autoridad competente</li>
          </ul>
        </Section>

        <Section title="6. Sus derechos">
          <p>En cualquier momento puede ejercer los siguientes derechos escribiendo a <strong className="text-on-surface">{LEGAL.emailContacto}</strong>:</p>
          <ul className="list-disc list-inside space-y-1 text-outline">
            <li>Acceso a sus datos personales</li>
            <li>Rectificación de datos inexactos</li>
            <li>Supresión (&ldquo;derecho al olvido&rdquo;)</li>
            <li>Limitación u oposición al tratamiento</li>
            <li>Portabilidad de los datos</li>
          </ul>
          <p>Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Esta web no utiliza cookies de seguimiento ni analíticas. Únicamente se utilizan cookies técnicas
            estrictamente necesarias para el funcionamiento del sitio (sesión del panel de administración).
            Estas cookies no requieren consentimiento según la normativa vigente.
          </p>
        </Section>

        <div className="border-t border-outline/10 pt-8">
          <Link href="/" className="text-primary text-xs uppercase tracking-widest font-label hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-headline text-xl font-bold text-on-surface uppercase tracking-tight border-b border-outline/10 pb-3">
        {title}
      </h2>
      <div className="space-y-3 text-outline font-body text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}
