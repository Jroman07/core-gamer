import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instanciar el cliente usando la variable de entorno
const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { selectedGenres, style, cpu, gpu, ram, storage } = body;

    if (!process.env.API_KEY) {
      return NextResponse.json({ error: "Falta configurar API_KEY en .env.local" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Eres un experto en videojuegos y hardware de PC.
El usuario tiene las siguientes especificaciones:
CPU: ${cpu || 'No especificado'}
GPU: ${gpu || 'No especificado'}
RAM: ${ram || 'No especificado'}
Almacenamiento: ${storage || 'No especificado'}

Sus géneros favoritos son: ${selectedGenres.join(", ")}.
El estilo de juego preferido es: ${style}.

Por favor recomienda exactamente 4 videojuegos que históricamente hayan sido obras maestras muy aclamadas o que actualmente estén en tendencia mundial, asegurándote de que encajen perfectamente con los gustos del usuario. 

Tu respuesta DEBE SER EXCLUSIVAMENTE un arreglo JSON válido (sin código markdown extra como \`\`\`json).
Cada objeto en el arreglo debe tener exactamente la siguiente estructura:
{
  "name": "Nombre del juego",
  "genre": "Género principal / Secundario",
  "description": "Breve descripción destacando por qué le gustaría (max 100 caracteres)",
  "url": "URL oficial del juego o su página en Steam/Epic Games",
  "badges": [
    { "label": "IA Match", "type": "ia" },
    { "label": "95%", "type": "pct" }
  ],
  "compat": { "label": "Compatible", "type": "green" }
}

Reglas adicionales:
- Si las especificaciones de la computadora son extremadamente bajas y crees que definitivamente no podrá correr juegos pesados, recomienda los 4 juegos más ligeros posibles (como indies 2D o clásicos retro). 
- En la "description", dile honestamente al usuario si fue difícil encontrar juegos para su PC y explícale claramente cómo le correrá (ej. "Te correrá mal pero es jugable", "Irá muy fluido", etc.).
- Para 'badges', el array debe tener 1 o 2 objetos. 'type' puede ser "ia" (IA Match), "dest" (Destacado), "pct" (Ej. 98%).
- Para 'compat', sé muy directo sobre el rendimiento esperado. Usa type "green" (Optimizado/Fluido), "yellow" (Bajos FPS/Gráficos mínimos) o "red" (No recomendado/Correrá muy mal). Si no hay specs, usa "yellow" (Hardware Desconocido).
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Mejorar la extracción del JSON buscando los corchetes del arreglo
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("El modelo no devolvió un arreglo JSON válido. Respuesta: " + text.substring(0, 100));
    }
    
    const games = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ games });
  } catch (error: any) {
    console.error("Error generando recomendaciones:", error);
    return NextResponse.json({ error: "Error al generar recomendaciones: " + (error.message || String(error)) }, { status: 500 });
  }
}
