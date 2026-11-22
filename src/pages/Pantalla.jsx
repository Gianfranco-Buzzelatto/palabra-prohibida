import { useEffect, useState } from "react";
import { C, ui } from "../shared/ui.js";
import { lastScene, subscribeScene } from "../shared/sync.js";
import { QSStage } from "../games/quien-soy/Stage.jsx";
import { CancionStage } from "../games/que-cancion/Stage.jsx";

// Ventana "pantalla" (#/pantalla): solo muestra la escena pública que publica el conductor.
export default function Pantalla() {
  const [scene, setScene] = useState(() => lastScene());
  const [fs, setFs] = useState(!!document.fullscreenElement);
  useEffect(() => subscribeScene(setScene), []);
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());

  return (
    <div style={ui.root} className="app-root">
      {!fs && <button style={{ ...ui.text, position: "fixed", top: 6, right: 8, opacity: 0.4, zIndex: 5 }} onClick={toggleFs}>⛶ Pantalla completa</button>}
      <div style={ui.col} className="screen-fit">
        {scene?.game === "quien-soy" && <QSStage scene={scene} />}
        {scene?.game === "que-cancion" && <CancionStage scene={scene} />}
        {!scene?.game && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={ui.title}>PALABRA PROHIBIDA</div>
            <div style={ui.subtitle}>Esperando que el conductor empiece una partida de ¿Quién soy? o ¿Qué canción es?</div>
            <div style={{ color: C.dim, fontSize: 14 }}>Esta ventana se sincroniza sola con la del conductor (mismo navegador).</div>
          </div>
        )}
      </div>
    </div>
  );
}
