"use client";
import { useState } from "react";

interface Badge {
  label: string;
  type: "ia" | "pct" | "dest";
}

interface GameCardProps {
  name: string;
  genre: string;
  description: string;
  url?: string;
  badges: Badge[];
  compat: { label: string; type: "green" | "yellow" | "red" };
}

const badgeStyles = {
  ia: {
    background: "rgba(195,245,255,0.2)",
    border: "1px solid rgba(195,245,255,0.3)",
    color: "var(--accent)",
  },
  pct: {
    background: "rgba(233,195,73,0.2)",
    border: "1px solid rgba(233,195,73,0.3)",
    color: "var(--gold)",
  },
  dest: {
    background: "rgba(233,195,73,0.2)",
    border: "1px solid rgba(233,195,73,0.3)",
    color: "var(--gold)",
  },
};

export default function GameCard({ name, genre, description, url, badges, compat }: GameCardProps) {
  const [hovered, setHovered] = useState(false);

  const handleTrackClick = () => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName: name, genre, url }),
    }).catch(err => console.error("Error al registrar click:", err));
  };

  return (
    <a
      href={url || "#"}
      target={url ? "_blank" : "_self"}
      rel="noreferrer"
      onClick={handleTrackClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: "none",
        background: "var(--bg-secondary)",
        border: `1px solid ${hovered ? "rgba(0,229,255,0.3)" : "rgba(132,147,150,0.15)"}`,
        borderRadius: 8, overflow: "hidden",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "border-color 0.2s, transform 0.25s ease",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Info */}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {badges.map((b) => (
            <div key={b.label} style={{
              padding: "5px 9px", borderRadius: 2,
              fontFamily: "var(--font-body)", fontWeight: 700,
              fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase",
              ...badgeStyles[b.type],
            }}>
              {b.label}
            </div>
          ))}
        </div>

        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 20, color: "var(--text-primary)",
        }}>{name}</div>

        <div style={{
          fontFamily: "var(--font-body)", fontWeight: 700,
          fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 8,
        }}>{genre}</div>

        <p style={{
          fontSize: 14, lineHeight: 1.5, color: "var(--text-muted)",
          display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>{description}</p>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: 8,
          marginTop: 20,
          fontFamily: "var(--font-body)", fontWeight: 700,
          fontSize: 12, color: "var(--text-dim)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: compat.type === "green" ? "var(--accent)" : compat.type === "red" ? "#ff4d4d" : "var(--gold)",
            }} />
            {compat.label}
          </div>

          {url && (
            <div 
              title={url}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: hovered ? "var(--accent)" : "rgba(0, 229, 255, 0.75)",
                fontSize: 11,
                letterSpacing: 0.5,
                transition: "color 0.2s",
                borderBottom: "1px solid transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; }}
            >
              <span>{(() => {
                try {
                  const urlObj = new URL(url);
                  return urlObj.hostname.replace("www.", "");
                } catch {
                  return "Sitio Web";
                }
              })()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
