"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", {
      message: error?.message ?? String(error),
      digest: error?.digest,
      stack: error?.stack,
    });
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-error/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-error" />
          </div>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-headline font-black uppercase tracking-tight text-on-surface">
            Error en el panel
          </h2>
          <p className="text-on-surface-variant text-sm">
            {error.message || "Se produjo un error inesperado."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-outline">
              {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary-dim transition-all"
          >
            <RotateCcw size={12} />
            Reintentar
          </button>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2.5 border border-outline text-on-surface-variant font-label text-xs uppercase tracking-widest hover:bg-surface-container transition-all"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
