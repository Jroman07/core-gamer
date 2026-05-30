# CORE GAMER

Recomendador de videojuegos que combina **IA generativa (Google Gemini)** con un
**motor de compatibilidad propio** para sugerir 4 juegos que encajan con tus
gustos *y* con la potencia real de tu PC.

> Proyecto de Fundamentos de Programación Web — Next.js 16 + React 19.

## Qué lo hace diferente

1. **Escáner de PC en 1 clic** — detecta tu GPU real (vía `WEBGL_debug_renderer_info`),
   núcleos del CPU (`navigator.hardwareConcurrency`) y RAM (`navigator.deviceMemory`)
   directamente desde el navegador y autocompleta el formulario.
2. **Compatibilidad calculada, no inventada** — la IA solo propone juegos y estima
   su *exigencia* (`demand` 0-100). Nosotros calculamos el **PC Score** y los
   **FPS estimados** con tablas de benchmarks propias (`lib/gpuBenchmarks.ts`).
   El veredicto verde/amarillo/rojo es determinista y transparente.
3. **Datos reales de juegos** — cada recomendación se enriquece con carátula,
   rating y año desde la API de [RAWG](https://rawg.io) (opcional).
4. **Dashboard analítico** — registra los clics en Postgres y los visualiza:
   top de juegos, distribución por género y actividad en el tiempo.

## Arquitectura

```
app/
  page.tsx                 # Landing (Hero + Form + Results)
  components/
    PcScanner.tsx          # Escaneo de hardware del navegador
    PcScoreMeter.tsx       # Medidor de potencia (GPU/CPU/RAM)
    FormSection.tsx        # Formulario + persistencia en localStorage
    GameCard.tsx           # Tarjeta con carátula, rating y FPS
    ResultsSection.tsx     # Grilla con skeletons y aparición escalonada
  api/
    recommend/route.ts     # Gemini (structured output) + motor compat + RAWG
    track/route.ts         # Registra clics (validado con Zod)
  dashboard/               # Estadísticas (Recharts)
lib/
  gpuBenchmarks.ts         # Tablas de tiers + PC Score + estimación de FPS
  hardware.ts              # Detección de hardware client-side
  rawg.ts                  # Cliente de la API de RAWG (con fallback)
  schemas.ts               # Validación Zod + responseSchema de Gemini
  prisma.ts                # Cliente Prisma (adaptador pg)
```

### Flujo de una recomendación

1. El usuario configura géneros/estilo y escanea o escribe sus specs.
2. `FormSection` envía el perfil a `POST /api/recommend`.
3. El backend valida con Zod, calcula el **PC Score** y pide 4 juegos a Gemini
   usando **structured output** (JSON garantizado, sin parsear con regex).
4. Para cada juego se estiman los FPS (PC Score vs. `demand`) y se buscan datos
   reales en RAWG.
5. El cliente muestra las tarjetas; cada clic se registra vía `POST /api/track`.

## Requisitos

- Node.js 20+
- pnpm
- PostgreSQL

## Configuración

1. Instala dependencias:

```bash
pnpm install
```

2. Crea `.env.local` con:

```bash
API_KEY=tu_api_key_de_google_gemini
DATABASE_URL="postgresql://usuario:password@localhost:5432/tu_base"
# Opcional (carátulas + ratings reales):
RAWG_API_KEY=tu_api_key_de_rawg
```

> Sin `RAWG_API_KEY` la app funciona igual, pero las tarjetas usan un placeholder
> en lugar de la carátula real.

3. Aplica el esquema de la base de datos:

```bash
pnpm prisma db push
```

## Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). El dashboard está en
[http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/Base UI ·
Prisma 7 + PostgreSQL · Google Generative AI (Gemini) · Recharts · Zod.
