/**
 * Helper compartido para llamar a Gemini con Structured Output. Centraliza el
 * fallback entre modelos y los reintentos para que /api/recommend, /api/refine y
 * /api/upgrade no dupliquen la logica.
 */

import { GoogleGenerativeAI, type ResponseSchema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash"];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** True si hay API_KEY configurada. */
export function hasGeminiKey(): boolean {
  return Boolean(process.env.API_KEY);
}

/**
 * Genera JSON estructurado con Gemini probando varios modelos y reintentando.
 * Devuelve el objeto ya parseado (tipo T) o lanza si todos los modelos fallan.
 */
export async function generateJson<T>(
  prompt: string,
  schema: ResponseSchema
): Promise<T> {
  let text = "";
  let lastError: unknown = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
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
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Todos los modelos de Gemini fallaron. Último error: ${msg}`);
  }

  return JSON.parse(text) as T;
}
