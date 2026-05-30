import { NextResponse } from "next/server";
import { refineRequestSchema, geminiResponseSchema } from "@/lib/schemas";
import { computePcScore } from "@/lib/gpuBenchmarks";
import { generateJson, hasGeminiKey } from "@/lib/gemini";
import { enrichGames, type AiGame } from "@/lib/enrichGames";

export async function POST(req: Request) {
  try {
    if (!hasGeminiKey()) {
      return NextResponse.json(
        { error: "Falta configurar API_KEY en .env.local" },
        { status: 500 }
      );
    }

    const json = await req.json();
    const parsed = refineRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { context, previousGames, message } = parsed.data;
    const { selectedGenres, style, cpu, gpu, ram, storage, mood } = context;

    const pc = computePcScore({ cpu, gpu, ram });

    const prompt = `
Eres un experto en videojuegos afinando recomendaciones para un usuario. Su PC tiene potencia ${pc.score}/100 (tier "${pc.tier}"):
CPU: ${cpu || "No especificado"} | GPU: ${gpu || "No especificado"} | RAM: ${ram || "No especificado"} | Almacenamiento: ${storage || "No especificado"}
Géneros favoritos: ${selectedGenres.join(", ")}. Estilo: ${style}.${mood ? ` Ánimo: "${mood}".` : ""}

Ya le recomendaste estos juegos: ${previousGames.length ? previousGames.join(", ") : "ninguno todavía"}.

Ahora el usuario pide un AJUSTE: "${message}".

Devuelve EXACTAMENTE 4 videojuegos NUEVOS (no repitas los ya recomendados salvo que el usuario lo pida) que cumplan esa petición y sigan encajando con su perfil y su PC.

Para cada juego:
- name: nombre oficial exacto (sin años/ediciones).
- genre: "Género principal / Secundario".
- description: por qué encaja con la petición (máx 110 caracteres).
- reason: UNA frase (máx 90 caracteres) explicando cómo responde a "${message}" y a su PC.
- url: URL oficial o de Steam/Epic.
- demand: 0-100 de exigencia de hardware (realista).
- badges: 1-2 objetos { label, type }. type ∈ "ia", "dest", "pct".
`;

    const aiGames = await generateJson<AiGame[]>(prompt, geminiResponseSchema);
    const games = await enrichGames(aiGames, pc.score);

    return NextResponse.json({ games, pcScore: pc });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error afinando recomendaciones:", error);
    return NextResponse.json(
      { error: "Error al afinar recomendaciones: " + msg },
      { status: 500 }
    );
  }
}
