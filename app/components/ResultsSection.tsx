"use client";

import { useState } from "react";
import { LayoutGridIcon, ListIcon, GaugeIcon } from "lucide-react";
import GameCard from "./GameCard";
import { useGameContext } from "../context/GameContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
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

function GameCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}

export default function ResultsSection() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { games, loading, pcScore } = useGameContext();

  const hasResults = games.length > 0;
  const displayGames = hasResults ? games : GAMES;

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

      {/* Banner de compatibilidad: contextualiza por qué se eligieron estos juegos */}
      {pcScore && !loading && hasResults && (
        <Card variant="glass" className="mb-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <GaugeIcon className="size-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              Compatibilidad calculada para un PC{" "}
              <strong className="text-foreground">{pcScore.tier}</strong> (
              {pcScore.score}/100). Los FPS son una estimación de nuestro motor,
              no de la IA.
            </p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:mb-12 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
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
            <div
              key={game.name + i}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 120}ms`, opacity: 0 }}
            >
              <GameCard {...(game as typeof GAMES[number])} />
            </div>
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
