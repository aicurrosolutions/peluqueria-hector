import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-surface-container flex items-center justify-center">
            <SearchX size={32} className="text-on-surface-variant" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-6xl font-headline font-black text-primary">404</p>
          <h1 className="text-xl font-headline font-bold uppercase tracking-tight text-on-surface">
            Página no encontrada
          </h1>
          <p className="text-on-surface-variant text-sm font-body">
            La página que buscás no existe o fue movida.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest hover:bg-primary-dim transition-all"
          >
            Ir al inicio
          </Link>
          <Link
            href="/reservar"
            className="px-6 py-3 border border-outline text-on-surface font-headline font-bold uppercase text-xs tracking-widest hover:bg-surface-container transition-all"
          >
            Reservar cita
          </Link>
        </div>
      </div>
    </div>
  );
}
