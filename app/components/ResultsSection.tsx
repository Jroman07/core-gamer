"use client";

import { useState } from "react";
import { LayoutGridIcon, ListIcon } from "lucide-react";
import GameCard from "./GameCard";
import { useGameContext } from "../context/GameContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const GAMES = [
  {
    name: "Cyber Odyssey",
    genre: "Open World / RPG",
    description:
      "Explora un mundo distópico donde tus decisiones alteran el destino de civilizaciones enteras.",
    url: "https://www.cyberpunk.net",
    badges: [
      { label: "IA Match", type: "ia" as const },
      { label: "98%", type: "pct" as const },
    ],
    compat: { label: "Compatible", type: "green" as const },
  },
  {
    name: "Neon Strike",
    genre: "Tactical Shooter",
    description:
      "Combate 5v5 de alta precisión. Tu hardware actual garantiza 144fps estables en todo momento.",
    url: "https://playvalorant.com",
    badges: [{ label: "IA Match", type: "ia" as const }],
    compat: { label: "Optimizado", type: "green" as const },
  },
  {
    name: "Void Horizon",
    genre: "Space / Simulation",
    description:
      "Una experiencia de simulación espacial sin límites. Requiere tu SSD para carga instantánea.",
    url: "https://store.steampowered.com/app/359320/Elite_Dangerous/",
    badges: [{ label: "Destacado", type: "dest" as const }],
    compat: { label: "Requiere SSD", type: "yellow" as const },
  },
  {
    name: "Ember Souls",
    genre: "Action / Adventure",
    description:
      "Desafía a dioses antiguos en este soul-like visualmente impresionante con mecánicas únicas.",
    url: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
    badges: [{ label: "IA Match", type: "ia" as const }],
    compat: { label: "Compatible", type: "green" as const },
  },
];

export default function ResultsSection() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { games, loading } = useGameContext();

  const displayGames = games.length > 0 ? games : GAMES;

  return (
    <section id="results" className="mx-auto max-w-7xl px-4 py-16 md:px-12 md:py-24">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between md:mb-12">
        <div className="flex flex-col gap-2">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-gold">
            Resultados Filtrados
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Sugerencias para ti
          </h2>
          <Separator className="w-24 bg-primary" />
        </div>

        <ToggleGroup
          value={[view]}
          onValueChange={(value) => {
            const next = value[value.length - 1];
            if (next === "grid" || next === "list") setView(next);
          }}
          variant="outline"
          spacing={0}
          className="self-start sm:self-auto"
        >
          <ToggleGroupItem value="grid" aria-label="Vista en cuadrícula">
            <LayoutGridIcon className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Vista en lista">
            <ListIcon className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center md:min-h-[300px] md:flex-row md:text-left">
          <Spinner className="size-10 text-primary" />
          <p className="font-display text-2xl font-bold text-primary">
            Analizando tu perfil...
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "mb-10 md:mb-12",
            view === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8"
              : "flex flex-col gap-6 md:gap-8"
          )}
        >
          {displayGames.map((game, i) => (
            <GameCard key={game.name + i} {...(game as typeof GAMES[number])} />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" size="lg" className="font-display uppercase tracking-widest">
          Cargar más juegos
        </Button>
      </div>
    </section>
  );
}
