"use client";

export default function Footer() {
  const platforms = [
    { label: "Steam", icon: "🎮" },
    { label: "Epic Games", icon: "⚡" },
    { label: "Gameplay", icon: "▶" },
    { label: "System Req.", icon: "💻" },
    { label: "Reviews", icon: "★" },
  ];

  return (
    <>
      {/* Platform Links */}
      <section style={{ background: "var(--bg-dark)", padding: "64px" }}>
        <div style={{
          maxWidth: 1152, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24,
        }}>
          {platforms.map((p) => (
            <a
              key={p.label}
              href="#"
              style={{
                background: "rgba(53,52,55,0.4)",
                border: "1px solid rgba(132,147,150,0.15)",
                borderRadius: 4, padding: 25,
                backdropFilter: "blur(6px)",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 12,
                cursor: "pointer", textDecoration: "none",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,229,255,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(132,147,150,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: 20, opacity: 0.8 }}>{p.icon}</span>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase",
                color: "var(--text-primary)",
              }}>{p.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid rgba(0,229,255,0.1)",
        padding: "49px 48px 48px",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 32, alignItems: "center",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 18, color: "var(--text-primary)", marginBottom: 8,
            }}>CORE GAMER</div>
            <div style={{
              fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase",
              color: "var(--text-dim)",
            }}>© 2026 CORE GAMER. Binary Productions.</div>
          </div>

          <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
            {["Politica de privacidad", "Terminos y condiciones"].map((l) => (
              <a key={l} href="#" style={{
                fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase",
                color: "var(--text-dimmer)", textDecoration: "none",
                transition: "color 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dimmer)"; }}
              >{l}</a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 32, justifyContent: "flex-end" }}>
            {["SOPORTE", "DOCUMENTACIÓN"].map((l) => (
              <a key={l} href="#" style={{
                fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase",
                color: "var(--text-dimmer)", textDecoration: "none",
                transition: "color 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dimmer)"; }}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
