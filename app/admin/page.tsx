import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { BUSINESS } from "@/lib/config";
import LoginCliente from "./LoginCliente";

export const metadata: Metadata = { title: `Admin — ${BUSINESS.name}` };

export default async function AdminPage() {
  // Si ya hay sesión válida, ir directamente al dashboard sin pasar por el login
  const session = await getAdminSession();
  if (session) redirect("/admin/dashboard");

  return <LoginCliente />;
}
