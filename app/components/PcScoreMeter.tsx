"use client";

import { GaugeIcon } from "lucide-react";
import type { PcScoreInfo } from "../context/GameContext";

const tierColor: Record<string, string> = {
  Entusiasta: "text-primary",
  "Gama alta": "text-primary",
  "Gama media": "text-gold",
  "Gama baja": "text-gold",
  Mínima: "text-destructive",
};

function barColor(score: number) {
  if (score >= 68) return "bg-primary";
  if (score >= 48) return "bg-gold";
  return "bg-destructive";
}

export default function PcScoreMeter({ pc }: { pc: PcScoreInfo }) {
  const parts: { label: string; value: number }[] = [
    { label: "GPU", value: pc.gpuScore },
    { label: "CPU", value: pc.cpuScore },
    { label: "RAM", value: pc.ramScore },
  ];

  return (
    <div className="rounded-md border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GaugeIcon className="size-5 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            PC Score
          </span>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl font-bold text-foreground">
            {pc.score}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
          <p className={`text-xs font-bold uppercase tracking-wide ${tierColor[pc.tier] ?? "text-muted-foreground"}`}>
            {pc.tier}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor(pc.score)}`}
          style={{ width: `${pc.score}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {parts.map((p) => (
          <div key={p.label}>
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>{p.label}</span>
              <span className="text-foreground">{p.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${barColor(p.value)}`}
                style={{ width: `${p.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
