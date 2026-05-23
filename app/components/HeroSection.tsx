"use client";

import { ArrowDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ANALYSIS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCI_Me26wAfFhRmJrEjbR6BDRu4oUK7qPnQOvecSIHjXxyVZPj1ix_u5lCwDe5UsXeZJlWN6k0jb1kiohQU15vTbXizJYgroCxV-dTWq_DlAtL9Ji9DMXKAyh6m9BF9iGqCkQaTrU6GpdDPu4CvuzT_SHzGif_fjbdC0pgONbTtcu4dfKqRtsFRBAz0USjKvxM_qD6l3U2IIvqX4_IuELHqVctfmJJI_-JTYees3BptN4qXqKNy6HdgpIjSWxLvOifwYaKSzE6-Z7A";

export default function HeroSection() {
  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-between gap-10 overflow-hidden px-6 pb-20 pt-28 md:gap-12 md:px-12 md:pt-32 lg:flex-row lg:gap-12"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-xl bg-primary/10 blur-3xl" />

      <div className="animate-fade-up flex w-full flex-col gap-6 lg:max-w-xl lg:flex-1">
        <h1 className="font-display text-[clamp(3.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.05em] text-foreground">
          Encuentra
          <br />
          los mejores
          <br />
          <span className="text-primary">juegos</span> para
          <br />
          tu PC
        </h1>

        <p className="animate-fade-up delay-200 max-w-lg text-lg font-light leading-relaxed text-muted-foreground">
          Nuestro motor de IA analiza tus especificaciones técnicas y patrones de
          juego para entregarte recomendaciones precisas que realmente corren en
          tu máquina.
        </p>

        <div className="animate-fade-up delay-300 pt-2">
          <Button variant="gradient" size="lg" onClick={scrollToForm}>
            Comenzar
            <ArrowDownIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="animate-fade-in delay-400 w-full lg:max-w-[590px] lg:flex-1">
        <Card className="glass-card group relative rotate-2 overflow-hidden py-0 transition-transform duration-300 hover:rotate-0">
          <CardContent className="p-4">
            <img
              src={ANALYSIS_IMG}
              alt="Game Analysis Visual"
              className="aspect-square w-full rounded-md object-cover opacity-80"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-md border border-border/80 bg-card/60 p-4 backdrop-blur-md">
              <div className="h-8 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Matching Accuracy
                </p>
                <p className="font-display text-xl font-bold text-foreground">
                  98.4%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
