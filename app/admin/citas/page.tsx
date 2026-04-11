import { redirect } from "next/navigation";
import { format } from "date-fns";

interface Props {
  searchParams: Promise<{ fecha?: string; nueva?: string }>;
}

// Esta página ya no existe — redirige al dashboard con los mismos parámetros
export default async function CitasPage({ searchParams }: Props) {
  const params = await searchParams;
  const fecha = params.fecha ?? format(new Date(), "yyyy-MM-dd");
  const extra = params.nueva === "1" ? "&nueva=1" : "";
  redirect(`/admin/dashboard?fecha=${fecha}${extra}`);
}
