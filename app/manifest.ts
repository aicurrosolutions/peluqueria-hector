import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const nombre = process.env.NEXT_PUBLIC_BARBERIA_NOMBRE ?? "Héctor Lacorte";
  const initials = nombre
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    name:             process.env.NEXT_PUBLIC_MANIFEST_NOMBRE       ?? `${nombre} — Admin`,
    short_name:       process.env.NEXT_PUBLIC_MANIFEST_SHORT_NAME   ?? `${initials} Admin`,
    description:      process.env.NEXT_PUBLIC_MANIFEST_DESCRIPCION  ?? `Panel de administración de ${nombre}`,
    start_url:        "/admin/dashboard",
    scope:            "/admin",
    display:          "standalone",
    orientation:      "portrait",
    background_color: "#0D0D0D",
    theme_color:      "#0D0D0D",
    icons: [
      { src: "/logo.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
  };
}
