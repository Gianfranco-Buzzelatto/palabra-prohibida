import { useState } from "react";
import { C, ui } from "../../shared/ui.js";
import { Clock, FinalBoard } from "../../shared/components.jsx";

// Foto local con respaldo: avatar con iniciales y color de categoría.
export function Foto({ foto, iniciales, color, style }) {
  const [fallo, setFallo] = useState(false);
  const base = { borderRadius: 24, overflow: "hidden", height: "100%", maxWidth: "100%", aspectRatio: "3 / 4", border: `4px solid ${color}`, boxShadow: `0 12px 40px ${color}55`, ...style };
  if (foto && !fallo) {
    return (
      <img src={`${import.meta.env.BASE_URL}personajes/${foto}`} alt="Personaje a adivinar" onError={() => setFallo(true)} style={{ ...base, objectFit: "cover", background: C.bg2 }} />
    );
  }
  return (
    <div role="img" aria-label="Avatar con iniciales" style={{ ...base, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(160deg, ${color}, ${C.bg})` }}>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 24vh, 220px)", color: C.bg, textShadow: "0 4px 0 rgba(255,255,255,0.25)" }}>{iniciales}</span>
    </div>
  );
}

const RESULTADO = {
  acierto: ["🎉 ¡CORRECTO!", C.ok], tiempo: ["⏰ SE ACABÓ EL TIEMPO", C.pink], fin: ["⏹ RONDA FINALIZADA", C.soft],
  "no-acerto": ["😅 NO LO ADIVINÓ", C.pink], "sin-personajes": ["🏁 NO QUEDAN PERSONAJES", C.soft],
};

// Vista pública: la usan tanto el conductor como la ventana "pantalla". Solo recibe la escena pública.
export function QSStage({ scene }) {
  const wrap = { flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 };
  if (!scene || scene.fase === "setup") {
    return <div style={{ ...wrap, justifyContent: "center" }}><div style={ui.title}>¿QUIÉN SOY?</div><div style={ui.subtitle}>Preparando la partida…</div></div>;
  }
  if (scene.fase === "final") {
    return (
      <div style={{ ...wrap, overflowY: "auto" }}>
        <div style={ui.eyebrow}>🏆 RESULTADOS</div>
        <FinalBoard rows={scene.ranking || []} big />
      </div>
    );
  }
  const header = (
    <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ textAlign: "left" }}>
        <div style={{ color: C.dim, fontWeight: 800, fontSize: "clamp(13px, 1.6vw, 18px)" }}>RONDA {scene.ronda} / {scene.rondas}</div>
        <div style={{ fontWeight: 800, color: C.yellow, fontSize: "clamp(18px, 2.6vw, 30px)" }}>🎤 {scene.jugador}</div>
      </div>
      {scene.fase === "jugando" && <Clock timer={scene.timer} />}
    </div>
  );
  if (scene.fase === "turno") {
    return (
      <div style={{ ...wrap, justifyContent: "center" }} className="fade-in">
        <div style={ui.eyebrow}>RONDA {scene.ronda} / {scene.rondas}</div>
        <div style={{ ...ui.title, fontSize: "clamp(44px, 12vh, 110px)" }}>{scene.jugador}</div>
        <div style={ui.subtitle}>Date vuelta: el que juega <b>no mira</b> la pantalla. Los demás, solo SÍ o NO.</div>
      </div>
    );
  }
  const p = scene.personaje;
  const rev = scene.revelado;
  const [titulo, colorRes] = RESULTADO[scene.resultado] || [null, C.soft];
  return (
    <div style={wrap}>
      {header}
      <div style={{ flex: 1, minHeight: 0, width: "100%", display: "flex", justifyContent: "center" }} key={p?.foto || p?.iniciales}>
        {p && <Foto foto={p.foto} iniciales={p.iniciales} color={p.color} />}
      </div>
      {rev ? (
        <div className="pop-in" style={{ textAlign: "center" }}>
          {titulo && <div style={{ color: colorRes, fontWeight: 800, fontSize: "clamp(16px, 2.2vw, 24px)" }}>{titulo}{scene.resultado === "acierto" ? ` +${scene.puntos}` : ""}</div>}
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 7vh, 72px)", lineHeight: 1, color: C.ink }}>{rev.nombre}</div>
          <div style={{ color: C.soft, fontSize: "clamp(14px, 1.8vw, 20px)" }}>{rev.descripcion}</div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 6vh, 60px)", letterSpacing: 6, color: C.dim }}>¿QUIÉN SOY?</div>
          <div style={{ color: C.soft, fontSize: "clamp(14px, 1.8vw, 20px)" }}>{p?.categoria}{p?.pista ? ` · ${p.pista}` : ""}</div>
        </div>
      )}
    </div>
  );
}
