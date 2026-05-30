"use client";

/**
 * Asesor de upgrade ("modo presupuesto"): el usuario indica cuánto quiere gastar
 * y la IA propone el mejor combo de componentes que quepa en ese presupuesto.
 * El PcScore resultante lo recalcula NUESTRO motor (gpuBenchmarks), no la IA, así
 * que la mejora mostrada es coherente con el resto de la app.
 */

import { useState } from "react";
import { TrendingUpIcon, WrenchIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  cpu: string;
  gpu: string;
  ram: string;
}

interface PlanItem {
  part: string;
  model: string;
  price: number;
  why: string;
}

interface ScoreInfo {
  score: number;
  tier: string;
}

interface UpgradeResult {
  summary: string;
  items: PlanItem[];
  before: ScoreInfo;
  after: ScoreInfo;
  gain: number;
  totalCost: number;
  budget: number;
}

export default function UpgradeAdvisor({ cpu, gpu, ram }: Props) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState("400");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpgradeResult | null>(null);

  const run = async () => {
    const b = Number(budget);
    if (!b || b < 50) {
      toast.error("Indica un presupuesto de al menos $50.");
      return;
    }
    if (!gpu && !cpu) {
      toast.message("Completa tu CPU/GPU arriba para una mejor sugerencia.");
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpu, gpu, ram, budget: b }),
      });
      const data = await res.json();
      if (res.ok && data.after) {
        setResult(data as UpgradeResult);
      } else {
        toast.error(data.error || "No se pudo generar el plan de upgrade.");
      }
    } catch {
      toast.error("Error de conexión con el asesor de upgrade.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gold/40 bg-gold/5 p-4 text-center">
        <p className="text-sm font-medium text-foreground">
          💸 ¿Cuánto necesitas para que tu PC vuele?
        </p>
        <p className="text-xs text-muted-foreground">
          Dinos tu presupuesto y la IA arma el mejor combo de mejoras.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="mt-1 border-gold/40 text-gold hover:bg-gold/10"
        >
          <WrenchIcon className="size-4" />
          Asesor de upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gold/30 bg-card/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-5 text-gold" />
          <span className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Asesor de upgrade
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Cerrar
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label
            htmlFor="budget"
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Presupuesto (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="budget"
              type="number"
              min={50}
              max={5000}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-11 pl-7"
              placeholder="400"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="gradient"
          onClick={run}
          disabled={loading}
          className="h-11 shrink-0"
        >
          {loading ? "Calculando..." : "Generar plan"}
          {!loading && <ArrowRightIcon className="size-4" />}
        </Button>
      </div>

      {result && (
        <div className="mt-4 space-y-4">
          {/* Antes -> Después */}
          <div className="flex items-center justify-center gap-4 rounded-md bg-muted/40 p-4">
            <ScoreBox label="Ahora" score={result.before.score} tier={result.before.tier} />
            <div className="flex flex-col items-center text-primary">
              <ArrowRightIcon className="size-5" />
              <span className="flex items-center gap-0.5 text-xs font-bold text-primary">
                <TrendingUpIcon className="size-3.5" />+{result.gain}
              </span>
            </div>
            <ScoreBox
              label="Tras upgrade"
              score={result.after.score}
              tier={result.after.tier}
              highlight
            />
          </div>

          <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>

          {/* Componentes a comprar */}
          <div className="space-y-2">
            {result.items.map((it, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-border bg-muted/20 p-3"
              >
                <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {it.part}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{it.model}</p>
                  <p className="text-xs text-muted-foreground">{it.why}</p>
                </div>
                <span className="font-display text-sm font-bold text-gold">
                  ${Math.round(it.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">
              Total estimado{" "}
              <span className="text-[11px]">(presupuesto ${result.budget})</span>
            </span>
            <span
              className={
                "font-display text-lg font-bold " +
                (result.totalCost > result.budget ? "text-destructive" : "text-foreground")
              }
            >
              ${Math.round(result.totalCost)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Precios aproximados sugeridos por IA. El PC Score se recalcula con
            nuestro motor de benchmarks.
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreBox({
  label,
  score,
  tier,
  highlight,
}: {
  label: string;
  score: number;
  tier: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "font-display text-3xl font-bold " +
          (highlight ? "text-primary" : "text-foreground")
        }
      >
        {score}
      </p>
      <p className="text-[11px] text-muted-foreground">{tier}</p>
    </div>
  );
}
