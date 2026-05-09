"use client";

const ANALYSIS_IMG = "https://www.figma.com/api/mcp/asset/355e0816-b716-4042-91e8-5530323f66a7";

export default function HeroSection() {
  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "113px 48px 80px",
        position: "relative",
        overflow: "hidden",
        gap: 48,
        flexWrap: "wrap",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -96, right: -96,
        width: 384, height: 384, borderRadius: 12,
        background: "rgba(195,245,255,0.1)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Left content */}
      <div className="animate-fade-up" style={{ maxWidth: 568, display: "flex", flexDirection: "column", gap: 24, flex: "1 1 400px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(56px, 7vw, 88px)", lineHeight: 0.95,
            letterSpacing: -4.8, color: "var(--text-primary)",
          }}
        >
          Encuentra<br />
          los mejores<br />
          <span style={{ color: "var(--accent)" }}>juegos</span> para<br />
          tu PC
        </h1>

        <p className="animate-fade-up delay-200" style={{
          fontSize: 20, lineHeight: 1.4, fontWeight: 300,
          color: "var(--text-muted)",
        }}>
          Nuestro motor de IA analiza tus especificaciones técnicas y patrones de juego
          para entregarte recomendaciones precisas que realmente corren en tu máquina.
        </p>

        <div className="animate-fade-up delay-300" style={{ paddingTop: 16 }}>
          <button
            onClick={scrollToForm}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 32px", borderRadius: 6, border: "none", cursor: "pointer",
              background: "linear-gradient(136deg, #00daf3 0%, #00626e 100%)",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 16, letterSpacing: 1.6, textTransform: "uppercase",
              color: "var(--accent-dark)", transition: "opacity 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Comenzar
            <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
              <path d="M6 1v13M1 9l5 5 5-5" stroke="#00626e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right visual */}
      <div className="animate-fade-in delay-400" style={{ flex: "1 1 400px", maxWidth: 590 }}>
        <div style={{
          background: "rgba(53,52,55,0.4)",
          border: "1px solid rgba(132,147,150,0.15)",
          borderRadius: 8, padding: 17,
          backdropFilter: "blur(6px)",
          transform: "rotate(2deg)",
          position: "relative", overflow: "hidden",
          transition: "transform 0.4s ease",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "rotate(2deg)"; }}
        >
          <img
            src={ANALYSIS_IMG}
            alt="Game Analysis Visual"
            style={{ width: "100%", aspectRatio: "1", borderRadius: 4, display: "block", opacity: 0.8, objectFit: "cover" }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, #131315 0%, rgba(19,19,21,0) 50%)",
            pointerEvents: "none",
          }} />
          {/* HUD Badge */}
          <div style={{
            position: "absolute", bottom: 24, left: 24,
            background: "rgba(53,52,55,0.4)",
            border: "1px solid rgba(132,147,150,0.15)",
            borderRadius: 4, backdropFilter: "blur(6px)",
            padding: "16px 17px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ background: "#c3f5ff", width: 8, height: 32, borderRadius: 12, flexShrink: 0 }} />
            <div>
              <div style={{
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
                letterSpacing: 1, textTransform: "uppercase", color: "#c3f5ff", marginBottom: 4,
              }}>Matching Accuracy</div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: 20, color: "var(--text-primary)",
              }}>98.4%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
