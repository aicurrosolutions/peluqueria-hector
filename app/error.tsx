"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", {
      message: error?.message ?? String(error),
      digest: error?.digest,
      stack: error?.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-error/10 flex items-center justify-center">
            <AlertTriangle size={32} className="text-error" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-headline font-black uppercase tracking-tight text-on-surface">
            Algo salió mal
          </h1>
          <p className="text-on-surface-variant text-sm font-body">
            Se produjo un error inesperado. Si el problema persiste, contactá con el administrador.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-outline mt-2">
              Código: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest hover:bg-primary-dim transition-all"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
