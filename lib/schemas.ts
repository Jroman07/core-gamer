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
  // Estado de animo opcional ("estresado", "con adrenalina"...) para afinar el tono.
  mood: z.string().max(60).optional().default(""),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;

/** Validacion del chat de seguimiento (/api/refine). */
export const refineRequestSchema = z.object({
  context: recommendRequestSchema, // perfil original del usuario
  previousGames: z.array(z.string().max(200)).max(8).default([]),
  message: z.string().min(1).max(300), // peticion: "mas baratos", "menos violentos"...
});

export type RefineRequest = z.infer<typeof refineRequestSchema>;

/** Validacion del asesor de upgrade (/api/upgrade). */
export const upgradeRequestSchema = z.object({
  cpu: z.string().max(120).optional().default(""),
  gpu: z.string().max(120).optional().default(""),
  ram: z.string().max(40).optional().default(""),
  budget: z.number().min(50).max(5000),
});

export type UpgradeRequest = z.infer<typeof upgradeRequestSchema>;

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
      // "Por que este juego": match personalizado con el perfil/PC del usuario.
      reason: { type: SchemaType.STRING },
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
    required: ["name", "genre", "description", "reason", "url", "demand", "badges"],
  },
};

/**
 * Schema del asesor de upgrade: la IA propone componentes a comprar dentro del
 * presupuesto y explica el beneficio. El PcScore nuevo lo recalculamos NOSOTROS.
 */
export const geminiUpgradeSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING }, // resumen en 1-2 frases
    newCpu: { type: SchemaType.STRING }, // "" si no se cambia
    newGpu: { type: SchemaType.STRING },
    newRam: { type: SchemaType.STRING },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          part: { type: SchemaType.STRING }, // "GPU" | "CPU" | "RAM"
          model: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER }, // USD aprox
          why: { type: SchemaType.STRING },
        },
        required: ["part", "model", "price", "why"],
      },
    },
  },
  required: ["summary", "newCpu", "newGpu", "newRam", "items"],
};
