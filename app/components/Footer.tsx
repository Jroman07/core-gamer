"use client";

import {
  Gamepad2Icon,
  MonitorIcon,
  PlayIcon,
  StarIcon,
  ZapIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const platforms = [
  { label: "Steam", icon: Gamepad2Icon },
  { label: "Epic Games", icon: ZapIcon },
  { label: "Gameplay", icon: PlayIcon },
  { label: "System Req.", icon: MonitorIcon },
  { label: "Reviews", icon: StarIcon },
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
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <a key={platform.label} href="#" className="block">
                <Card
                  variant="glass"
                  className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <Icon className="size-5 text-primary/80" />
                    <span className="font-display text-xs font-bold uppercase tracking-widest">
                      {platform.label}
                    </span>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-primary/10 bg-background px-4 py-10 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Separator className="mb-8 bg-primary/20" />
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="text-center md:text-left">
              <p className="mb-2 font-display text-lg font-bold">CORE GAMER</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                © 2026 CORE GAMER. Binary Productions.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center md:gap-4">
              {footerLinks.legal.map((label) => (
                <a
                  key={label}
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "h-auto px-2 text-xs uppercase tracking-widest"
                  )}
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center md:justify-end md:gap-4">
              {footerLinks.support.map((label) => (
                <a
                  key={label}
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "h-auto px-2 text-xs uppercase tracking-widest"
                  )}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
