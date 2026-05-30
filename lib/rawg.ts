/**
 * Cliente minimo de la API de RAWG (https://rawg.io/apidocs) para enriquecer las
 * recomendaciones de la IA con datos reales: caratula, rating y año.
 *
 * Si no hay RAWG_API_KEY configurada, las funciones devuelven null y la app sigue
 * funcionando sin imagenes (degradacion elegante).
 */

export interface RawgGameData {
  image: string | null;
  rating: number | null; // 0-5
  released: string | null; // "2020-12-10"
  metacritic: number | null;
  rawgUrl: string | null;
}

const BASE = "https://api.rawg.io/api";

export function hasRawgKey(): boolean {
  return Boolean(process.env.RAWG_API_KEY);
}

export async function fetchGameData(name: string): Promise<RawgGameData | null> {
  const key = process.env.RAWG_API_KEY;
  if (!key || !name) return null;

  try {
    const url = `${BASE}/games?key=${key}&search=${encodeURIComponent(
      name
    )}&page_size=1`;
    // Cache de 24h: ahorra cuota y acelera respuestas repetidas.
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const game = data?.results?.[0];
    if (!game) return null;

    return {
      image: game.background_image ?? null,
      rating: typeof game.rating === "number" ? game.rating : null,
      released: game.released ?? null,
      metacritic:
        typeof game.metacritic === "number" ? game.metacritic : null,
      rawgUrl: game.slug ? `https://rawg.io/games/${game.slug}` : null,
    };
  } catch (err) {
    console.warn("[RAWG] fallo al buscar", name, err);
    return null;
  }
}

/** Enriquece una lista de juegos en paralelo, tolerante a fallos. */
export async function enrichGames<T extends { name: string }>(
  games: T[]
): Promise<(T & { rawg: RawgGameData | null })[]> {
  return Promise.all(
    games.map(async (g) => ({ ...g, rawg: await fetchGameData(g.name) }))
  );
}
