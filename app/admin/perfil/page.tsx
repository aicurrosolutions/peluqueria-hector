import { Metadata } from "next";
import PerfilCliente from "./PerfilCliente";

export const metadata: Metadata = {
  title: "Perfil — Admin",
};

export default function PerfilPage() {
  return <PerfilCliente />;
}
