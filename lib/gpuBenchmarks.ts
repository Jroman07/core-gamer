/**
 * Motor de compatibilidad propio (no depende de la IA).
 *
 * Convierte strings de hardware ("RTX 3060", "Ryzen 7 5800X", "16 GB") en una
 * puntuacion 0-100 usando tablas de tiers aproximadas (estilo PassMark/tier list)
 * y estima FPS + veredicto comparando la potencia del PC contra la "exigencia"
 * del juego que devuelve la IA.
 *
 * Las cifras son aproximaciones razonables para fines educativos/demo: lo
 * importante es que el calculo es deterministico y transparente, no inventado.
 */

export type CompatType = "green" | "yellow" | "red";

export interface PcScore {
  score: number; // 0-100
  tier: string; // "Gama baja" | "Gama media" | ...
  cpuScore: number;
  gpuScore: number;
  ramScore: number;
}

interface Entry {
  re: RegExp;
  score: number;
}

// --- GPU ---------------------------------------------------------------
// score 0-100 (potencia relativa para juegos AAA modernos a 1080p)
const GPU_TABLE: Entry[] = [
  // NVIDIA RTX 40
  { re: /4090/, score: 100 },
  { re: /4080/, score: 95 },
  { re: /4070\s*ti/, score: 90 },
  { re: /4070/, score: 84 },
  { re: /4060\s*ti/, score: 74 },
  { re: /4060/, score: 68 },
  // NVIDIA RTX 30
  { re: /3090/, score: 93 },
  { re: /3080\s*ti/, score: 90 },
  { re: /3080/, score: 87 },
  { re: /3070\s*ti/, score: 80 },
  { re: /3070/, score: 77 },
  { re: /3060\s*ti/, score: 72 },
  { re: /3060/, score: 64 },
  { re: /3050/, score: 52 },
  // NVIDIA RTX 20
  { re: /2080\s*ti/, score: 78 },
  { re: /2080/, score: 73 },
  { re: /2070/, score: 67 },
  { re: /2060/, score: 58 },
  // NVIDIA GTX 16/10
  { re: /1660\s*ti|1660\s*super/, score: 50 },
  { re: /1660/, score: 46 },
  { re: /1650/, score: 38 },
  { re: /1080\s*ti/, score: 70 },
  { re: /1080/, score: 60 },
  { re: /1070/, score: 54 },
  { re: /1060/, score: 44 },
  { re: /1050\s*ti/, score: 32 },
  { re: /1050/, score: 28 },
  // AMD RX 7000 / 6000 / 5000
  { re: /7900\s*xtx/, score: 98 },
  { re: /7900\s*xt/, score: 92 },
  { re: /7800\s*xt/, score: 85 },
  { re: /7700\s*xt/, score: 78 },
  { re: /7600/, score: 66 },
  { re: /6950|6900\s*xt/, score: 90 },
  { re: /6800\s*xt/, score: 86 },
  { re: /6800/, score: 82 },
  { re: /6750|6700\s*xt/, score: 75 },
  { re: /6700/, score: 70 },
  { re: /6650|6600\s*xt/, score: 64 },
  { re: /6600/, score: 60 },
  { re: /6500/, score: 40 },
  { re: /5700\s*xt/, score: 65 },
  { re: /5700/, score: 60 },
  { re: /5600/, score: 55 },
  { re: /5500/, score: 42 },
  { re: /\brx\s*580/, score: 38 },
  { re: /\brx\s*570/, score: 34 },
  // Intel Arc
  { re: /arc\s*a770/, score: 70 },
  { re: /arc\s*a750/, score: 64 },
  { re: /arc\s*a580/, score: 55 },
  { re: /arc\s*a380/, score: 36 },
  // Integradas / Apple
  { re: /m3\s*(max|ultra)/, score: 82 },
  { re: /m2\s*(max|ultra)/, score: 75 },
  { re: /m1\s*(max|ultra)/, score: 68 },
  { re: /m3\s*pro/, score: 66 },
  { re: /m2\s*pro/, score: 60 },
  { re: /m1\s*pro/, score: 54 },
  { re: /apple\s*m[123]|\bm[123]\b/, score: 45 },
  { re: /iris\s*xe/, score: 22 },
  { re: /uhd|hd\s*graphics|vega\s*\d|radeon\s*graphics/, score: 16 },
];

// --- CPU ---------------------------------------------------------------
const CPU_TABLE: Entry[] = [
  { re: /i9|ryzen\s*9/, score: 92 },
  { re: /i7-14|i7-13|ryzen\s*7\s*7|ryzen\s*7\s*5800x3d/, score: 88 },
  { re: /i7|ryzen\s*7/, score: 80 },
  { re: /i5-14|i5-13|ryzen\s*5\s*7/, score: 76 },
  { re: /i5|ryzen\s*5/, score: 66 },
  { re: /i3|ryzen\s*3/, score: 48 },
  { re: /m3/, score: 78 },
  { re: /m2/, score: 72 },
  { re: /m1/, score: 64 },
  { re: /pentium|celeron|athlon/, score: 28 },
];

function lookup(table: Entry[], value: string, fallback: number): number {
  if (!value) return fallback;
  const v = value.toLowerCase();
  for (const { re, score } of table) {
    if (re.test(v)) return score;
  }
  return fallback;
}

export function scoreGpu(gpu: string): number {
  return lookup(GPU_TABLE, gpu, 30); // desconocida -> gama baja-media
}

export function scoreCpu(cpu: string): number {
  return lookup(CPU_TABLE, cpu, 55);
}

export function parseRamGb(ram: string): number {
  const m = (ram || "").match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 8;
}

export function ramScore(ram: string): number {
  const gb = parseRamGb(ram);
  if (gb >= 32) return 100;
  if (gb >= 16) return 80;
  if (gb >= 12) return 60;
  if (gb >= 8) return 45;
  return 25;
}

const TIERS: { min: number; label: string }[] = [
  { min: 85, label: "Entusiasta" },
  { min: 68, label: "Gama alta" },
  { min: 48, label: "Gama media" },
  { min: 30, label: "Gama baja" },
  { min: 0, label: "Mínima" },
];

/**
 * Pondera GPU (55%), CPU (30%) y RAM (15%): los juegos modernos dependen mas
 * de la GPU, por eso pesa mas.
 */
export function computePcScore(specs: {
  cpu?: string;
  gpu?: string;
  ram?: string;
}): PcScore {
  const cpuScore = scoreCpu(specs.cpu || "");
  const gpuScore = scoreGpu(specs.gpu || "");
  const rScore = ramScore(specs.ram || "");
  const score = Math.round(gpuScore * 0.55 + cpuScore * 0.3 + rScore * 0.15);
  const tier = TIERS.find((t) => score >= t.min)?.label ?? "Mínima";
  return { score, tier, cpuScore, gpuScore, ramScore: rScore };
}

/**
 * Estima FPS y veredicto comparando la potencia del PC (0-100) contra la
 * exigencia del juego (0-100, la entrega la IA). Modelo simple pero coherente:
 * un margen positivo grande => FPS altos; negativo => injugable.
 */
export function estimateCompat(
  pcScore: number,
  demand: number
): { fps: number; type: CompatType; label: string } {
  const d = Math.max(1, Math.min(100, demand || 50));
  // 60 FPS como punto de equilibrio cuando potencia == exigencia.
  const ratio = pcScore / d;
  let fps = Math.round(60 * Math.pow(ratio, 1.3));
  fps = Math.max(8, Math.min(240, fps));

  let type: CompatType;
  let label: string;
  if (fps >= 90) {
    type = "green";
    label = `Fluido · ~${fps} FPS`;
  } else if (fps >= 50) {
    type = "green";
    label = `Jugable · ~${fps} FPS`;
  } else if (fps >= 30) {
    type = "yellow";
    label = `Justo · ~${fps} FPS (gráficos medios)`;
  } else if (fps >= 20) {
    type = "yellow";
    label = `Pesado · ~${fps} FPS (gráficos bajos)`;
  } else {
    type = "red";
    label = `No recomendado · ~${fps} FPS`;
  }
  return { fps, type, label };
}
