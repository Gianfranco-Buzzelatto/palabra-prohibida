import { useMemo } from "react";
import { C, ui } from "./shared/ui.js";
import { useHashRoute, go } from "./shared/hooks.js";
import { load } from "./shared/storage.js";
import PalabraProhibida from "./games/palabra-prohibida/PalabraProhibida.jsx";
import QuienSoy from "./games/quien-soy/QuienSoy.jsx";
import QueCancion from "./games/que-cancion/QueCancion.jsx";
import Pantalla from "./pages/Pantalla.jsx";
import Atribuciones from "./pages/Atribuciones.jsx";
import { CARDS } from "./games/palabra-prohibida/data.js";
import PERSONAJES from "./games/quien-soy/data/personajes.json";
import CANCIONES from "./games/que-cancion/data/canciones.json";

const volver = () => go("/");

function juegoGuardado(key) {
  const s = load(key, null);
  return !!s?.game && s.game.phase !== "final";
}

function Menu() {
  const fotosOk = PERSONAJES.filter((p) => p.foto.estado === "ok").length;
  const juegos = useMemo(
    () => [
      {
        ruta: "/palabra-prohibida", nombre: "PALABRA PROHIBIDA", emoji: "🚫", color: C.pink,
        desc: "Hacé que tu equipo adivine la palabra sin decir las prohibidas. Equipos, categorías y cronómetro.",
        estado: `Listo · ${CARDS.length} palabras`, boton: "Jugar",
      },
      {
        ruta: "/quien-soy", nombre: "¿QUIÉN SOY?", emoji: "🕵️", color: "#38BDF8",
        desc: "Uno de espaldas a la pantalla; los demás ven la foto y solo contestan SÍ o NO.",
        estado: `${PERSONAJES.length} personajes · fotos: ${fotosOk} cargadas, ${PERSONAJES.length - fotosOk} pendientes`,
        boton: "Jugar", guardado: juegoGuardado("quien-soy:estado"),
      },
      {
        ruta: "/que-cancion", nombre: "¿QUÉ CANCIÓN ES?", emoji: "🎵", color: C.yellow,
        desc: "Equipos contra el reloj: intro, coro y título con letras ocultas. El conductor pone la música.",
        estado: `${CANCIONES.length} canciones · enlaces de búsqueda (sin audio en la app)`,
        boton: "Jugar", guardado: juegoGuardado("que-cancion:estado"),
      },
    ],
    [fotosOk]
  );
  return (
    <div style={ui.root} className="app-root">
      <div style={ui.col} className="screen-fit">
        <div className="screen-body" style={{ justifyContent: "flex-start", alignItems: "stretch", gap: 12 }}>
          <div>
            <div style={ui.eyebrow}>CUMPLEAÑOS Y REUNIONES</div>
            <h1 style={ui.title}>PALABRA PROHIBIDA</h1>
            <div style={{ ...ui.subtitle, margin: "0 auto" }}>Tres juegos para la fiesta. Elegí uno.</div>
          </div>
          {juegos.map((j) => (
            <div key={j.ruta} className="fade-in" style={{ ...ui.card, display: "flex", gap: 14, alignItems: "center", textAlign: "left", borderColor: `${j.color}66` }}>
              <div aria-hidden="true" style={{ flex: "0 0 auto", width: "clamp(64px, 14vw, 104px)", height: "clamp(64px, 14vw, 104px)", borderRadius: 22, background: `linear-gradient(150deg, ${j.color}, ${C.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(34px, 7vw, 56px)" }}>{j.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(26px, 4vw, 36px)", letterSpacing: 1, color: j.color }}>{j.nombre}</div>
                <div style={{ color: C.soft, fontSize: "clamp(14px, 1.8vw, 18px)", lineHeight: 1.4 }}>{j.desc}</div>
                <div style={{ color: C.dim, fontSize: 13, margin: "4px 0 8px" }}>{j.estado}</div>
                <button style={{ ...ui.primary, width: "auto", padding: "12px 28px", fontSize: 20 }} onClick={() => go(j.ruta)}>
                  {j.guardado ? "▶ Retomar partida" : j.boton}
                </button>
              </div>
            </div>
          ))}
          <button style={ui.text} onClick={() => go("/atribuciones")}>📷 Atribuciones de fotos</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const route = useHashRoute();
  switch (route) {
    case "/palabra-prohibida": return <PalabraProhibida onMenu={volver} />;
    case "/quien-soy": return <QuienSoy onMenu={volver} />;
    case "/que-cancion": return <QueCancion onMenu={volver} />;
    case "/atribuciones": return <Atribuciones onMenu={volver} />;
    case "/pantalla": return <Pantalla />;
    default: return <Menu />;
  }
}
