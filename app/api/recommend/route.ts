import { NextResponse } from "next/server";
import { recommendRequestSchema, geminiResponseSchema } from "@/lib/schemas";
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

    // 1) Validar la entrada con Zod (evita errores y prompt injection básico).
    const json = await req.json();
    const parsed = recommendRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { selectedGenres, style, cpu, gpu, ram, storage, mood } = parsed.data;

    // 2) Calcular la potencia del PC con NUESTRO motor (no la IA).
    const pc = computePcScore({ cpu, gpu, ram });

    const prompt = `
Eres un experto en videojuegos. El usuario tiene este PC (potencia calculada: ${pc.score}/100, tier "${pc.tier}"):
CPU: ${cpu || "No especificado"}
GPU: ${gpu || "No especificado"}
RAM: ${ram || "No especificado"}
Almacenamiento: ${storage || "No especificado"}

Géneros favoritos: ${selectedGenres.join(", ")}.
Estilo de juego preferido: ${style}.
${mood ? `Estado de ánimo actual del jugador: "${mood}". Ajusta el TONO de las recomendaciones a ese estado: si está estresado/cansado sugiere experiencias relajantes o cortas; si quiere adrenalina/competir sugiere juegos intensos; si está nostálgico sugiere clásicos.` : ""}

Recomienda EXACTAMENTE 4 videojuegos que sean obras maestras aclamadas o estén en tendencia mundial y que encajen con los gustos del usuario.

Para cada juego entrega:
- name: nombre exacto y oficial del juego (sin años ni ediciones, para poder buscarlo en bases de datos).
- genre: "Género principal / Secundario".
- description: por qué le gustaría al usuario (máx 110 caracteres). Sé honesto: si su PC es débil para juegos pesados, recomienda títulos más ligeros (indies 2D, clásicos) y dilo.
- reason: UNA frase corta (máx 90 caracteres) que explique el match PERSONALIZADO con ESTE usuario, mencionando su PC, sus géneros${mood ? ", o su estado de ánimo" : ""}. Ej: "Corre fluido en tu RTX 3060 y encaja con tu gusto por mundos abiertos".
- url: URL oficial del juego o su página en Steam/Epic.
- demand: número 0-100 que representa qué tan EXIGENTE es el juego en hardware (un indie 2D ~10, un AAA ultra-realista ~95). Sé realista.
- badges: 1 o 2 objetos { label, type }. type ∈ "ia" (IA Match), "dest" (Destacado), "pct" (un porcentaje como "95%").
`;

    // 3) Gemini con Structured Output (JSON garantizado).
    const aiGames = await generateJson<AiGame[]>(prompt, geminiResponseSchema);

    // 4) Enriquecer con compatibilidad real (FPS) + datos RAWG.
    const games = await enrichGames(aiGames, pc.score);

    return NextResponse.json({ games, pcScore: pc });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error generando recomendaciones:", error);
    return NextResponse.json(
      { error: "Error al generar recomendaciones: " + msg },
      { status: 500 }
    );
  }
}
