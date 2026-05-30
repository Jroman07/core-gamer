/**
 * Toma los juegos crudos que devuelve la IA y los enriquece con la
 * compatibilidad real (FPS + veredicto de nuestro motor) y datos de RAWG
 * (caratula, rating, fecha). Compartido por /api/recommend y /api/refine.
 */

import { estimateCompat } from "@/lib/gpuBenchmarks";
import { fetchGameData } from "@/lib/rawg";

export interface AiGame {
  name: string;
  genre: string;
  description: string;
  reason?: string;
  url: string;
  demand: number;
  badges: { label: string; type: string }[];
}

export async function enrichGames(aiGames: AiGame[], pcScore: number) {
  return Promise.all(
    aiGames.slice(0, 4).map(async (g) => {
      const compat = estimateCompat(pcScore, g.demand);
      const rawg = await fetchGameData(g.name);
      return {
        name: g.name,
        genre: g.genre,
        description: g.description,
        reason: g.reason || "",
        url: rawg?.rawgUrl || g.url,
        demand: g.demand,
        estimatedFps: compat.fps,
        badges: (g.badges || []).slice(0, 2).map((b) => ({
          label: b.label,
          type: ["ia", "dest", "pct"].includes(b.type) ? b.type : "ia",
        })),
        compat: { label: compat.label, type: compat.type },
        image: rawg?.image ?? null,
        rating: rawg?.rating ?? null,
        released: rawg?.released ?? null,
      };
    })
  );
}
