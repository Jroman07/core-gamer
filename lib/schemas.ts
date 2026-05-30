import { z } from "zod";
import { SchemaType, type ResponseSchema } from "@google/generative-ai";

/** Validacion del body que envia el formulario a /api/recommend. */
export const recommendRequestSchema = z.object({
  selectedGenres: z.array(z.string()).min(1, "Selecciona al menos un género"),
  style: z.string().min(1),
  cpu: z.string().max(120).optional().default(""),
  gpu: z.string().max(120).optional().default(""),
  ram: z.string().max(40).optional().default(""),
  storage: z.string().max(40).optional().default(""),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;

/** Validacion del body de /api/track. */
export const trackRequestSchema = z.object({
  gameName: z.string().min(1).max(200),
  genre: z.string().min(1).max(200),
  url: z.string().url().max(500).optional().nullable(),
});

/**
 * Schema estructurado para Gemini (responseSchema). Garantiza JSON valido sin
 * necesidad de parsear con regex. Incluimos `demand` (exigencia 0-100) para que
 * NOSOTROS calculemos la compatibilidad real, no la IA.
 */
export const geminiResponseSchema: ResponseSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      genre: { type: SchemaType.STRING },
      description: { type: SchemaType.STRING },
      url: { type: SchemaType.STRING },
      demand: {
        type: SchemaType.NUMBER,
      },
      badges: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            label: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING },
          },
          required: ["label", "type"],
        },
      },
    },
    required: ["name", "genre", "description", "url", "demand", "badges"],
  },
};
