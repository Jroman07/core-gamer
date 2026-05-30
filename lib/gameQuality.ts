/**
 * Motor de "calidad de render" compartido por los mini-juegos del arcade.
 *
 * El gag de CoreGamer Cloud: la CALIDAD del juego se ata al PcScore del usuario.
 * Una PC patata corre el mismo juego pixelado, en grises y a pocos FPS; una PC
 * potente lo muestra fluido y a color. Todo corre en el navegador del visitante,
 * pero la experiencia percibida cambia segun su hardware estimado.
 */

export interface GameQuality {
  /** FPS objetivo del loop (PC mala = entrecortado). */
  targetFps: number;
  /** Factor de submuestreo: backing res = display / pixelScale (PC mala = grande). */
  pixelScale: number;
  /** Saturacion CSS 0-100 (PC mala = 0 = escala de grises). */
  saturate: number;
  /** Contraste CSS % (PC mala = mas duro). */
  contrast: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export { clamp, lerp };

/** Mapea PcScore (0-100) -> ajustes de render. */
export function qualityFromScore(score: number): GameQuality {
  const q = clamp(score, 0, 100) / 100;
  return {
    targetFps: Math.round(lerp(14, 60, q)),
    pixelScale: lerp(7, 1, q),
    saturate: Math.round(lerp(0, 100, q)),
    contrast: Math.round(lerp(140, 100, q)),
  };
}

/** Etiqueta de calidad para el HUD. */
export function qualityLabel(score: number): string {
  if (score >= 68) return "ULTRA";
  if (score >= 48) return "MEDIO";
  if (score >= 30) return "BAJO";
  return "PATATA";
}
