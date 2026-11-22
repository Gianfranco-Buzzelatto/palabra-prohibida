// Identidad visual compartida por los tres juegos (mismos valores que Palabra Prohibida).
export const C = {
  bg: "#170B2E", bg2: "#0D0620", yellow: "#F2B705", orange: "#FF9F1C", pink: "#FF3D7F",
  ink: "#FFF8ED", soft: "#C9BEDD", dim: "#8B7BAE", ok: "#34D399", bad: "#FB7185",
};

export const TEAM_COLORS = ["#FF3D7F", "#38BDF8", "#34D399", "#F2B705", "#A78BFA", "#FB923C"];

export const ui = {
  root: {
    width: "100%", background: "radial-gradient(circle at 20% 0%, #3A1A66 0%, #170B2E 55%, #0D0620 100%)",
    color: C.ink, fontFamily: "'Manrope', sans-serif", height: "100dvh", maxHeight: "100dvh",
    overflow: "hidden", padding: "12px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
    userSelect: "none", WebkitUserSelect: "none",
  },
  col: { width: "100%", maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, minHeight: 0 },
  eyebrow: { fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3, color: C.yellow, fontSize: "clamp(16px, 2.2vw, 22px)", marginBottom: 6 },
  title: {
    fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 7vw, 64px)", lineHeight: 1, margin: "0 0 8px", letterSpacing: 1,
    background: "linear-gradient(90deg,#F2B705,#FF3D7F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { color: C.soft, fontSize: "clamp(16px, 2vw, 21px)", lineHeight: 1.45, marginBottom: 8, maxWidth: 640 },
  card: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 16 },
  label: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(18px, 2.3vw, 24px)", letterSpacing: 1, marginBottom: 8, color: C.yellow, textAlign: "left" },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  pill: { border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: C.ink, borderRadius: 12, padding: "11px 16px", fontWeight: 700, fontSize: "clamp(15px, 1.9vw, 19px)" },
  pillOn: { background: C.yellow, color: C.bg, borderColor: C.yellow },
  input: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "11px 13px", color: C.ink, fontSize: "clamp(15px, 1.9vw, 19px)", outline: "none", userSelect: "text", WebkitUserSelect: "text", width: "100%" },
  primary: { width: "100%", background: "linear-gradient(90deg,#F2B705,#FF9F1C)", color: C.bg, border: "none", borderRadius: 14, padding: "16px 20px", fontSize: "clamp(18px, 2.3vw, 24px)", fontWeight: 800, boxShadow: "0 8px 24px rgba(242,183,5,0.25)" },
  secondary: { width: "100%", background: "rgba(255,255,255,0.08)", color: C.ink, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: "14px 20px", fontSize: "clamp(16px, 2.1vw, 21px)", fontWeight: 800 },
  text: { background: "transparent", border: "none", color: C.soft, fontWeight: 700, fontSize: 15, padding: "4px 2px" },
  big: (bg, fg = "#04241a") => ({ flex: 1, minHeight: 64, border: "none", borderRadius: 16, background: bg, color: fg, fontWeight: 800, fontSize: "clamp(17px, 2.4vw, 24px)", padding: "10px 12px" }),
  timerNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px, 9vh, 84px)", lineHeight: 1, color: C.yellow },
};
