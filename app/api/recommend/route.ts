import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { recommendRequestSchema, geminiResponseSchema } from "@/lib/schemas";
import { computePcScore, estimateCompat } from "@/lib/gpuBenchmarks";
import { fetchGameData } from "@/lib/rawg";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

interface AiGame {
  name: string;
  genre: string;
  description: string;
  url: string;
  demand: number;
  badges: { label: string; type: string }[];
}

export async function POST(req: Request) {
  try {
    if (!process.env.API_KEY) {
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
    const { selectedGenres, style, cpu, gpu, ram, storage } = parsed.data;

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

Recomienda EXACTAMENTE 4 videojuegos que sean obras maestras aclamadas o estén en tendencia mundial y que encajen con los gustos del usuario.

Para cada juego entrega:
- name: nombre exacto y oficial del juego (sin años ni ediciones, para poder buscarlo en bases de datos).
- genre: "Género principal / Secundario".
- description: por qué le gustaría al usuario (máx 110 caracteres). Sé honesto: si su PC es débil para juegos pesados, recomienda títulos más ligeros (indies 2D, clásicos) y dilo.
- url: URL oficial del juego o su página en Steam/Epic.
- demand: número 0-100 que representa qué tan EXIGENTE es el juego en hardware (un indie 2D ~10, un AAA ultra-realista ~95). Sé realista.
- badges: 1 o 2 objetos { label, type }. type ∈ "ia" (IA Match), "dest" (Destacado), "pct" (un porcentaje como "95%").
`;

    // 3) Llamar a Gemini con Structured Output (JSON garantizado, sin regex).
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
    ];
    let text = "";
    let lastError: unknown = null;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema,
          },
        });

        let attempts = 0;
        while (attempts < 2) {
          try {
            const result = await model.generateContent(prompt);
            text = result.response.text();
            break;
          } catch (err) {
            attempts++;
            lastError = err;
            if (attempts < 2) await delay(attempts * 1000);
          }
        }
        if (text) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!text) {
      const msg =
        lastError instanceof Error ? lastError.message : String(lastError);
      throw new Error(`Todos los modelos de Gemini fallaron. Último error: ${msg}`);
    }

    const aiGames = JSON.parse(text) as AiGame[];

    // 4) Calcular compatibilidad real (FPS + veredicto) y enriquecer con RAWG.
    const games = await Promise.all(
      aiGames.slice(0, 4).map(async (g) => {
        const compat = estimateCompat(pc.score, g.demand);
        const rawg = await fetchGameData(g.name);
        return {
          name: g.name,
          genre: g.genre,
          description: g.description,
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
