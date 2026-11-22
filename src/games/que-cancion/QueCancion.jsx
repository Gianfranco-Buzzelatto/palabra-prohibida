import { useEffect, useMemo, useState } from "react";
import { C, ui } from "../../shared/ui.js";
import { TopBar, FinalScreen } from "../../shared/components.jsx";
import { usePersistentState, useNow } from "../../shared/hooks.js";
import { publishScene } from "../../shared/sync.js";
import { Setup } from "./Setup.jsx";
import { CancionStage } from "./Stage.jsx";
import {
  defaultConfig, newGame, iniciar, pausar, rondaIniciada, adelantarNivel, marcar, marcarError, validar,
  elegirDecada, tick, pasar, revelar, siguiente, finalizar, setPlataforma, nivelActual, extraActual, activos,
  estaBloqueado, puntosDe, modo, escena, ranking, enlace, platNombre, teamColor,
} from "./logic.js";
import CANCIONES from "./data/canciones.json";

const BY_ID = Object.fromEntries(CANCIONES.map((c) => [c.id, c]));
export const KEY = "que-cancion:estado";
const abrir = (url) => window.open(url, "_blank", "noopener,noreferrer");

export default function QueCancion({ onMenu }) {
  const [state, setState] = usePersistentState(KEY, () => ({ config: defaultConfig(), game: null }));
  const [tv, setTv] = useState(false);
  const { config, game } = state;
  const setConfig = (patch) => setState((s) => ({ ...s, config: { ...s.config, ...patch } }));
  const act = (fn) => setState((s) => (s.game ? { ...s, game: fn(s.game, Date.now()) } : s));

  const corriendo = !!game && game.phase === "ronda" && game.timer.running;
  const now = useNow(corriendo);
  const nivel = game ? nivelActual(game, now) : 1;
  const extra = game ? extraActual(game, now) : 0;

  // Fin del tiempo (también al volver tras una recarga con el reloj vencido).
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setState((s) => {
        const ng = tick(s.game, Date.now());
        return ng === s.game ? s : { ...s, game: ng };
      });
    }, 250);
    return () => clearInterval(id);
  }, [corriendo, setState]);

  const scene = useMemo(() => (game ? escena(game, BY_ID, nivel, extra) : { game: "que-cancion", fase: "setup" }), [game, nivel, extra]);
  useEffect(() => {
    publishScene(scene);
  }, [scene]);
  useEffect(() => () => publishScene({ game: null }), []);

  const empezar = () => setState((s) => ({ ...s, game: newGame(s.config, CANCIONES) }));
  const revancha = () => setState((s) => ({ ...s, game: newGame(s.game.cfg, CANCIONES, Math.random, s.game.queue.slice(0, s.game.cursor)) }));
  const nueva = () => {
    if (window.confirm("¿Volver a la configuración? Se descarta la partida actual.")) setState((s) => ({ ...s, game: null }));
  };

  if (!game) {
    return (
      <div style={ui.root} className="app-root">
        <TopBar onMenu={onMenu} title="¿QUÉ CANCIÓN ES?" showScreenBtn={false} tv={false} onToggleTv={() => {}} />
        <Setup config={config} setConfig={setConfig} onStart={empezar} />
      </div>
    );
  }

  if (game.phase === "final") {
    const rows = ranking(game);
    const mejor = [...rows].sort((a, b) => b.acertadas - a.acertadas)[0];
    const sinResolver = game.historial.filter((h) => h.tipo === "tiempo" || h.tipo === "sin-puntos").length;
    return (
      <div style={ui.root} className="app-root">
        <TopBar onMenu={onMenu} title="¿QUÉ CANCIÓN ES?" showScreenBtn tv={false} onToggleTv={() => {}} />
        <FinalScreen
          rows={rows} onRematch={revancha} onNew={nueva} onMenu={onMenu}
          extra={
            <div style={{ color: C.soft, fontSize: 15, marginTop: 6 }}>
              ⭐ Más canciones acertadas: <b style={{ color: C.yellow }}>{mejor?.nombre}</b> ({mejor?.acertadas}) · Sin resolver: {sinResolver} · Saltadas: {game.historial.filter((h) => h.tipo === "saltada").length}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div style={ui.root} className="app-root">
      {tv ? (
        <button style={{ ...ui.text, position: "fixed", top: 6, right: 8, opacity: 0.35, zIndex: 5 }} onClick={() => setTv(false)}>✕ salir de Modo TV</button>
      ) : (
        <TopBar onMenu={onMenu} confirmMenu title="¿QUÉ CANCIÓN ES?" tv={tv} onToggleTv={() => setTv(true)} />
      )}
      <div style={ui.col} className="screen-fit">
        <CancionStage scene={scene} />
        <Panel game={game} nivel={nivel} tv={tv} act={act} setState={setState} />
      </div>
    </div>
  );
}

function Panel({ game, nivel, tv, act, setState }) {
  const [verDatos, setVerDatos] = useState(false);
  const c = BY_ID[game.songId];
  const m = modo(game);
  const alto = tv ? 76 : 50;
  const b = (bg, fg) => ({ ...ui.big(bg, fg), minHeight: alto, fontSize: "clamp(15px, 2vw, 21px)" });
  const reveal = game.phase === "reveal";
  const ultima = game.idx + 1 >= game.rondas || game.cursor >= game.queue.length;
  const iniciada = rondaIniciada(game);
  const plat = game.plataforma;
  const abrirPlat = (p) => {
    setState((s) => ({ ...s, game: setPlataforma(s.game, p) }));
    abrir(enlace(c, p).url);
  };
  const pts = puntosDe(game.cfg, nivel);
  const idsActivos = activos(game);

  return (
    <div key={game.songId} style={{ width: "100%", flex: "0 0 auto", maxHeight: tv ? "55%" : "42%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
      {!reveal && (
        <>
          {m.tiempoMs > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              {!iniciada ? (
                <button style={{ ...ui.primary, minHeight: alto }} onClick={() => act(iniciar)}>▶ INICIAR RONDA (primero poné la canción)</button>
              ) : (
                <button style={b("rgba(255,255,255,0.14)", C.ink)} onClick={() => act((g, n) => (g.timer.running ? pausar(g, n) : iniciar(g, n)))}>{game.timer.running ? "⏸ Pausar" : "▶ Reanudar"}</button>
              )}
              {m.niveles > 1 && nivel < 3 && <button style={b(C.yellow, C.bg)} onClick={() => act(adelantarNivel)}>⏩ Adelantar a nivel {nivel + 1}</button>}
            </div>
          )}
          {!tv && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["spotify", "youtube"].map((p) => (
                <button key={p} style={{ ...ui.secondary, flex: "1 1 150px", width: "auto", fontSize: 16, padding: "12px 10px", borderColor: plat === p ? C.yellow : undefined }} onClick={() => abrirPlat(p)}>
                  {p === "spotify" ? "🎵" : "▶️"} {enlace(c, p).texto}
                </button>
              ))}
              <button style={{ ...ui.secondary, flex: "1 1 150px", width: "auto", fontSize: 16, padding: "12px 10px" }} onClick={() => abrir(enlace(c, plat).url)}>🔁 Reproducir de nuevo</button>
            </div>
          )}
          {!tv && (
            <div style={{ color: C.dim, fontSize: 13, textAlign: "left" }}>
              {game.cfg.modalidad === "clasica" && (nivel === 1 ? "Nivel 1: reproducí 15 segundos desde el inicio y dejá pensar al resto." : nivel === 2 ? "Nivel 2: saltá al minuto del coro y reproducilo." : "Nivel 3: el público ve el título con letras ocultas.")}
              {game.cfg.modalidad === "letra" && "Poné la canción y cortala en un momento cantable: el equipo sigue la letra."}
              {game.cfg.modalidad === "intro" && "Reproducí solo la introducción instrumental."}
              {game.cfg.modalidad === "duelo" && "Reproducí el tema: gana el primero de los dos equipos que acierte."}
              {game.cfg.modalidad === "decada" && "Reproducí el tema y dejá que el equipo elija una década."}
              {" "}La pestaña de {platNombre(plat)} muestra el nombre del tema: no la compartas con el público.
            </div>
          )}
          {!tv && (
            <div style={{ ...ui.card, padding: 10, textAlign: "left" }}>
              <button style={ui.text} onClick={() => setVerDatos((v) => !v)}>{verDatos ? "🙈 Ocultar datos del conductor" : "👁 Datos del conductor (privado)"}</button>
              {verDatos && (
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                  <div><b>{c.titulo}</b> — {c.artista}</div>
                  <div style={{ color: C.soft }}>{c.categoria} · {c.decada ? `${c.decada}s` : "década sin verificar"} · coro: {c.coro || "sin cargar (ubicalo en el tema)"}</div>
                  {c.revisar?.length > 0 && <div style={{ color: C.dim, fontSize: 13 }}>Datos a revisar: {c.revisar.join(", ")}</div>}
                </div>
              )}
            </div>
          )}

          {m.tipo === "respuesta" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {game.cfg.equipos.filter((e) => idsActivos.includes(e.id)).map((e) => {
                const i = game.cfg.equipos.indexOf(e);
                const bloq = estaBloqueado(game, e.id, nivel);
                const tieneT = !!game.acierto.titulo;
                const tieneA = !!game.acierto.artista;
                return (
                  <div key={e.id} style={{ display: "flex", gap: 6, alignItems: "stretch", opacity: bloq ? 0.45 : 1, borderLeft: `6px solid ${teamColor(i)}`, paddingLeft: 8 }}>
                    <div style={{ flex: "1 1 90px", textAlign: "left", fontWeight: 800, alignSelf: "center", color: teamColor(i) }}>{bloq ? "🚫 " : ""}{e.nombre}</div>
                    <button disabled={bloq || tieneT} style={{ ...b(C.ok), flex: "1 1 80px", opacity: tieneT ? 0.3 : 1 }} onClick={() => act((g, n) => marcar(g, e.id, "titulo", n))}>Título +{pts.titulo}</button>
                    <button disabled={bloq || tieneA} style={{ ...b(C.ok), flex: "1 1 80px", opacity: tieneA ? 0.3 : 1 }} onClick={() => act((g, n) => marcar(g, e.id, "artista", n))}>Artista +{pts.artista}</button>
                    <button disabled={bloq || (tieneT && tieneA)} style={{ ...b(C.yellow, C.bg), flex: "1 1 80px" }} onClick={() => act((g, n) => marcar(g, e.id, "ambos", n))}>Ambos</button>
                    <button disabled={bloq} style={{ ...b("rgba(251,113,133,0.25)", C.bad), flex: "0 0 56px" }} aria-label={`Error de ${e.nombre}`} onClick={() => act((g, n) => marcarError(g, e.id, n))}>✘</button>
                  </div>
                );
              })}
            </div>
          )}
          {m.tipo === "validacion" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={b(C.ok)} onClick={() => act((g, n) => validar(g, true, n))}>✔ Siguió la letra +{game.cfg.puntosLetra}</button>
              <button style={b("rgba(251,113,133,0.25)", C.bad)} onClick={() => act((g, n) => validar(g, false, n))}>✘ No pudo</button>
            </div>
          )}
          {m.tipo === "decada" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {game.decadas.map((d) => (
                <button key={d} style={{ ...b(C.yellow, C.bg), flex: "1 1 90px" }} onClick={() => act((g, n) => elegirDecada(g, d, c, n))}>{d}s</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button style={b("rgba(255,255,255,0.14)", C.ink)} onClick={() => act((g) => pasar(g))}>⏭ Pasar canción</button>
            <button style={b(C.yellow, C.bg)} onClick={() => act((g, n) => revelar(g, n))}>👁 Ver respuesta</button>
          </div>
          {!tv && <button style={ui.text} onClick={() => { if (window.confirm("¿Finalizar la partida ahora?")) act((g) => finalizar(g)); }}>⏹ Finalizar partida</button>}
        </>
      )}
      {reveal && (
        <>
          {!tv && <button style={{ ...ui.secondary, fontSize: 16, padding: "12px 10px" }} onClick={() => abrir(enlace(c, plat).url)}>🔁 Reproducir de nuevo</button>}
          <button style={{ ...ui.primary, minHeight: alto }} onClick={() => act((g) => siguiente(g))}>{ultima ? "🏆 VER RESULTADOS" : "SIGUIENTE CANCIÓN →"}</button>
        </>
      )}
    </div>
  );
}
