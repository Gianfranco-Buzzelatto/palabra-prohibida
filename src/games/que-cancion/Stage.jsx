import { C, ui } from "../../shared/ui.js";
import { Clock, FinalBoard } from "../../shared/components.jsx";

const NIVEL_INFO = {
  1: ["🎧", "NIVEL 1 · ESCUCHÁ", "Suenan los primeros segundos del tema"],
  2: ["🎤", "NIVEL 2 · LLEGA EL CORO", "Ahora suena el estribillo"],
  3: ["🔤", "NIVEL 3 · PISTA VISUAL", "Completá el título"],
};
const INTRO = {
  clasica: null,
  letra: ["🎶", "SEGUÍ LA LETRA", "Suena la canción… ¡y de pronto se corta!"],
  intro: ["🎹", "INTRO MISTERIOSA", "Solo la introducción. ¿Qué canción es?"],
  decada: ["📅", "¿DE QUÉ DÉCADA ES?", "Elegí la década de lanzamiento"],
  duelo: ["⚔️", "DUELO MUSICAL", "El primero que acierta se lleva los puntos"],
};

export function Marcador({ scene }) {
  return (
    <div style={{ width: "100%", display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {scene.equipos.map((e) => {
        const activo = scene.activos.includes(e.id);
        const bloq = scene.bloqueados.includes(e.id);
        return (
          <div key={e.id} style={{
            flex: "1 1 120px", maxWidth: 220, padding: "6px 10px", borderRadius: 14, textAlign: "center",
            background: activo ? `${e.color}22` : "rgba(255,255,255,0.04)", border: `2px solid ${activo ? e.color : "rgba(255,255,255,0.1)"}`,
            opacity: bloq ? 0.45 : activo ? 1 : 0.55,
          }}>
            <div style={{ fontWeight: 800, fontSize: "clamp(12px, 1.6vw, 18px)", color: e.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bloq ? "🚫 " : ""}{e.nombre}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(24px, 4vh, 40px)", lineHeight: 1 }}>{e.puntos}</div>
          </div>
        );
      })}
    </div>
  );
}

// Vista pública: la usan el conductor y la ventana "pantalla". No recibe respuestas sin revelar.
export function CancionStage({ scene }) {
  const wrap = { flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 };
  if (!scene || scene.fase === "setup") {
    return <div style={{ ...wrap, justifyContent: "center" }}><div style={ui.title}>¿QUÉ CANCIÓN ES?</div><div style={ui.subtitle}>Preparando la partida…</div></div>;
  }
  if (scene.fase === "final") {
    return (
      <div style={{ ...wrap, overflowY: "auto" }}>
        <div style={ui.eyebrow}>🏆 RESULTADOS</div>
        <FinalBoard rows={scene.ranking || []} big />
      </div>
    );
  }
  const clasica = scene.modalidad === "clasica";
  const [emoji, titulo, sub] = clasica ? NIVEL_INFO[scene.nivel] : INTRO[scene.modalidad];
  const rev = scene.revelado;
  const res = scene.resultado;
  return (
    <div style={wrap}>
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ color: C.dim, fontWeight: 800, fontSize: "clamp(13px, 1.6vw, 18px)" }}>CANCIÓN {scene.ronda} / {scene.rondas}</div>
          {scene.modalidad !== "clasica" && scene.activosNombres.length < scene.equipos.length && (
            <div style={{ color: C.yellow, fontWeight: 800, fontSize: "clamp(16px, 2.2vw, 26px)" }}>{scene.activosNombres.join("  vs  ")}</div>
          )}
        </div>
        {scene.timer && !rev && <Clock timer={scene.timer} />}
      </div>

      <div style={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, textAlign: "center", overflow: "hidden" }}>
        {rev ? (
          <div className="pop-in">
            {res && (
              <div style={{ fontWeight: 800, fontSize: "clamp(18px, 2.6vw, 30px)", color: res.tipo === "acierto" ? C.ok : C.pink }}>
                {res.tipo === "acierto" ? `🎉 ${res.equipos.join(" y ")}` : res.tipo === "tiempo" ? "⏰ SE ACABÓ EL TIEMPO" : "NADIE SUMÓ PUNTOS"}
              </div>
            )}
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 7vh, 76px)", lineHeight: 1, color: C.ink }}>{rev.titulo}</div>
            <div style={{ fontWeight: 800, color: C.yellow, fontSize: "clamp(20px, 3.4vh, 38px)" }}>{rev.artista}</div>
            {rev.decada && <div style={{ color: C.soft, fontSize: "clamp(14px, 1.8vw, 22px)" }}>Década de {rev.decada}s{scene.decadaElegida ? ` · elegida: ${scene.decadaElegida}s` : ""}</div>}
          </div>
        ) : (
          <>
            <div style={{ fontSize: "clamp(30px, 6vh, 64px)", lineHeight: 1 }}>{emoji}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.yellow, fontSize: "clamp(24px, 4.5vh, 48px)", lineHeight: 1 }}>{titulo}</div>
            {scene.mascara ? (
              <div className="pop-in" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 6vh, 64px)", letterSpacing: "0.1em", wordBreak: "break-word", lineHeight: 1.1 }}>{scene.mascara}</div>
            ) : (
              <div style={{ color: C.soft, fontSize: "clamp(15px, 2vw, 24px)" }}>{sub}</div>
            )}
            {scene.decadaOpciones && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
                {scene.decadaOpciones.map((d) => <span key={d} style={{ ...ui.pill, fontSize: "clamp(16px, 2.4vw, 28px)" }}>{d}s</span>)}
              </div>
            )}
            <div style={{ color: C.dim, fontWeight: 700 }}>
              {scene.categoria}{scene.modalidad !== "decada" && scene.modalidad !== "letra" ? ` · vale ${scene.puntosNivel.titulo} + ${scene.puntosNivel.artista} pts` : ""}
              {scene.modalidad === "letra" ? ` · vale ${scene.puntosNivel.titulo} pts` : ""}
            </div>
          </>
        )}
      </div>
      <Marcador scene={scene} />
    </div>
  );
}
