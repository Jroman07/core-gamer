"use client";
import { useState } from "react";
import GameCard from "./GameCard";

const GAMES = [
  {
    name: "Cyber Odyssey",
    genre: "Open World / RPG",
    description: "Explora un mundo distópico donde tus decisiones alteran el destino de civilizaciones enteras.",
    image: "https://www.figma.com/api/mcp/asset/46243b9f-4b5d-4efe-b225-ab8fe31e5bc7",
    badges: [
      { label: "IA Match", type: "ia" as const },
      { label: "98%", type: "pct" as const },
    ],
    compat: { label: "Compatible", type: "green" as const },
  },
  {
    name: "Neon Strike",
    genre: "Tactical Shooter",
    description: "Combate 5v5 de alta precisión. Tu hardware actual garantiza 144fps estables en todo momento.",
    image: "https://www.figma.com/api/mcp/asset/76bbbfe2-b817-4150-a987-2beea3fd388d",
    badges: [{ label: "IA Match", type: "ia" as const }],
    compat: { label: "Optimizado", type: "green" as const },
  },
  {
    name: "Void Horizon",
    genre: "Space / Simulation",
    description: "Una experiencia de simulación espacial sin límites. Requiere tu SSD para carga instantánea.",
    image: "https://www.figma.com/api/mcp/asset/dbbf1aa6-c2a3-4485-b725-aa16faf6ce48",
    badges: [{ label: "Destacado", type: "dest" as const }],
    compat: { label: "Requiere SSD", type: "yellow" as const },
  },
  {
    name: "Ember Souls",
    genre: "Action / Adventure",
    description: "Desafía a dioses antiguos en este soul-like visualmente impresionante con mecánicas únicas.",
    image: "https://www.figma.com/api/mcp/asset/8c8144f5-8f84-46a9-bebc-f0bb67aed142",
    badges: [{ label: "IA Match", type: "ia" as const }],
    compat: { label: "Compatible", type: "green" as const },
  },
];

export default function ResultsSection() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <section id="results" style={{ padding: "96px 48px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 14, letterSpacing: 1.4, textTransform: "uppercase",
            color: "var(--gold)", marginBottom: 4,
          }}>Resultados Filtrados</div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 48, letterSpacing: -2.4, color: "var(--text-primary)",
          }}>Sugerencias para ti</div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 8 }}>
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                width: 36, height: 36,
                background: v === view ? "rgba(0,229,255,0.1)" : "#201f21",
                border: `1px solid ${v === view ? "var(--accent)" : "rgba(132,147,150,0.15)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {v === "grid" ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="1" width="6" height="6" stroke={v === view ? "#00e5ff" : "#849396"} strokeWidth="1.5" />
                  <rect x="11" y="1" width="6" height="6" stroke={v === view ? "#00e5ff" : "#849396"} strokeWidth="1.5" />
                  <rect x="1" y="11" width="6" height="6" stroke={v === view ? "#00e5ff" : "#849396"} strokeWidth="1.5" />
                  <rect x="11" y="11" width="6" height="6" stroke={v === view ? "#00e5ff" : "#849396"} strokeWidth="1.5" />
                </svg>
              ) : (
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <path d="M1 1h18M1 8h18M1 15h18" stroke={v === view ? "#00e5ff" : "#849396"} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: view === "grid" ? "repeat(4, 1fr)" : "1fr",
        gap: 32,
        marginBottom: 48,
      }}>
        {GAMES.map((game) => (
          <GameCard key={game.name} {...game} />
        ))}
      </div>

      {/* Load more */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          style={{
            padding: "17px 41px", borderRadius: 6,
            background: "#353437",
            border: "1px solid rgba(132,147,150,0.15)",
            cursor: "pointer",
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 16, letterSpacing: 1.6, textTransform: "uppercase",
            color: "var(--text-primary)", transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(132,147,150,0.15)"; e.currentTarget.style.color = "var(--text-primary)"; }}
        >
          Cargar más juegos
        </button>
      </div>
    </section>
  );
}
