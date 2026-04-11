"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BUSINESS } from "@/lib/config";

export default function LoginCliente() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Credenciales incorrectas");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-surface-container mb-6 flex items-center justify-center relative overflow-hidden">
            <Image src="/logo.png" alt="HL" fill className="object-contain opacity-80 p-4" />
          </div>
          <h1 className="font-headline text-2xl font-black text-primary uppercase tracking-tighter">{BUSINESS.name}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mt-1 font-label">Panel de Control</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="group">
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant group-focus-within:text-primary transition-colors block mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-3 font-headline text-xl uppercase placeholder:text-outline/50 text-on-surface outline-none transition-all"
              placeholder="HECTOR"
            />
          </div>
          <div className="group">
            <label className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant group-focus-within:text-primary transition-colors block mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-3 font-headline text-xl placeholder:text-outline/50 text-on-surface outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-error text-xs border-l-2 border-error pl-3 font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando || !username || !password}
            className="w-full bg-primary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-5 hover:bg-primary-dim transition-all active:scale-95 disabled:opacity-30 mt-4"
          >
            {cargando ? "Entrando..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
}
