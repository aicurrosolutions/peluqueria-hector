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
  openGraph: {
    title: SEO.titleHome,
    description: SEO.descHome,
    type: "website",
    url: BUSINESS.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${spaceGrotesk.variable} ${manrope.variable} dark`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
