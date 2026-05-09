"use client";
import { useState } from "react";
import { useGameContext } from "../context/GameContext";

const genres = ["RPG", "Shooter", "Strategy", "Open World", "Indie", "Sports", "Horror", "Puzzle"];

const BentoCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: "rgba(53,52,55,0.4)",
    border: "1px solid rgba(132,147,150,0.15)",
    borderRadius: 8, padding: 33,
    backdropFilter: "blur(6px)",
    ...style,
  }}>
    {children}
  </div>
);

const SectionHeading = ({ icon, children }: { icon: React.ReactNode; children: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>
    {icon}
    {children}
  </div>
);

export default function FormSection() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Shooter", "Open World"]);
  const [style, setStyle] = useState("Competitivo");
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [ram, setRam] = useState("16 GB");
  const [storage, setStorage] = useState("SSD NVMe");

  const { setGames, loading, setLoading } = useGameContext();

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    const formData = { selectedGenres, style, cpu, gpu, ram, storage };

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.games) {
        setGames(data.games);
      } else {
        alert(data.error || "Ocurrió un error al conectar con la IA.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al generar recomendaciones.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-dark)",
    border: "1px solid rgba(59,73,76,0.1)",
    borderRadius: 6, height: 46, width: "100%",
    padding: "0 17px",
    fontFamily: "var(--font-body)", fontSize: 14,
    color: "var(--text-muted)", outline: "none",
    transition: "border-color 0.2s, color 0.2s",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    color: "var(--text-primary)",
    cursor: "pointer",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23849396' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "12px",
  };

  return (
    <section id="form" style={{ background: "var(--bg-secondary)", padding: "80px 64px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

        {/* Heading */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 36, letterSpacing: -1.8, textTransform: "uppercase",
            color: "var(--text-primary)", textAlign: "center",
          }}>
            Configura tu Perfil de Juego
          </h2>
          <div style={{ width: 96, height: 4, background: "#c3f5ff", borderRadius: 2 }} />
        </div>

        {/* Bento Grid */}
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>

          {/* Genre */}
          <BentoCard style={{ gridColumn: "1 / span 8" }}>
            <SectionHeading icon={
              <svg width="19" height="20" viewBox="0 0 19 20" fill="none">
                <rect x="1" y="1" width="17" height="18" rx="3" stroke="#00e5ff" strokeWidth="1.5" />
                <path d="M6 10h7M9.5 6.5v7" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }>Géneros Favoritos</SectionHeading>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {genres.map((g) => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: 17, borderRadius: 2, cursor: "pointer",
                      background: active ? "rgba(195,245,255,0.05)" : "var(--bg-primary)",
                      border: `1px solid ${active ? "var(--accent)" : "rgba(59,73,76,0.2)"}`,
                      fontFamily: "var(--font-body)", fontWeight: 500,
                      fontSize: 14, color: "var(--text-primary)",
                      transition: "all 0.2s", textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 12, height: 12, borderRadius: 2, flexShrink: 0,
                      border: `1.5px solid ${active ? "var(--accent)" : "rgba(132,147,150,0.4)"}`,
                      background: active ? "var(--accent)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      {active && <span style={{ fontSize: 8, color: "#000", fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                    {g}
                  </button>
                );
              })}
            </div>
          </BentoCard>

          {/* Style */}
          <BentoCard style={{ gridColumn: "9 / span 4" }}>
            <SectionHeading icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#00e5ff" strokeWidth="1.5" />
                <path d="M10 6v4l3 3" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }>Estilo</SectionHeading>

            <div style={{ position: "relative" }}>
              <select
                aria-label="Estilo de juego"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                style={{ ...selectStyle, marginBottom: 15 }}
              >
                {["Competitivo", "Casual", "Cooperativo", "Historia", "Sandbox"].map((s) => (
                  <option key={s} value={s} style={{ background: "var(--bg-dark)" }}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px", fontSize: 12, color: "var(--text-muted)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1px solid var(--text-muted)", flexShrink: 0 }} />
              Ajusta la dificultad sugerida
            </div>
          </BentoCard>

          {/* PC Specs */}
          <BentoCard style={{ gridColumn: "1 / span 12", position: "relative", overflow: "hidden" }}>
            {/* Decorative circuit */}
            <svg style={{ position: "absolute", top: 0, right: 0, width: 122, height: 122, opacity: 0.06 }}
              viewBox="0 0 90 90" fill="none">
              <circle cx="45" cy="45" r="44" stroke="#00e5ff" strokeWidth="2" />
              <circle cx="45" cy="45" r="30" stroke="#00e5ff" strokeWidth="1" />
              <circle cx="45" cy="45" r="5" fill="#00e5ff" />
            </svg>

            <SectionHeading icon={
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="1" width="20" height="20" rx="3" stroke="#00e5ff" strokeWidth="1.5" />
                <path d="M5 16h12M8 12V8m3 4V6m3 6v-2" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }>Especificaciones de PC</SectionHeading>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
              {[
                { label: "Procesador (CPU)", value: cpu, setter: setCpu, placeholder: "i7-12700K / Ryzen 7", type: "input" },
                { label: "Gráficos (GPU)", value: gpu, setter: setGpu, placeholder: "RTX 3080 / RX 6800", type: "input" },
              ].map((field) => (
                <div key={field.label}>
                  <label htmlFor={field.label} style={{
                    display: "block", marginBottom: 8,
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                    letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)",
                  }}>{field.label}</label>
                  <input
                    id={field.label}
                    type="text"
                    value={field.value as string}
                    onChange={(e) => (field.setter as (v: string) => void)(e.target.value)}
                    placeholder={field.placeholder}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(0,229,255,0.3)"; e.target.style.color = "var(--text-primary)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(59,73,76,0.1)"; }}
                  />
                </div>
              ))}

              <div>
                <label htmlFor="ram-select" style={{
                  display: "block", marginBottom: 8,
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                  letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)",
                }}>Memoria RAM</label>
                <select id="ram-select" value={ram} onChange={(e) => setRam(e.target.value)} style={selectStyle}>
                  {["8 GB", "16 GB", "32 GB", "64 GB"].map((o) => (
                    <option key={o} value={o} style={{ background: "var(--bg-dark)" }}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="storage-select" style={{
                  display: "block", marginBottom: 8,
                  fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                  letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)",
                }}>Almacenamiento</label>
                <select id="storage-select" value={storage} onChange={(e) => setStorage(e.target.value)} style={selectStyle}>
                  {["SSD NVMe", "SSD SATA", "HDD", "SSD + HDD"].map((o) => (
                    <option key={o} value={o} style={{ background: "var(--bg-dark)" }}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 12,
                  padding: "16px 48px", borderRadius: 6, border: "none", 
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "rgba(0, 218, 243, 0.5)" : "linear-gradient(135deg, #00daf3 0%, #00626e 100%)",
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: 16, letterSpacing: 1.6, textTransform: "uppercase",
                  color: "var(--accent-dark)", transition: "opacity 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; } }}
              >
                {loading ? "Analizando..." : "Generar recomendaciones"}
                {!loading && (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 3l8 8-8 8M3 11h16" stroke="#00626e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </BentoCard>
        </form>
      </div>
    </section>
  );
}
