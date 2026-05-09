"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 48px",
        background: scrolled ? "rgba(19,19,21,0.95)" : "rgba(19,19,21,0.8)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 40px rgba(0,229,255,0.06)",
        borderBottom: "1px solid rgba(0,229,255,0.06)",
        transition: "background 0.3s",
      }}
    >
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: 24, letterSpacing: -1.2, color: "var(--accent)",
      }}>
        COREGAMER
      </span>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[
          { label: "Home", id: "hero" },
          { label: "Recomendaciones", id: "form" },
          { label: "Explorar", id: "results" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 14, letterSpacing: -0.7, textTransform: "uppercase",
              color: item.id === "hero" ? "var(--accent)" : "var(--text-primary)",
              borderBottom: item.id === "hero" ? "2px solid var(--accent)" : "2px solid transparent",
              paddingBottom: 6, transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              if (item.id !== "hero")
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
