"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { BUSINESS } from "@/lib/config";

export default function PerfilCliente() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (newPassword !== confirmPassword) {
      setResult({ ok: false, message: "Las contraseñas nuevas no coinciden" });
      return;
    }

    if (newPassword.length < 8) {
      setResult({ ok: false, message: "La contraseña nueva debe tener al menos 8 caracteres" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? "Error al cambiar la contraseña" });
      } else {
        setResult({ ok: true, message: "Contraseña actualizada correctamente" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setResult({ ok: false, message: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="text-2xl font-headline font-black uppercase tracking-tight text-on-surface">
          Perfil
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">{BUSINESS.name} · Administrador</p>
      </div>

      <div className="bg-surface-container p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
            <KeyRound size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-headline font-bold uppercase tracking-widest text-on-surface">
              Cambiar contraseña
            </h2>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Mínimo 8 caracteres. Se guarda de forma segura en la base de datos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-surface border border-outline/40 px-3 py-2.5 pr-10 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                placeholder="Tu contraseña actual"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
              Contraseña nueva
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-surface border border-outline/40 px-3 py-2.5 pr-10 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
              Confirmar contraseña nueva
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-surface border border-outline/40 px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              placeholder="Repite la contraseña nueva"
            />
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 p-3 text-sm ${
                result.ok
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-error/10 text-error border border-error/20"
              }`}
            >
              {result.ok ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-widest hover:bg-primary-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>

    </div>
  );
}
