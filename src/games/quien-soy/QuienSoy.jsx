import { useEffect, useMemo, useState } from "react";
import { C, ui } from "../../shared/ui.js";
import { TopBar, FinalScreen } from "../../shared/components.jsx";
import { usePersistentState } from "../../shared/hooks.js";
import { publishScene } from "../../shared/sync.js";
import { Setup } from "./Setup.jsx";
import { QSStage } from "./Stage.jsx";
import {
  defaultConfig, newGame, iniciarRonda, correcto, pasar, revelar, asignar, terminarRonda,
  tiempoAgotado, siguiente, finalizarPartida, escena, ranking,
} from "./logic.js";
import PERSONAJES from "./data/personajes.json";

const BY_ID = Object.fromEntries(PERSONAJES.map((p) => [p.id, p]));
export const KEY = "quien-soy:estado";

export default function QuienSoy({ onMenu }) {
  const [state, setState] = usePersistentState(KEY, () => ({ config: defaultConfig(), game: null }));
  const [tv, setTv] = useState(false);
  const { config, game } = state;

  const setConfig = (patch) => setState((s) => ({ ...s, config: { ...s.config, ...patch } }));
  const act = (fn) => setState((s) => (s.game ? { ...s, game: fn(s.game, Date.now()) } : s));

  // Fin de tiempo: se revisa con un intervalo (el reloj real son marcas de tiempo, no ticks).
  const jugando = game?.phase === "jugando";
  useEffect(() => {
    if (!jugando) return;
    const id = setInterval(() => {
      setState((s) => {
        const ng = tiempoAgotado(s.game, Date.now());
        return ng === s.game ? s : { ...s, game: ng };
      });
    }, 250);
    return () => clearInterval(id);
  }, [jugando, setState]);

  const scene = useMemo(() => (game ? escena(game, BY_ID) : { game: "quien-soy", fase: "setup" }), [game]);
  useEffect(() => {
    publishScene(scene);
  }, [scene]);
  useEffect(() => () => publishScene({ game: null }), []);

  const empezar = () => setState((s) => ({ ...s, game: newGame(s.config, PERSONAJES) }));
  const revancha = () =>
    setState((s) => ({ ...s, game: newGame(s.game.cfg, PERSONAJES, Math.random, s.game.queue.slice(0, s.game.cursor)) }));
  const nueva = () => {
    if (window.confirm("¿Volver a la configuración? Se descarta la partida actual.")) setState((s) => ({ ...s, game: null }));
  };

  if (!game) {
    return (
      <div style={ui.root} className="app-root">
        <TopBar onMenu={onMenu} title="¿QUIÉN SOY?" showScreenBtn={false} tv={false} onToggleTv={() => {}} />
        <Setup config={config} setConfig={setConfig} onStart={empezar} />
      </div>
    );
  }

  const fase = game.phase;
  const alto = tv ? 88 : 64;
  const btn = (bg, fg) => ({ ...ui.big(bg, fg), minHeight: alto });

  return (
    <div style={ui.root} className="app-root">
      {tv ? (
        <button style={{ ...ui.text, position: "fixed", top: 6, right: 8, opacity: 0.35, zIndex: 5 }} onClick={() => setTv(false)}>✕ salir de Modo TV</button>
      ) : (
        <TopBar onMenu={onMenu} confirmMenu={fase !== "final"} title="¿QUIÉN SOY?" tv={tv} onToggleTv={() => setTv(true)} />
      )}
      {fase === "final" ? (
        <FinalScreen
          rows={scene.ranking}
          onRematch={revancha} onNew={nueva} onMenu={onMenu}
        />
      ) : (
        <div style={ui.col} className="screen-fit">
          <QSStage scene={scene} />
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, paddingTop: 8, flex: "0 0 auto" }}>
            {!tv && scene.sinFoto && fase === "jugando" && (
              <div style={{ color: C.yellow, fontSize: 14, fontWeight: 700 }}>⚠️ Foto pendiente: se muestra un avatar con iniciales y la actividad como pista.</div>
            )}
            {fase === "turno" && (
              <button style={{ ...ui.primary, minHeight: alto }} onClick={() => act(iniciarRonda)}>▶ MOSTRAR PERSONAJE Y EMPEZAR</button>
            )}
            {fase === "jugando" && (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn(C.ok)} onClick={() => act(correcto)}>✔ Correcto</button>
                  <button style={btn("rgba(255,255,255,0.14)", C.ink)} onClick={() => act(pasar)}>⏭ Pasar{game.cfg.penalizacion ? ` (−${game.cfg.penalizacion})` : ""}</button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn(C.yellow, C.bg)} onClick={() => act(revelar)}>👁 Revelar</button>
                  <button style={btn("rgba(251,113,133,0.2)", C.bad)} onClick={() => act((g, n) => terminarRonda(g, n, "fin"))}>⏹ Finalizar ronda</button>
                </div>
              </>
            )}
            {fase === "asignar" && (
              <>
                <div style={{ color: C.soft, fontWeight: 700 }}>¿El jugador lo adivinó?</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn(C.ok)} onClick={() => act((g, n) => asignar(g, true, n))}>✔ Sí (+{game.cfg.puntos})</button>
                  <button style={btn("rgba(251,113,133,0.25)", C.bad)} onClick={() => act((g, n) => asignar(g, false, n))}>✘ No (0)</button>
                </div>
              </>
            )}
            {fase === "revelado" && (
              <button style={{ ...ui.primary, minHeight: alto }} onClick={() => act(siguiente)}>
                {game.turno + 1 >= game.rondas || game.cursor >= game.queue.length ? "🏆 VER RESULTADOS" : "SIGUIENTE JUGADOR →"}
              </button>
            )}
            {!tv && (fase === "turno" || fase === "revelado") && (
              <MiniScore game={game} onFinish={() => { if (window.confirm("¿Terminar la partida ahora?")) act(finalizarPartida); }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniScore({ game, onFinish }) {
  const top = ranking(game).slice(0, 3);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, color: C.soft, fontSize: 14 }}>
      <div style={{ textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {top.map((j, i) => `${["🥇", "🥈", "🥉"][i]} ${j.nombre} ${j.puntos}`).join("   ")}
      </div>
      <button style={ui.text} onClick={onFinish}>Terminar partida</button>
    </div>
  );
}
