"use client";

/**
 * Mini-juego "CoreGamer Cloud" — un runner estilo dino que se DEGRADA segun el
 * PcScore del usuario: una PC mala lo renderiza pixelado, en escala de grises y
 * a pocos FPS (simulando que apenas corre), mientras que una PC potente lo
 * muestra fluido y a color. Es el gag de la demo: "tu PC sufre, juega en
 * nuestros servidores".
 *
 * Todo corre en el navegador del visitante (no necesita su hardware), pero la
 * CALIDAD percibida se ata al PcScore para hacer visible el chiste.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { qualityFromScore } from "@/lib/gameQuality";

interface Props {
  /** 0-100. Determina FPS objetivo, pixelado y saturacion del render. */
  pcScore: number;
}

interface Obstacle {
  x: number;
  w: number;
  h: number;
}

export default function PcRunnerGame({ pcScore }: Props) {
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Estado del juego en refs (no provoca re-render por frame).
  const stateRef = useRef({
    y: 0,
    vy: 0,
    onGround: true,
    obstacles: [] as Obstacle[],
    speed: 0,
    dist: 0,
    spawnTimer: 0,
    lastTs: 0,
    acc: 0,
    dead: false,
  });

  const q = qualityFromScore(pcScore);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;
    if (s.onGround) {
      s.vy = -1; // impulso (unidades normalizadas)
      s.onGround = false;
    }
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      cancelAnimationFrame(rafRef.current);
      stateRef.current.dead = true;
      setRunning(false);
      setGameOver(true);
      setBest((b) => Math.max(b, finalScore));
    },
    []
  );

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Backing store de baja resolucion -> CSS lo escala = pixelado real.
    const cssW = canvas.clientWidth || 600;
    const cssH = 200;
    const backW = Math.max(60, Math.round(cssW / q.pixelScale));
    const backH = Math.max(40, Math.round(cssH / q.pixelScale));
    canvas.width = backW;
    canvas.height = backH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    // Geometria en unidades del backing.
    const groundY = backH * 0.8;
    const playerX = backW * 0.12;
    const playerSize = backH * 0.16;
    const gravity = backH * 4.2; // u/s^2
    const jumpImpulse = backH * 1.6; // velocidad inicial salto (apex ~0.30*backH)

    const s = stateRef.current;
    s.y = groundY - playerSize;
    s.vy = 0;
    s.onGround = true;
    s.obstacles = [];
    s.speed = backW * 0.35; // u/s
    s.dist = 0;
    s.spawnTimer = 0;
    s.lastTs = 0;
    s.acc = 0;
    s.dead = false;

    setScore(0);
    setGameOver(false);
    setRunning(true);

    const frameInterval = 1000 / q.targetFps;

    const draw = () => {
      // Cielo
      ctx.fillStyle = "#0b0f1a";
      ctx.fillRect(0, 0, backW, backH);

      // Suelo
      ctx.fillStyle = "#1d2740";
      ctx.fillRect(0, groundY, backW, backH - groundY);
      ctx.fillStyle = "#2dd4bf";
      ctx.fillRect(0, groundY, backW, Math.max(1, backH * 0.012));

      // Jugador
      ctx.fillStyle = "#2dd4bf";
      ctx.fillRect(playerX, s.y, playerSize, playerSize);
      // ojo (detalle pixel)
      ctx.fillStyle = "#0b0f1a";
      ctx.fillRect(
        playerX + playerSize * 0.6,
        s.y + playerSize * 0.25,
        Math.max(1, playerSize * 0.18),
        Math.max(1, playerSize * 0.18)
      );

      // Obstaculos
      ctx.fillStyle = "#f43f5e";
      for (const o of s.obstacles) {
        ctx.fillRect(o.x, groundY - o.h, o.w, o.h);
      }
    };

    const step = (dt: number) => {
      // Fisica salto
      s.vy += (gravity * dt) / jumpImpulse;
      s.y += s.vy * jumpImpulse * dt;
      if (s.y >= groundY - playerSize) {
        s.y = groundY - playerSize;
        s.vy = 0;
        s.onGround = true;
      }

      // Mover obstaculos
      const dx = s.speed * dt;
      for (const o of s.obstacles) o.x -= dx;
      s.obstacles = s.obstacles.filter((o) => o.x + o.w > 0);

      // Spawn
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        const h = backH * (0.1 + Math.random() * 0.08);
        const w = backW * (0.025 + Math.random() * 0.02);
        s.obstacles.push({ x: backW + w, w, h });
        // gap se acorta con la velocidad -> mas dificil
        s.spawnTimer = 0.9 + Math.random() * 0.7;
      }

      // Dificultad: acelera con la distancia
      s.dist += dx;
      s.speed += backW * 0.012 * dt;

      // Colision AABB
      const px = playerX,
        py = s.y,
        ps = playerSize;
      for (const o of s.obstacles) {
        if (
          px < o.x + o.w &&
          px + ps > o.x &&
          py < groundY &&
          py + ps > groundY - o.h
        ) {
          const finalScore = Math.floor(s.dist / 10);
          endGame(finalScore);
          return false;
        }
      }
      return true;
    };

    const loop = (ts: number) => {
      if (s.dead) return;
      if (!s.lastTs) s.lastTs = ts;
      const elapsed = ts - s.lastTs;
      s.lastTs = ts;
      s.acc += elapsed;

      // Throttle a targetFps: una PC "mala" avanza a tirones.
      let stepped = false;
      while (s.acc >= frameInterval) {
        const alive = step(frameInterval / 1000);
        s.acc -= frameInterval;
        stepped = true;
        if (!alive) return;
      }
      if (stepped) {
        draw();
        setScore(Math.floor(s.dist / 10));
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [q.pixelScale, q.targetFps, endGame]);

  // Controles teclado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!running) return;
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, jump]);

  // Cleanup rAF al desmontar.
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded border border-border bg-[#0b0f1a]">
        <canvas
          ref={canvasRef}
          onPointerDown={() => {
            if (running) jump();
          }}
          className="block h-[200px] w-full cursor-pointer touch-none [image-rendering:pixelated]"
          style={{
            filter: `saturate(${q.saturate}%) contrast(${q.contrast}%)`,
          }}
        />

        {/* Overlay estado */}
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 text-center">
            {gameOver ? (
              <>
                <p className="font-display text-2xl font-bold text-destructive">
                  GAME OVER
                </p>
                <p className="text-sm text-foreground">
                  Puntos: <strong>{score}</strong> · Récord: <strong>{best}</strong>
                </p>
                <Button type="button" variant="gradient" onClick={startGame}>
                  <RotateCcwIcon className="size-4" />
                  Reintentar
                </Button>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-bold text-foreground">
                  Salta los obstáculos
                </p>
                <p className="text-xs text-muted-foreground">
                  Espacio / clic / toque para saltar
                </p>
                <Button type="button" variant="gradient" onClick={startGame}>
                  Empezar
                </Button>
              </>
            )}
          </div>
        )}

        {/* HUD score */}
        {running && (
          <span className="absolute right-3 top-2 font-mono text-sm font-bold text-primary">
            {score}
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {pcScore < 48
          ? "Render degradado a propósito según tu PC Score 😎"
          : "Render fluido cortesía de tu buen PC Score ⚡"}
      </p>
    </div>
  );
}
