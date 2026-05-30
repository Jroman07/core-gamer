"use client";

/**
 * Arcade "CoreGamer Cloud™" — hub que agrupa los mini-juegos cuya calidad de
 * render se ata al PcScore del usuario. El gag de la demo: tu PC "no aguanta"
 * los AAA, pero estos corren en nuestra nube (en realidad en tu navegador) y
 * mientras peor tu PC Score, peor se ven a propósito.
 *
 * Para sumar un juego nuevo: crea su componente (recibe `pcScore`) y añádelo al
 * array GAMES.
 */

import { useState } from "react";
import { GamepadIcon, ZapIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qualityFromScore, qualityLabel } from "@/lib/gameQuality";
import PcRunnerGame from "./PcRunnerGame";
import PcShootingRange from "./PcShootingRange";

interface Props {
  pcScore: number;
}

const GAMES = [
  {
    id: "runner",
    name: "Runner",
    emoji: "🏃",
    Component: PcRunnerGame,
  },
  {
    id: "shooter",
    name: "Campo de tiro",
    emoji: "🎯",
    Component: PcShootingRange,
  },
] as const;

export default function PcArcade({ pcScore }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<(typeof GAMES)[number]["id"]>("runner");

  const q = qualityFromScore(pcScore);
  const ActiveGame = GAMES.find((g) => g.id === active)!.Component;

  if (!open) {
    const teasing = pcScore < 48;
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium text-foreground">
          {teasing
            ? "😅 Tu PC suda con los AAA... pero ESTOS sí los corre."
            : "🎮 ¿Tu PC aguanta? Pruébalo en el arcade."}
        </p>
        <p className="text-xs text-muted-foreground">
          CoreGamer Cloud™ — {GAMES.length} juegos, calidad atada a tu PC Score.
        </p>
        <Button
          type="button"
          variant="gradient"
          onClick={() => setOpen(true)}
          className="mt-1"
        >
          <GamepadIcon className="size-4" />
          Abrir arcade
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-primary/30 bg-card/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GamepadIcon className="size-5 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            CoreGamer Cloud™
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono">
            <ZapIcon className="size-3 text-gold" />
            {q.targetFps} FPS
          </span>
          <span className="rounded bg-muted px-2 py-0.5 font-mono">
            Calidad: <strong className="text-foreground">{qualityLabel(pcScore)}</strong>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground underline-offset-2 hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Pestañas de juegos */}
      <div className="mb-3 flex gap-2">
        {GAMES.map((g) => {
          const isActive = g.id === active;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setActive(g.id)}
              className={
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-colors " +
                (isActive
                  ? "border-primary bg-accent text-foreground"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40")
              }
            >
              <span>{g.emoji}</span>
              {g.name}
              {isActive && <ChevronRightIcon className="size-3 text-primary" />}
            </button>
          );
        })}
      </div>

      {/* El key fuerza remontaje al cambiar de juego: limpia su rAF/estado. */}
      <ActiveGame key={active} pcScore={pcScore} />
    </div>
  );
}
