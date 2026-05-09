import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CORE GAMER — Recomendaciones por IA",
  description: "Motor de IA que analiza tus especificaciones técnicas y te recomienda los mejores juegos para tu PC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
