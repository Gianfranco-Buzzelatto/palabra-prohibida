// Lógica pura de ¿Qué canción es?. Sin React ni localStorage: testeable con node --test.
import { orderByDifficulty } from "../../shared/random.js";
import { mkTimer, startTimer, pauseTimer, remainingMs, elapsedMs, setRemaining } from "../../shared/timer.js";
import { TEAM_COLORS } from "../../shared/ui.js";

export const NIVEL_MS = 30000;
export const EXTRA_LETRA_MS = 75000; // último tramo del nivel 3: se revela una letra más

export const MODALIDADES = {
  clasica: { label: "A · Clásica", desc: "3 niveles en 90 s: intro, coro y título con letras ocultas.", tiempoMs: 90000, niveles: 3, tipo: "respuesta" },
  letra: { label: "B · Seguí la letra", desc: "El conductor corta la canción y el equipo sigue cantando. Valida el conductor.", tiempoMs: 0, niveles: 1, tipo: "validacion" },
  intro: { label: "C · Intro misteriosa", desc: "Solo la introducción instrumental, 30 s. Valida el conductor.", tiempoMs: 30000, niveles: 1, tipo: "respuesta" },
  decada: { label: "D · ¿De qué década es?", desc: "Botones de década con validación automática.", tiempoMs: 0, niveles: 1, tipo: "decada" },
  duelo: { label: "E · Duelo musical", desc: "Dos equipos por ronda, 60 s: gana el primero que acierta.", tiempoMs: 60000, niveles: 1, tipo: "respuesta", duelo: true },
};

export const CATEGORIAS = [
  { value: "rock", label: "Rock nacional" }, { value: "cumbia", label: "Cumbia" }, { value: "cuarteto", label: "Cuarteto" },
  { value: "popular", label: "Música popular argentina" }, { value: "pop", label: "Pop internacional" },
  { value: "urbano", label: "Reggaetón y urbano" }, { value: "hits", label: "Hits 2000/2010" },
  { value: "pelicula", label: "Películas" }, { value: "novela", label: "Novelas" },
  { value: "tv", label: "Aperturas de TV" }, { value: "publicidad", label: "Publicidades" },
];

export const defaultConfig = () => ({
  modalidad: "clasica",
  equipos: Array.from({ length: 4 }, (_, i) => ({ id: `e${i + 1}`, nombre: `Equipo ${i + 1}`, integrantes: 5, nombres: "" })),
  rondas: 10,
  categorias: CATEGORIAS.map((c) => c.value),
  decadas: [],
  dificultad: "todas",
  puntos: { 1: { titulo: 10, artista: 5 }, 2: { titulo: 6, artista: 3 }, 3: { titulo: 3, artista: 2 } },
  puntosPlano: { titulo: 10, artista: 5 },
  puntosLetra: 10,
  puntosDecada: 10,
  bloqueo: true,
});

export const decadasDisponibles = (canciones) =>
  [...new Set(canciones.map((c) => c.decada).filter((d) => d != null))].sort((a, b) => a - b);

export function filterPool(canciones, cfg) {
  return canciones.filter(
    (c) =>
      cfg.categorias.includes(c.categoriaClave) &&
      (cfg.decadas.length === 0 || cfg.decadas.includes(c.decada)) &&
      (cfg.modalidad !== "decada" || c.decada != null)
  );
}

export const teamColor = (i) => TEAM_COLORS[i % TEAM_COLORS.length];

// ---------- Niveles ----------
export function nivelDeElapsed(ms, niveles = 3) {
  if (niveles <= 1) return 1;
  return Math.min(niveles, Math.floor(Math.max(0, ms) / NIVEL_MS) + 1);
}
export const modo = (g) => MODALIDADES[g.cfg.modalidad];
export const nivelActual = (g, now) => (modo(g).niveles > 1 ? nivelDeElapsed(elapsedMs(g.timer, now), 3) : 1);
export const extraActual = (g, now) =>
  g.cfg.modalidad === "clasica" && elapsedMs(g.timer, now) >= EXTRA_LETRA_MS ? 1 : 0;

// ---------- Máscara del título ----------
const isLetter = (c) => /\p{L}/u.test(c);
const isWordChar = (c) => isLetter(c) || /\p{N}/u.test(c) || c === "'" || c === "’";

// Siempre visible la 1.ª letra de cada palabra; después se alternan letras ocultas (posiciones 2.ª, 4.ª...).
// "De música ligera" -> "D_ m_s_c_ l_g_r_". `extra` revela esa cantidad de letras ocultas más
// (empezando por las palabras más largas) para el último tramo.
export function maskTitle(titulo, extra = 0) {
  const chars = [...titulo];
  const words = []; // { start, end } sobre índices de chars
  let cur = null;
  chars.forEach((c, i) => {
    if (isWordChar(c)) {
      if (!cur) { cur = { start: i, end: i }; words.push(cur); }
      cur.end = i;
    } else cur = null;
  });
  const hidden = []; // { i, wordLen }
  for (const w of words) {
    const letterIdx = [];
    for (let i = w.start; i <= w.end; i++) if (isLetter(chars[i])) letterIdx.push(i);
    letterIdx.forEach((i, k) => { if (k % 2 === 1) hidden.push({ i, wordLen: letterIdx.length }); });
  }
  const reveal = new Set(
    [...hidden].sort((a, b) => b.wordLen - a.wordLen || a.i - b.i).slice(0, Math.max(0, extra)).map((h) => h.i)
  );
  const hide = new Set(hidden.map((h) => h.i).filter((i) => !reveal.has(i)));
  return chars.map((c, i) => (hide.has(i) ? "_" : c)).join("");
}

// ---------- Partida ----------
export const activos = (g) => {
  const n = g.cfg.equipos.length;
  const ids = g.cfg.equipos.map((e) => e.id);
  const m = modo(g);
  if (m.duelo) return n === 2 ? ids : [ids[(2 * g.idx) % n], ids[(2 * g.idx + 1) % n]];
  if (m.tipo === "validacion" || m.tipo === "decada") return [ids[g.idx % n]];
  return ids;
};

const resetRonda = (g, cursor) => ({
  ...g, phase: "ronda", cursor, songId: g.queue[cursor - 1],
  timer: mkTimer(modo(g).tiempoMs), acierto: { titulo: null, artista: null }, bloqueos: {},
  decadaElegida: null, resultado: null,
});

export function newGame(cfg, canciones, rng = Math.random, excludeIds = []) {
  const ex = new Set(excludeIds);
  const pool = filterPool(canciones, cfg);
  const fresh = orderByDifficulty(pool.filter((c) => !ex.has(c.id)), cfg.dificultad, rng).order;
  const used = orderByDifficulty(pool.filter((c) => ex.has(c.id)), cfg.dificultad, rng).order;
  const queue = [...fresh, ...used].map((c) => c.id);
  const base = {
    v: 1, cfg: JSON.parse(JSON.stringify(cfg)), queue, idx: 0, rondas: Math.min(cfg.rondas, queue.length),
    puntos: Object.fromEntries(cfg.equipos.map((e) => [e.id, 0])),
    stats: Object.fromEntries(cfg.equipos.map((e) => [e.id, { acertadas: 0, errores: 0 }])),
    historial: [], plataforma: "spotify", decadas: decadasDisponibles(canciones),
  };
  if (!queue.length) return { ...base, phase: "final", cursor: 0, songId: null, timer: mkTimer(0), acierto: {}, bloqueos: {}, decadaElegida: null, resultado: null };
  return resetRonda(base, 1);
}

export function puntosDe(cfg, nivel) {
  if (cfg.modalidad === "clasica") return cfg.puntos[nivel];
  if (cfg.modalidad === "letra") return { titulo: cfg.puntosLetra, artista: 0 };
  if (cfg.modalidad === "decada") return { titulo: cfg.puntosDecada, artista: 0 };
  return cfg.puntosPlano;
}

export const estaBloqueado = (g, teamId, nivel) => g.cfg.bloqueo && g.bloqueos[teamId] === nivel;

export function iniciar(g, now) {
  if (g.phase !== "ronda" || modo(g).tiempoMs === 0) return g;
  return { ...g, timer: startTimer(g.timer, now) };
}
export const pausar = (g, now) => (g.phase === "ronda" ? { ...g, timer: pauseTimer(g.timer, now) } : g);
export const rondaIniciada = (g) => g.timer.running || g.timer.remainingMs < g.timer.totalMs;

// El conductor adelanta el nivel: el reloj salta al comienzo del siguiente tramo.
export function adelantarNivel(g, now) {
  if (g.phase !== "ronda" || modo(g).niveles <= 1) return g;
  const nivel = nivelActual(g, now);
  if (nivel >= 3) return g;
  return { ...g, timer: setRemaining(g.timer, g.timer.totalMs - nivel * NIVEL_MS, now) };
}

const sumar = (g, teamId, pts, tipo) => ({
  ...g, puntos: { ...g.puntos, [teamId]: (g.puntos[teamId] || 0) + pts },
  acierto: { ...g.acierto, [tipo]: teamId },
});

export function revelar(g, now, motivo = "manual") {
  if (g.phase !== "ronda") return g;
  const { titulo, artista } = g.acierto;
  const equipos = [...new Set([titulo, artista].filter(Boolean))];
  const stats = { ...g.stats };
  for (const id of equipos) stats[id] = { ...stats[id], acertadas: stats[id].acertadas + 1 };
  const tipo = equipos.length ? "acierto" : motivo === "tiempo" ? "tiempo" : "sin-puntos";
  return {
    ...g, phase: "reveal", stats, timer: pauseTimer(g.timer, now),
    resultado: { tipo, equipos, titulo, artista },
    historial: [...g.historial, { songId: g.songId, tipo, equipos }],
  };
}

export function marcar(g, teamId, que, now) {
  if (g.phase !== "ronda" || modo(g).tipo !== "respuesta") return g;
  const nivel = nivelActual(g, now);
  if (!activos(g).includes(teamId) || estaBloqueado(g, teamId, nivel)) return g;
  const pts = puntosDe(g.cfg, nivel);
  let n = g;
  if ((que === "titulo" || que === "ambos") && !n.acierto.titulo) n = sumar(n, teamId, pts.titulo, "titulo");
  if ((que === "artista" || que === "ambos") && !n.acierto.artista) n = sumar(n, teamId, pts.artista, "artista");
  if (n === g) return g;
  return n.acierto.titulo && n.acierto.artista ? revelar(n, now) : n;
}

export function marcarError(g, teamId, now) {
  if (g.phase !== "ronda" || modo(g).tipo !== "respuesta") return g;
  const nivel = nivelActual(g, now);
  if (!activos(g).includes(teamId) || estaBloqueado(g, teamId, nivel)) return g;
  return {
    ...g, bloqueos: g.cfg.bloqueo ? { ...g.bloqueos, [teamId]: nivel } : g.bloqueos,
    stats: { ...g.stats, [teamId]: { ...g.stats[teamId], errores: g.stats[teamId].errores + 1 } },
  };
}

// Modalidad B: valida el conductor.
export function validar(g, ok, now) {
  if (g.phase !== "ronda" || modo(g).tipo !== "validacion") return g;
  const [team] = activos(g);
  if (ok) return revelar(sumar(g, team, g.cfg.puntosLetra, "titulo"), now);
  const m = { ...g, stats: { ...g.stats, [team]: { ...g.stats[team], errores: g.stats[team].errores + 1 } } };
  return revelar(m, now, "fallo");
}

// Modalidad D: validación automática contra el campo `decada`.
export function elegirDecada(g, decada, cancion, now) {
  if (g.phase !== "ronda" || modo(g).tipo !== "decada") return g;
  const [team] = activos(g);
  const ok = decada === cancion.decada;
  const base = { ...g, decadaElegida: decada };
  if (ok) return revelar(sumar(base, team, g.cfg.puntosDecada, "titulo"), now);
  const m = { ...base, stats: { ...base.stats, [team]: { ...base.stats[team], errores: base.stats[team].errores + 1 } } };
  return revelar(m, now, "fallo");
}

export function tick(g, now) {
  if (g.phase === "ronda" && modo(g).tiempoMs > 0 && g.timer.running && remainingMs(g.timer, now) <= 0) return revelar(g, now, "tiempo");
  return g;
}

// Saltea la canción sin consumir ronda.
export function pasar(g) {
  if (g.phase !== "ronda") return g;
  if (g.cursor >= g.queue.length) return { ...g, phase: "final" };
  return { ...resetRonda(g, g.cursor + 1), historial: [...g.historial, { songId: g.songId, tipo: "saltada", equipos: [] }] };
}

export function siguiente(g) {
  if (g.phase !== "reveal") return g;
  const idx = g.idx + 1;
  if (idx >= g.rondas || g.cursor >= g.queue.length) return { ...g, idx, phase: "final" };
  return resetRonda({ ...g, idx }, g.cursor + 1);
}
export const finalizar = (g) => ({ ...g, phase: "final" });
export const setPlataforma = (g, plataforma) => ({ ...g, plataforma });

export function ranking(g) {
  return g.cfg.equipos
    .map((e, i) => ({
      id: e.id, nombre: e.nombre, color: teamColor(i), puntos: g.puntos[e.id] || 0,
      acertadas: g.stats[e.id].acertadas, errores: g.stats[e.id].errores,
      detalle: `${g.stats[e.id].acertadas} acertadas · ${g.stats[e.id].errores} errores${e.nombres ? ` · ${e.nombres}` : ""}`,
      orden: i,
    }))
    .sort((a, b) => b.puntos - a.puntos || b.acertadas - a.acertadas || a.orden - b.orden);
}

// ---------- Enlaces externos ----------
const PLAT = { spotify: "Spotify", youtube: "YouTube" };
export const platNombre = (p) => PLAT[p];
export function enlace(c, plat) {
  const e = c.enlaces?.[plat];
  if (e?.url && e.verificado) return { url: e.url, texto: `Abrir en ${PLAT[plat]}`, directo: true };
  const q = encodeURIComponent(`${c.titulo} ${c.artista}`);
  const url = plat === "spotify" ? `https://open.spotify.com/search/${q}` : `https://www.youtube.com/results?search_query=${q}`;
  return { url, texto: `Buscar en ${PLAT[plat]}`, directo: false };
}

// ---------- Escena PÚBLICA ----------
// Solo revela título/artista en la fase "reveal". Antes, a lo sumo la máscara del nivel 3.
export function escena(g, byId, nivel, extra) {
  const m = modo(g);
  const c = g.songId ? byId[g.songId] : null;
  const ids = activos(g);
  const reveal = g.phase === "reveal";
  const nombre = (id) => g.cfg.equipos.find((e) => e.id === id)?.nombre;
  return {
    game: "que-cancion", fase: g.phase, modalidad: g.cfg.modalidad, modalidadLabel: m.label,
    ronda: Math.min(g.idx + 1, g.rondas), rondas: g.rondas, nivel, niveles: m.niveles,
    puntosNivel: puntosDe(g.cfg, nivel),
    timer: m.tiempoMs > 0 && g.phase !== "final" ? g.timer : null,
    mascara: c && !reveal && g.cfg.modalidad === "clasica" && nivel === 3 ? maskTitle(c.titulo, extra) : null,
    categoria: c ? c.categoria : null,
    decadaOpciones: g.cfg.modalidad === "decada" ? g.decadas : null,
    activos: ids, activosNombres: ids.map(nombre),
    bloqueados: g.cfg.equipos.filter((e) => estaBloqueado(g, e.id, nivel)).map((e) => e.id),
    equipos: g.cfg.equipos.map((e, i) => ({ id: e.id, nombre: e.nombre, color: teamColor(i), puntos: g.puntos[e.id] || 0 })),
    revelado: reveal && c ? { titulo: c.titulo, artista: c.artista, decada: c.decada } : null,
    resultado: reveal && g.resultado ? { tipo: g.resultado.tipo, equipos: g.resultado.equipos.map(nombre) } : null,
    decadaElegida: reveal ? g.decadaElegida : null,
    ranking: g.phase === "final" ? ranking(g) : null,
  };
}
