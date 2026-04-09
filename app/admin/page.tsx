import { Metadata } from "next";
import LoginCliente from "./LoginCliente";

export const metadata: Metadata = { title: "Admin — Héctor Lacorte" };

export default function AdminPage() {
  return <LoginCliente />;
}
