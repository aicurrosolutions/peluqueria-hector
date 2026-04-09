"use client";

import { usePathname } from "next/navigation";
import AdminNav from "./AdminNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin";

  if (isLogin) {
    // Página de login: sin sidebar, sin márgenes, pantalla completa
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminNav />
      <main className="flex-1 overflow-y-auto lg:ml-64 pt-[57px] pb-[65px] lg:pt-0 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
