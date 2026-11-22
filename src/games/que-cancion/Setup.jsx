import { C, ui } from "../../shared/ui.js";
import { Stepper, Pills, Section } from "../../shared/components.jsx";
import { DIFICULTADES } from "../quien-soy/logic.js";
import { MODALIDADES, CATEGORIAS, decadasDisponibles, filterPool, teamColor } from "./logic.js";
import CANCIONES from "./data/canciones.json";

const DECADAS = decadasDisponibles(CANCIONES);

export function Setup({ config, setConfig, onStart }) {
  const pool = filterPool(CANCIONES, config);
  const m = MODALIDADES[config.modalidad];
  const setEquipo = (i, patch) => setConfig({ equipos: config.equipos.map((e, k) => (k === i ? { ...e, ...patch } : e)) });
  const cantidadEquipos = (n) => {
    const eq = config.equipos;
    setConfig({ equipos: n < eq.length ? eq.slice(0, n) : [...eq, ...Array.from({ length: n - eq.length }, (_, k) => ({ id: `e${eq.length + k + 1}`, nombre: `Equipo ${eq.length + k + 1}`, integrantes: 5, nombres: "" }))] });
  };
  const setPuntos = (nivel, campo, v) => setConfig({ puntos: { ...config.puntos, [nivel]: { ...config.puntos[nivel], [campo]: v } } });
  const rondas = Math.min(config.rondas, Math.max(pool.length, 0));

  const problemas = [];
  if (config.categorias.length === 0) problemas.push("Elegí al menos una categoría.");
  if (config.equipos.some((e) => !e.nombre.trim())) problemas.push("Todos los equipos necesitan un nombre.");
  if (new Set(config.equipos.map((e) => e.nombre.trim().toLowerCase())).size < config.equipos.length) problemas.push("Los nombres de equipo deben ser distintos.");
  if (config.modalidad === "duelo" && config.equipos.length < 2) problemas.push("El duelo necesita al menos 2 equipos.");
  if (pool.length === 0) problemas.push("Ninguna canción cumple los filtros elegidos.");

  return (
    <div style={ui.col} className="screen-fit setup-fit">
      <div className="screen-body" style={{ justifyContent: "flex-start", alignItems: "stretch", gap: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={ui.eyebrow}>JUEGO 3</div>
          <h1 style={ui.title}>¿QUÉ CANCIÓN ES?</h1>
          <div style={ui.subtitle}>La app no reproduce audio: el conductor pone el tema en Spotify o YouTube y la app lleva tiempos, equipos y puntos.</div>
        </div>
        <Section title="Modalidad">
          <Pills small value={config.modalidad} onChange={(v) => setConfig({ modalidad: v })} options={Object.entries(MODALIDADES).map(([value, x]) => ({ value, label: x.label }))} />
          <div style={{ color: C.soft, fontSize: 14, marginTop: 8, textAlign: "left" }}>{m.desc}</div>
        </Section>
        <Section title="Equipos">
          <Stepper label="Cantidad de equipos" value={config.equipos.length} onChange={cantidadEquipos} min={2} max={6} />
          {config.equipos.map((e, i) => (
            <div key={e.id} style={{ borderLeft: `5px solid ${teamColor(i)}`, paddingLeft: 10, marginTop: 8, textAlign: "left" }}>
              <input aria-label={`Nombre del equipo ${i + 1}`} style={ui.input} value={e.nombre} onChange={(ev) => setEquipo(i, { nombre: ev.target.value })} />
              <Stepper label="Integrantes" value={e.integrantes} onChange={(v) => setEquipo(i, { integrantes: v })} min={1} max={20} />
              <input aria-label={`Integrantes del equipo ${i + 1} (opcional)`} placeholder="Nombres de los integrantes (opcional, separados por coma)" style={{ ...ui.input, fontSize: 15 }} value={e.nombres} onChange={(ev) => setEquipo(i, { nombres: ev.target.value })} />
            </div>
          ))}
        </Section>
        <Section title="Partida">
          <Stepper label="Canciones (rondas)" hint={pool.length ? `Hay ${pool.length} canciones con estos filtros` : undefined} value={config.rondas} onChange={(v) => setConfig({ rondas: v })} min={1} max={60} />
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, padding: "8px 0", textAlign: "left" }}>
            <input type="checkbox" style={{ width: 24, height: 24 }} checked={config.bloqueo} onChange={(e) => setConfig({ bloqueo: e.target.checked })} />
            Un equipo que se equivoca queda bloqueado hasta el siguiente nivel
          </label>
        </Section>
        <Section title="Categorías">
          <Pills multi small value={config.categorias} onChange={(v) => setConfig({ categorias: v })} options={CATEGORIAS} />
          <div style={{ ...ui.label, marginTop: 12, fontSize: 18 }}>Década (opcional)</div>
          <Pills multi small value={config.decadas} onChange={(v) => setConfig({ decadas: v })} options={DECADAS.map((d) => ({ value: d, label: `${d}s` }))} />
          <div style={{ color: C.dim, fontSize: 13, marginTop: 6, textAlign: "left" }}>{config.decadas.length ? "Solo canciones de las décadas elegidas (se combina con las categorías)." : "Sin selección: todas las décadas."}</div>
        </Section>
        <Section title="Dificultad">
          <Pills value={config.dificultad} onChange={(v) => setConfig({ dificultad: v })} options={DIFICULTADES} />
        </Section>
        <Section title="Puntos">
          {config.modalidad === "clasica" ? (
            [1, 2, 3].map((n) => (
              <div key={n} style={{ marginBottom: 4 }}>
                <div style={{ color: C.yellow, fontWeight: 800, textAlign: "left" }}>Nivel {n} {n === 1 ? "(0:00–0:30)" : n === 2 ? "(0:30–1:00)" : "(1:00–1:30)"}</div>
                <Stepper label="Título" value={config.puntos[n].titulo} onChange={(v) => setPuntos(n, "titulo", v)} min={0} max={100} />
                <Stepper label="Artista" value={config.puntos[n].artista} onChange={(v) => setPuntos(n, "artista", v)} min={0} max={100} />
              </div>
            ))
          ) : config.modalidad === "letra" ? (
            <Stepper label="Puntos por continuar la letra" value={config.puntosLetra} onChange={(v) => setConfig({ puntosLetra: v })} min={1} max={100} />
          ) : config.modalidad === "decada" ? (
            <Stepper label="Puntos por acertar la década" value={config.puntosDecada} onChange={(v) => setConfig({ puntosDecada: v })} min={1} max={100} />
          ) : (
            <>
              <Stepper label="Título" value={config.puntosPlano.titulo} onChange={(v) => setConfig({ puntosPlano: { ...config.puntosPlano, titulo: v } })} min={0} max={100} />
              <Stepper label="Artista" value={config.puntosPlano.artista} onChange={(v) => setConfig({ puntosPlano: { ...config.puntosPlano, artista: v } })} min={0} max={100} />
            </>
          )}
        </Section>
        <div style={{ color: pool.length ? C.ok : C.bad, fontWeight: 800, margin: "4px 0" }}>{pool.length} canciones disponibles · se jugarán {rondas}</div>
        {problemas.map((p) => <div key={p} style={{ color: C.bad, fontSize: 14 }}>⚠️ {p}</div>)}
      </div>
      <button style={{ ...ui.primary, opacity: problemas.length ? 0.45 : 1 }} disabled={problemas.length > 0} onClick={onStart}>▶ EMPEZAR PARTIDA</button>
    </div>
  );
}
