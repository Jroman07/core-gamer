"use client";

import { Card, CardContent } from "@/components/ui/card";

const platforms = [
  { label: "Steam", icon: "🎮" },
  { label: "Epic Games", icon: "⚡" },
  { label: "Gameplay", icon: "▶" },
  { label: "System Req.", icon: "💻" },
  { label: "Reviews", icon: "★" },
];

const footerLinks = {
  legal: ["Politica de privacidad", "Terminos y condiciones"],
  support: ["SOPORTE", "DOCUMENTACIÓN"],
};

export default function Footer() {
  return (
    <>
      <section className="bg-muted px-4 py-12 md:px-12 md:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
          {platforms.map((platform) => (
            <a key={platform.label} href="#" className="block">
              <Card className="glass-card h-full transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="text-xl opacity-80">{platform.icon}</span>
                <span className="font-display text-xs font-bold uppercase tracking-widest">
                  {platform.label}
                </span>
              </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <footer className="border-t border-primary/10 bg-background px-4 py-10 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-3">
          <div className="text-center md:text-left">
            <p className="mb-2 font-display text-lg font-bold">CORE GAMER</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              © 2026 CORE GAMER. Binary Productions.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:gap-8">
            {footerLinks.legal.map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center md:justify-end md:gap-8">
            {footerLinks.support.map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
