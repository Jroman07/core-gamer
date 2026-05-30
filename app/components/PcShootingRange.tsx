"use client";

/**
 * Mini-juego "Campo de tiro" del arcade CoreGamer Cloud. Aparecen blancos, el
 * jugador hace clic para dispararles antes de que desaparezcan. Como el resto
 * del arcade, la CALIDAD del render (FPS, pixelado, color) se ata al PcScore:
 * en una PC patata la mira va a tirones y todo se ve gris y pixelado.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { qualityFromScore } from "@/lib/gameQuality";

interface Props {
  pcScore: number;
}

interface Target {
  x: number;
  y: number;
  maxR: number;
  age: number;
  life: number;
  dead: boolean;
}

const ROUND_SECONDS = 30;

export default function PcShootingRange({ pcScore }: Props) {
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [best, setBest] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const stateRef = useRef({
    targets: [] as Target[],
    pointer: { x: 0, y: 0 }, // coords backing
    spawnTimer: 0,
    time: ROUND_SECONDS,
    hits: 0,
    shots: 0,
    backW: 0,
    backH: 0,
    lastTs: 0,
    acc: 0,
    dead: false,
  });

  const q = qualityFromScore(pcScore);

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = stateRef.current;
    s.dead = true;
    setRunning(false);
    setOver(true);
    setBest((b) => Math.max(b, s.hits));
  }, []);

  // Disparo: chequea el blanco mas cercano bajo el puntero.
  const shootAt = useCallback((bx: number, by: number) => {
    const s = stateRef.current;
    if (s.dead) return;
    s.shots += 1;
    setShots(s.shots);
    // de mas nuevo a mas viejo para acertar el de encima
    for (let i = s.targets.length - 1; i >= 0; i--) {
      const t = s.targets[i];
      if (t.dead) continue;
      const r = currentRadius(t);
      const dx = bx - t.x;
      const dy = by - t.y;
      if (dx * dx + dy * dy <= r * r) {
        t.dead = true;
        s.hits += 1;
        setHits(s.hits);
        return;
      }
    }
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cssW = canvas.clientWidth || 600;
    const cssH = 240;
    const backW = Math.max(60, Math.round(cssW / q.pixelScale));
    const backH = Math.max(40, Math.round(cssH / q.pixelScale));
    canvas.width = backW;
    canvas.height = backH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const s = stateRef.current;
    s.targets = [];
    s.pointer = { x: backW / 2, y: backH / 2 };
    s.spawnTimer = 0;
    s.time = ROUND_SECONDS;
    s.hits = 0;
    s.shots = 0;
    s.backW = backW;
    s.backH = backH;
    s.lastTs = 0;
    s.acc = 0;
    s.dead = false;

    setHits(0);
    setShots(0);
    setTimeLeft(ROUND_SECONDS);
    setOver(false);
    setRunning(true);

    const frameInterval = 1000 / q.targetFps;
    const maxRadius = backH * 0.16;
    const minRadius = backH * 0.09;

    const spawn = () => {
      const r = minRadius + Math.random() * (maxRadius - minRadius);
      const margin = r + backW * 0.02;
      s.targets.push({
        x: margin + Math.random() * (backW - margin * 2),
        y: margin + Math.random() * (backH - margin * 2),
        maxR: r,
        age: 0,
        life: 1.1 + Math.random() * 0.6, // segundos en pantalla
        dead: false,
      });
    };

    const draw = () => {
      // fondo campo de tiro
      ctx.fillStyle = "#0b0f1a";
      ctx.fillRect(0, 0, backW, backH);
      // lineas de carril
      ctx.fillStyle = "#141d33";
      for (let gx = 0; gx < backW; gx += backW * 0.12) {
        ctx.fillRect(gx, 0, Math.max(1, backW * 0.004), backH);
      }

      // blancos (diana concentrica)
      for (const t of s.targets) {
        if (t.dead) continue;
        const r = currentRadius(t);
        if (r <= 0) continue;
        const fade = t.age > t.life * 0.7 ? 0.5 : 1; // parpadeo al expirar
        ctx.globalAlpha = fade;
        ctx.fillStyle = "#f43f5e";
        circle(ctx, t.x, t.y, r);
        ctx.fillStyle = "#fff";
        circle(ctx, t.x, t.y, r * 0.62);
        ctx.fillStyle = "#f43f5e";
        circle(ctx, t.x, t.y, r * 0.3);
        ctx.globalAlpha = 1;
      }

      // mira (lag visible en PC mala por el throttle de FPS)
      const p = s.pointer;
      const cr = backH * 0.07;
      ctx.fillStyle = "#2dd4bf";
      const th = Math.max(1, backH * 0.012);
      ctx.fillRect(p.x - cr, p.y - th / 2, cr * 2, th);
      ctx.fillRect(p.x - th / 2, p.y - cr, th, cr * 2);
    };

    const step = (dt: number) => {
      s.time -= dt;
      if (s.time <= 0) {
        s.time = 0;
        draw();
        endGame();
        return false;
      }
      setTimeLeft(Math.ceil(s.time));

      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        spawn();
        // mas rapido a medida que avanza la ronda
        const t = 1 - s.time / ROUND_SECONDS;
        s.spawnTimer = Math.max(0.45, 1.1 - t * 0.7);
      }

      for (const t of s.targets) t.age += dt;
      s.targets = s.targets.filter((t) => !t.dead && t.age < t.life);
      return true;
    };

    const loop = (ts: number) => {
      if (s.dead) return;
      if (!s.lastTs) s.lastTs = ts;
      s.acc += ts - s.lastTs;
      s.lastTs = ts;

      let stepped = false;
      while (s.acc >= frameInterval) {
        const alive = step(frameInterval / 1000);
        s.acc -= frameInterval;
        stepped = true;
        if (!alive) return;
      }
      if (stepped) draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [q.pixelScale, q.targetFps, endGame]);

  // Convierte coords CSS del puntero a coords del backing.
  const toBacking = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const s = stateRef.current;
    return {
      x: ((e.clientX - rect.left) / rect.width) * s.backW,
      y: ((e.clientY - rect.top) / rect.height) * s.backH,
    };
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded border border-border bg-[#0b0f1a]">
        <canvas
          ref={canvasRef}
          onPointerMove={(e) => {
            if (!running) return;
            stateRef.current.pointer = toBacking(e);
          }}
          onPointerDown={(e) => {
            if (!running) return;
            const p = toBacking(e);
            stateRef.current.pointer = p;
            shootAt(p.x, p.y);
          }}
          className="block h-[240px] w-full cursor-crosshair touch-none [image-rendering:pixelated]"
          style={{ filter: `saturate(${q.saturate}%) contrast(${q.contrast}%)` }}
        />

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 text-center">
            {over ? (
              <>
                <p className="font-display text-2xl font-bold text-primary">
                  ¡TIEMPO!
                </p>
                <p className="text-sm text-foreground">
                  Aciertos: <strong>{hits}</strong> · Precisión:{" "}
                  <strong>{accuracy}%</strong> · Récord: <strong>{best}</strong>
                </p>
                <Button type="button" variant="gradient" onClick={startGame}>
                  Jugar otra vez
                </Button>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-bold text-foreground">
                  Dispara a los blancos
                </p>
                <p className="text-xs text-muted-foreground">
                  Clic / toque sobre la diana · {ROUND_SECONDS}s
                </p>
                <Button type="button" variant="gradient" onClick={startGame}>
                  Empezar
                </Button>
              </>
            )}
          </div>
        )}

        {running && (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-between px-3 font-mono text-sm font-bold">
            <span className="text-primary">🎯 {hits}</span>
            <span className={timeLeft <= 5 ? "text-destructive" : "text-foreground"}>
              ⏱ {timeLeft}s
            </span>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {pcScore < 48
          ? "Mira con lag y gráficos degradados según tu PC Score 😬"
          : "Apuntado preciso y fluido gracias a tu PC Score ⚡"}
      </p>
    </div>
  );
}

function currentRadius(t: Target): number {
  // crece rapido y se mantiene; al final encoge antes de expirar
  const grow = Math.min(1, t.age / (t.life * 0.25));
  const shrink = t.age > t.life * 0.75 ? 1 - (t.age - t.life * 0.75) / (t.life * 0.25) : 1;
  return t.maxR * grow * Math.max(0, shrink);
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
