import { useState } from "react";
import { C, ui } from "../../shared/ui.js";
import { Stepper, Pills, Section } from "../../shared/components.jsx";
import { CATEGORIAS, DIFICULTADES, GENERACIONES, filterPool, rondasEfectivas, UMBRAL_POPULARIDAD } from "./logic.js";
import PERSONAJES from "./data/personajes.json";

const nombresPorDefecto = (n) => Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`);

export function Setup({ config, setConfig, onStart }) {
  const [texto, setTexto] = useState(config.jugadores.join("\n"));
  const pool = filterPool(PERSONAJES, config);
  const rondas = rondasEfectivas(config);
  const conFoto = PERSONAJES.filter((p) => p.foto.estado === "ok").length;
  const setNombres = (txt) => {
    setTexto(txt);
    setConfig({ jugadores: txt.split("\n").map((s) => s.trim()).filter(Boolean) });
  };
  const cambiarCantidad = (n) => {
    const actuales = config.jugadores;
    const lista = n < actuales.length ? actuales.slice(0, n) : [...actuales, ...nombresPorDefecto(n).slice(actuales.length)];
    setTexto(lista.join("\n"));
    setConfig({ jugadores: lista });
  };
  const problemas = [];
  if (config.jugadores.length < 2) problemas.push("Cargá al menos 2 jugadores.");
  if (config.categorias.length === 0) problemas.push("Elegí al menos una categoría.");
  if (pool.length === 0) problemas.push(config.soloConFoto && conFoto === 0 ? "No hay fotos cargadas todavía: desactivá “solo personajes con foto” o corré npm run fotos." : "Ningún personaje cumple los filtros elegidos.");
  const aviso = pool.length > 0 && pool.length < rondas ? `Hay ${pool.length} personajes para ${rondas} rondas: la partida terminará antes.` : null;

  return (
    <div style={ui.col} className="screen-fit setup-fit">
      <div className="screen-body" style={{ justifyContent: "flex-start", alignItems: "stretch", gap: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={ui.eyebrow}>JUEGO 2</div>
          <h1 style={ui.title}>¿QUIÉN SOY?</h1>
          <div style={ui.subtitle}>Uno de espaldas, el resto ve la foto y responde solo SÍ o NO.</div>
        </div>
        <Section title="Jugadores">
          <Stepper label="Cantidad de jugadores" value={config.jugadores.length} onChange={cambiarCantidad} min={2} max={40} />
          <textarea aria-label="Nombres de los jugadores, uno por línea" style={{ ...ui.input, minHeight: 120, resize: "vertical", marginTop: 6 }} value={texto} onChange={(e) => setNombres(e.target.value)} />
          <div style={{ color: C.dim, fontSize: 13, marginTop: 4, textAlign: "left" }}>Un nombre por línea. Se turnan en ese orden.</div>
        </Section>
        <Section title="Reglas">
          <Stepper label="Rondas" hint="Por defecto, una por jugador" value={rondas} onChange={(v) => setConfig({ rondas: v === config.jugadores.length ? null : v })} min={1} max={80} />
          <Stepper label="Tiempo por ronda" value={config.tiempoSeg} onChange={(v) => setConfig({ tiempoSeg: v })} min={15} max={300} step={15} suffix="s" />
          <Stepper label="Puntos por acierto" value={config.puntos} onChange={(v) => setConfig({ puntos: v })} min={1} max={100} />
          <Stepper label="Penalización por pasar" hint="0 = sin penalización" value={config.penalizacion} onChange={(v) => setConfig({ penalizacion: v })} min={0} max={50} />
        </Section>
        <Section title="Categorías">
          <Pills multi small value={config.categorias} onChange={(v) => setConfig({ categorias: v })} options={CATEGORIAS.map((c) => ({ value: c, label: c }))} />
        </Section>
        <Section title="Dificultad">
          <Pills value={config.dificultad} onChange={(v) => setConfig({ dificultad: v })} options={DIFICULTADES} />
          <div style={{ color: C.dim, fontSize: 13, marginTop: 6, textAlign: "left" }}>Fácil: solo fáciles. Media: sobre todo medias. Difícil: medias y difíciles. Se sortea en ese orden.</div>
        </Section>
        <Section title="Generación del público">
          <Pills
            small multi value={config.generaciones} onChange={(v) => setConfig({ generaciones: v })}
            options={GENERACIONES.map((g) => ({ value: g, label: g }))}
          />
          <div style={{ color: C.dim, fontSize: 13, marginTop: 6, textAlign: "left" }}>
            {config.generaciones.length === 0 ? "Sin selección: todas las generaciones mezcladas." : `Solo personajes que conocen todas las generaciones elegidas (popularidad ≥ ${UMBRAL_POPULARIDAD}/5, estimada).`}
          </div>
        </Section>
        <Section title="Fotos">
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, textAlign: "left" }}>
            <input type="checkbox" style={{ width: 24, height: 24 }} checked={config.soloConFoto} onChange={(e) => setConfig({ soloConFoto: e.target.checked })} />
            Solo personajes con foto ({conFoto} de {PERSONAJES.length} tienen foto)
          </label>
          {conFoto === 0 && <div style={{ color: C.dim, fontSize: 13, marginTop: 6, textAlign: "left" }}>Todas las fotos están pendientes: se usan avatares con iniciales.</div>}
        </Section>
        <div style={{ color: pool.length ? C.ok : C.bad, fontWeight: 800, margin: "4px 0" }}>{pool.length} personajes disponibles con estos filtros</div>
        {aviso && <div style={{ color: C.yellow, fontSize: 14, marginBottom: 4 }}>⚠️ {aviso}</div>}
        {problemas.map((p) => <div key={p} style={{ color: C.bad, fontSize: 14 }}>⚠️ {p}</div>)}
      </div>
      <button style={{ ...ui.primary, opacity: problemas.length ? 0.45 : 1 }} disabled={problemas.length > 0} onClick={onStart}>▶ EMPEZAR PARTIDA</button>
    </div>
  );
}
