import { Metadata } from "next";
import { SEO } from "@/lib/config";
import ReservarCliente from "./ReservarCliente";

export const metadata: Metadata = {
  title: SEO.titleReserva,
  description: SEO.descReserva,
};

export default function ReservarPage() {
  return <ReservarCliente />;
}
