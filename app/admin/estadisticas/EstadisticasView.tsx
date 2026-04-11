interface Periodo {
  totalCitas: number;
  ingresos: number;
  canceladas: number;
  completadas: number;
  clientesNuevos: number;
}

interface Props {
  semanal: Periodo;
  mensual: Periodo;
}

export default function EstadisticasView({ semanal, mensual }: Props) {
  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface px-4 md:px-10 py-5 md:py-8 border-b border-outline/5">
        <span className="text-primary text-[10px] font-bold tracking-[0.4em] uppercase mb-1 block font-label">
          Panel de control
        </span>
        <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter text-on-surface uppercase">
          Estadísticas
        </h2>
      </header>

      <div className="px-4 md:px-10 py-8 md:py-10 space-y-10">

        {/* BLOQUE SEMANAL */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div>
              <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-label font-bold mb-0.5">
                Esta semana
              </p>
              <h3 className="font-headline text-xl font-bold text-on-surface uppercase tracking-tight">
                Resumen Semanal
              </h3>
            </div>
            <div className="h-px flex-1 bg-outline/10" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline/5">
            <StatCard
              label="Citas totales"
              value={pad(semanal.totalCitas)}
              color="text-on-surface"
            />
            <StatCard
              label="Ingresos est."
              value={`${semanal.ingresos.toFixed(0)}€`}
              color="text-primary"
              large
            />
            <StatCard
              label="Canceladas"
              value={pad(semanal.canceladas)}
              color="text-error"
            />
            <StatCard
              label="Clientes nuevos"
              value={pad(semanal.clientesNuevos)}
              color="text-on-surface"
            />
          </div>

          {/* Barra de progreso cancelaciones semanales */}
          {semanal.totalCitas > 0 && (
            <div className="mt-3 bg-surface-container-low px-5 py-4 flex items-center gap-4">
              <span className="text-[10px] text-outline uppercase tracking-widest font-label w-28 shrink-0">
                Tasa cancelación
              </span>
              <div className="flex-1 bg-surface-container-high h-1.5 overflow-hidden">
                <div
                  className="h-full bg-error transition-all"
                  style={{ width: `${Math.round((semanal.canceladas / semanal.totalCitas) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-outline font-label w-10 text-right">
                {Math.round((semanal.canceladas / semanal.totalCitas) * 100)}%
              </span>
            </div>
          )}
        </section>

        {/* BLOQUE MENSUAL */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div>
              <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-label font-bold mb-0.5">
                Este mes
              </p>
              <h3 className="font-headline text-xl font-bold text-on-surface uppercase tracking-tight">
                Resumen Mensual
              </h3>
            </div>
            <div className="h-px flex-1 bg-outline/10" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline/5">
            <StatCard
              label="Citas totales"
              value={pad(mensual.totalCitas)}
              color="text-on-surface"
            />
            <StatCard
              label="Ingresos est."
              value={`${mensual.ingresos.toFixed(0)}€`}
              color="text-primary"
              large
            />
            <StatCard
              label="Canceladas"
              value={pad(mensual.canceladas)}
              color="text-error"
            />
            <StatCard
              label="Clientes nuevos"
              value={pad(mensual.clientesNuevos)}
              color="text-on-surface"
            />
          </div>

          {/* Barra de progreso cancelaciones mensuales */}
          {mensual.totalCitas > 0 && (
            <div className="mt-3 bg-surface-container-low px-5 py-4 flex items-center gap-4">
              <span className="text-[10px] text-outline uppercase tracking-widest font-label w-28 shrink-0">
                Tasa cancelación
              </span>
              <div className="flex-1 bg-surface-container-high h-1.5 overflow-hidden">
                <div
                  className="h-full bg-error transition-all"
                  style={{ width: `${Math.round((mensual.canceladas / mensual.totalCitas) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-outline font-label w-10 text-right">
                {Math.round((mensual.canceladas / mensual.totalCitas) * 100)}%
              </span>
            </div>
          )}
        </section>

        {/* COMPARATIVA */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <div>
              <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-label font-bold mb-0.5">
                Comparativa
              </p>
              <h3 className="font-headline text-xl font-bold text-on-surface uppercase tracking-tight">
                Semana vs Mes
              </h3>
            </div>
            <div className="h-px flex-1 bg-outline/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline/5">
            <ComparativaRow
              label="Citas"
              semanal={semanal.totalCitas}
              mensual={mensual.totalCitas}
              formato={(v) => pad(v)}
            />
            <ComparativaRow
              label="Ingresos"
              semanal={semanal.ingresos}
              mensual={mensual.ingresos}
              formato={(v) => `${v.toFixed(0)}€`}
              highlight
            />
            <ComparativaRow
              label="Canceladas"
              semanal={semanal.canceladas}
              mensual={mensual.canceladas}
              formato={(v) => pad(v)}
            />
            <ComparativaRow
              label="Clientes nuevos"
              semanal={semanal.clientesNuevos}
              mensual={mensual.clientesNuevos}
              formato={(v) => pad(v)}
            />
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function StatCard({
  label, value, color, large = false,
}: {
  label: string; value: string; color: string; large?: boolean;
}) {
  return (
    <div className="bg-surface-container-low px-4 md:px-6 py-5">
      <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-outline font-label mb-2">
        {label}
      </p>
      <p className={`font-headline font-bold ${color} ${large ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl"}`}>
        {value}
      </p>
    </div>
  );
}

function ComparativaRow({
  label, semanal, mensual, formato, highlight = false,
}: {
  label: string; semanal: number; mensual: number;
  formato: (v: number) => string; highlight?: boolean;
}) {
  return (
    <div className="bg-surface-container-low px-5 py-5 flex items-center justify-between gap-4">
      <span className="text-[10px] text-outline uppercase tracking-widest font-label w-28 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-6 ml-auto">
        <div className="text-right">
          <p className="text-[9px] text-outline uppercase tracking-wider font-label mb-0.5">Semana</p>
          <p className={`font-headline font-bold text-lg ${highlight ? "text-primary" : "text-on-surface"}`}>
            {formato(semanal)}
          </p>
        </div>
        <div className="w-px h-8 bg-outline/10" />
        <div className="text-right">
          <p className="text-[9px] text-outline uppercase tracking-wider font-label mb-0.5">Mes</p>
          <p className={`font-headline font-bold text-lg ${highlight ? "text-primary" : "text-on-surface"}`}>
            {formato(mensual)}
          </p>
        </div>
      </div>
    </div>
  );
}
