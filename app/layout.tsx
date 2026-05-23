import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { SEO, BUSINESS } from "@/lib/config";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: SEO.titleHome,
  description: SEO.descHome,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: SEO.titleHome,
    description: SEO.descHome,
    type: "website",
    url: BUSINESS.url,
    images: [
      {
        url: `${BUSINESS.url}/fondo.hero.jpg`,
        width: 1200,
        height: 630,
        alt: BUSINESS.name,
      },
    ],
  },
};

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "117, 91, 0";
  return `${r}, ${g}, ${b}`;
}

function ThemeStyle() {
  const primary          = process.env.NEXT_PUBLIC_COLOR_PRIMARY              ?? "#755B00";
  const primaryDim       = process.env.NEXT_PUBLIC_COLOR_PRIMARY_DIM          ?? "#584400";
  const primaryContainer = process.env.NEXT_PUBLIC_COLOR_PRIMARY_CONTAINER    ?? "#FFE08F";
  const onPrimaryContainer = process.env.NEXT_PUBLIC_COLOR_ON_PRIMARY_CONTAINER ?? "#241A00";

  const css = `:root{--color-primary:${primary};--color-primary-rgb:${hexToRgb(primary)};--color-primary-dim:${primaryDim};--color-primary-dim-rgb:${hexToRgb(primaryDim)};--color-primary-container:${primaryContainer};--color-primary-container-rgb:${hexToRgb(primaryContainer)};--color-on-primary-container:${onPrimaryContainer};--color-on-primary-container-rgb:${hexToRgb(onPrimaryContainer)}}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${manrope.variable} dark`}>
      <body suppressHydrationWarning>
        <ThemeStyle />
        {children}
      </body>
    </html>
  );
}
