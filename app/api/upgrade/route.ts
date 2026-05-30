import { NextResponse } from "next/server";
import { upgradeRequestSchema, geminiUpgradeSchema } from "@/lib/schemas";
import { computePcScore } from "@/lib/gpuBenchmarks";
import { generateJson, hasGeminiKey } from "@/lib/gemini";

interface UpgradePlan {
  summary: string;
  newCpu: string;
  newGpu: string;
  newRam: string;
  items: { part: string; model: string; price: number; why: string }[];
}

export async function POST(req: Request) {
  try {
    if (!hasGeminiKey()) {
      return NextResponse.json(
        { error: "Falta configurar API_KEY en .env.local" },
        { status: 500 }
      );
    }

    const json = await req.json();
    const parsed = upgradeRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { cpu, gpu, ram, budget } = parsed.data;

    // PcScore actual con nuestro motor.
    const before = computePcScore({ cpu, gpu, ram });

    const prompt = `
Eres un experto en hardware de PC para gaming. El usuario quiere mejorar su PC con un presupuesto de $${budget} USD.
PC actual (potencia ${before.score}/100, tier "${before.tier}"):
CPU: ${cpu || "No especificado"}
GPU: ${gpu || "No especificado"}
RAM: ${ram || "No especificado"}

Propón el MEJOR combo de mejoras que QUEPA en $${budget} (puedes sugerir 1, 2 o 3 componentes). Prioriza el componente que más sube el rendimiento en juegos (normalmente la GPU). No superes el presupuesto sumando los precios.

Devuelve:
- summary: 1-2 frases explicando la estrategia (qué priorizas y por qué).
- newCpu: el modelo de CPU que tendría el PC tras el upgrade. Si NO cambia, repite el actual ("${cpu || "No especificado"}").
- newGpu: GPU tras el upgrade (o la actual si no cambia).
- newRam: RAM tras el upgrade (ej "32 GB"), o la actual si no cambia.
- items: lista de componentes A COMPRAR, cada uno { part: "GPU"|"CPU"|"RAM", model, price (USD aprox), why (beneficio en 1 frase) }. La suma de price NO debe superar $${budget}.
`;

    const plan = await generateJson<UpgradePlan>(prompt, geminiUpgradeSchema);

    // Recalcular PcScore CON nuestro motor usando las piezas propuestas.
    const after = computePcScore({
      cpu: plan.newCpu || cpu,
      gpu: plan.newGpu || gpu,
      ram: plan.newRam || ram,
    });

    const totalCost = (plan.items || []).reduce(
      (sum, it) => sum + (Number(it.price) || 0),
      0
    );

    return NextResponse.json({
      summary: plan.summary,
      items: plan.items || [],
      before,
      after,
      gain: after.score - before.score,
      totalCost,
      budget,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error generando upgrade:", error);
    return NextResponse.json(
      { error: "Error al generar el plan de upgrade: " + msg },
      { status: 500 }
    );
  }
}
