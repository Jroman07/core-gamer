"use client";

import { ArrowDownIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ANALYSIS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCI_Me26wAfFhRmJrEjbR6BDRu4oUK7qPnQOvecSIHjXxyVZPj1ix_u5lCwDe5UsXeZJlWN6k0jb1kiohQU15vTbXizJYgroCxV-dTWq_DlAtL9Ji9DMXKAyh6m9BF9iGqCkQaTrU6GpdDPu4CvuzT_SHzGif_fjbdC0pgONbTtcu4dfKqRtsFRBAz0USjKvxM_qD6l3U2IIvqX4_IuELHqVctfmJJI_-JTYees3BptN4qXqKNy6HdgpIjSWxLvOifwYaKSzE6-Z7A";

export default function HeroSection() {
  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-28 md:px-12 md:py-32"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-xl bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-xl bg-primary/5 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-10 lg:flex-row lg:gap-16">
        <div className="animate-fade-up flex w-full max-w-xl flex-col items-center gap-6 text-center lg:max-w-lg lg:items-start lg:text-left">
          <Badge variant="outline" className="font-display uppercase tracking-widest">
            IA para gamers
          </Badge>

          <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.05em] text-foreground">
            Encuentra los mejores{" "}
            <span className="text-primary">juegos</span> para tu PC
          </h1>

          <Separator className="w-16 bg-primary lg:mx-0" />

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

        <div className="animate-fade-in delay-400 w-full max-w-md lg:max-w-[480px]">
          <Card
            variant="glass"
            className="group relative rotate-2 overflow-hidden py-0 transition-transform duration-300 hover:rotate-0"
          >
            <CardContent className="relative p-4">
              <AspectRatio ratio={1}>
                <img
                  src={ANALYSIS_IMG}
                  alt="Game Analysis Visual"
                  className="size-full rounded-md object-cover opacity-80"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </AspectRatio>
              <Card variant="glass" className="absolute bottom-6 left-6 right-6 gap-0 py-0 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="h-8 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Matching Accuracy
                    </p>
                    <p className="font-display text-xl font-bold text-foreground">
                      98.4%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
