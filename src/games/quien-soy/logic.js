// Lógica pura de ¿Quién soy?. Sin React ni localStorage: todo testeable con node --test.
import { orderByDifficulty } from "../../shared/random.js";
import { mkTimer, startTimer, pauseTimer, remainingMs } from "../../shared/timer.js";

export const GENERACIONES = ["18-30", "31-45", "46-60", "60+"];
export const UMBRAL_POPULARIDAD = 3; // 0-5; un personaje "lo conoce" la generación si llega a 3
export const CATEGORIAS = [
  "Fútbol y deportes", "TV y entretenimiento", "Música argentina", "Famosos internacionales", "Personajes ficticios",
];
export const CAT_COLOR = {
  "Fútbol y deportes": "#34D399", "TV y entretenimiento": "#FF3D7F", "Música argentina": "#38BDF8",
  "Famosos internacionales": "#A78BFA", "Personajes ficticios": "#F2B705",
};
export const DIFICULTADES = [
  { value: "todas", label: "Todas" }, { value: "facil", label: "Fácil" },
  { value: "media", label: "Media" }, { value: "dificil", label: "Difícil" },
];

export const defaultConfig = () => ({
  jugadores: Array.from({ length: 20 }, (_, i) => `Jugador ${i + 1}`),
  rondas: null, // null = una ronda por jugador
  tiempoSeg: 90,
  puntos: 10,
  penalizacion: 0,
  categorias: [...CATEGORIAS],
  dificultad: "media",
  generaciones: [], // [] = todas las generaciones mezcladas
  soloConFoto: false,
});

export const rondasEfectivas = (cfg) => cfg.rondas ?? cfg.jugadores.length;

export function filterPool(personajes, cfg) {
  const gens = cfg.generaciones || [];
  return personajes.filter(
    (p) =>
      cfg.categorias.includes(p.categoria) &&
      (!cfg.soloConFoto || p.foto?.estado === "ok") &&
      (gens.length === 0 || gens.every((g) => (p.popularidad?.[g] ?? 0) >= UMBRAL_POPULARIDAD))
  );
}

// Cola completa de personajes (sin repetir). Los ya usados en la partida anterior van al final.
export function buildQueue(pool, cfg, rng = Math.random, excludeIds = []) {
  const ex = new Set(excludeIds);
  const fresh = pool.filter((p) => !ex.has(p.id));
  const used = pool.filter((p) => ex.has(p.id));
  const a = orderByDifficulty(fresh, cfg.dificultad, rng).order;
  const b = orderByDifficulty(used, cfg.dificultad, rng).order;
  return [...a, ...b].map((p) => p.id);
}

export function newGame(cfg, personajes, rng = Math.random, excludeIds = []) {
  const queue = buildQueue(filterPool(personajes, cfg), cfg, rng, excludeIds);
  return {
    phase: queue.length ? "turno" : "final",
    cfg: JSON.parse(JSON.stringify(cfg)),
    queue, cursor: 0, turno: 0, rondas: rondasEfectivas(cfg),
    jugadores: cfg.jugadores.map((nombre) => ({ nombre, puntos: 0, aciertos: 0, pasados: 0, fallados: 0 })),
    actual: null, rondaPases: 0, resultado: null,
    timer: mkTimer(cfg.tiempoSeg * 1000),
  };
}

export const jugadorActual = (g) => g.jugadores[g.turno % g.jugadores.length];

const patchPlayer = (g, fn) => ({
  ...g,
  jugadores: g.jugadores.map((j, i) => (i === g.turno % g.jugadores.length ? fn(j) : j)),
});

export function iniciarRonda(g, now) {
  if (g.phase !== "turno") return g;
  if (g.cursor >= g.queue.length) return { ...g, phase: "final" };
  return {
    ...g, phase: "jugando", actual: g.queue[g.cursor], cursor: g.cursor + 1, rondaPases: 0, resultado: null,
    timer: startTimer(mkTimer(g.cfg.tiempoSeg * 1000), now),
  };
}

export function correcto(g, now) {
  if (g.phase !== "jugando" && g.phase !== "asignar") return g;
  const sumado = patchPlayer(g, (j) => ({ ...j, puntos: j.puntos + g.cfg.puntos, aciertos: j.aciertos + 1 }));
  return { ...sumado, phase: "revelado", resultado: "acierto", timer: pauseTimer(g.timer, now) };
}

export function terminarRonda(g, now, motivo = "fin") {
  if (g.phase !== "jugando" && g.phase !== "asignar") return g;
  const m = patchPlayer(g, (j) => ({ ...j, fallados: j.fallados + 1 }));
  return { ...m, phase: "revelado", resultado: motivo, timer: pauseTimer(g.timer, now) };
}

export function pasar(g, now) {
  if (g.phase !== "jugando") return g;
  const pen = patchPlayer(g, (j) => ({ ...j, pasados: j.pasados + 1, puntos: j.puntos - g.cfg.penalizacion }));
  if (pen.cursor >= pen.queue.length) return terminarRonda({ ...pen, phase: "jugando" }, now, "sin-personajes");
  return { ...pen, actual: pen.queue[pen.cursor], cursor: pen.cursor + 1, rondaPases: pen.rondaPases + 1 };
}

// Revelar a mano: pausa el reloj y deja al conductor asignar los puntos.
export function revelar(g, now) {
  if (g.phase !== "jugando") return g;
  return { ...g, phase: "asignar", timer: pauseTimer(g.timer, now) };
}

export function asignar(g, acerto, now) {
  if (g.phase !== "asignar") return g;
  return acerto ? correcto(g, now) : terminarRonda(g, now, "no-acerto");
}

export function tiempoAgotado(g, now) {
  if (g.phase === "jugando" && remainingMs(g.timer, now) <= 0) return terminarRonda(g, now, "tiempo");
  return g;
}

export function siguiente(g) {
  if (g.phase !== "revelado") return g;
  const turno = g.turno + 1;
  if (turno >= g.rondas || g.cursor >= g.queue.length) return { ...g, turno, phase: "final", actual: null };
  return { ...g, turno, phase: "turno", actual: null, resultado: null, rondaPases: 0, timer: mkTimer(g.cfg.tiempoSeg * 1000) };
}

export function finalizarPartida(g) {
  return { ...g, phase: "final" };
}

export function ranking(g) {
  return g.jugadores
    .map((j, i) => ({ ...j, id: i }))
    .sort((a, b) => b.puntos - a.puntos || b.aciertos - a.aciertos || a.id - b.id);
}

export function iniciales(nombre) {
  const stop = new Set(["de", "del", "la", "el", "los", "las", "y"]);
  const parts = nombre.split(/\s+/).filter((w) => /^\p{L}/u.test(w) && !stop.has(w.toLowerCase()));
  return (parts.slice(0, 2).map((w) => w[0]).join("") || nombre[0] || "?").toUpperCase();
}

// Escena PÚBLICA: nunca incluye nombre/descripcion hasta que el conductor revela.
export function escena(g, byId) {
  const p = g.actual ? byId[g.actual] : null;
  const revelado = g.phase === "asignar" || g.phase === "revelado";
  return {
    game: "quien-soy", fase: g.phase, ronda: Math.min(g.turno + 1, g.rondas), rondas: g.rondas,
    jugador: g.phase === "final" ? null : jugadorActual(g).nombre,
    timer: g.timer, resultado: g.resultado, puntos: g.cfg.puntos,
    personaje: p && {
      foto: p.foto?.estado === "ok" && p.foto.archivo ? p.foto.archivo : null,
      iniciales: iniciales(p.nombre), color: CAT_COLOR[p.categoria] || "#F2B705",
      categoria: p.categoria, pista: p.foto?.estado === "ok" ? null : p.actividad,
    },
    revelado: revelado && p ? { nombre: p.nombre, descripcion: p.descripcion } : null,
    sinFoto: !!p && !(p.foto?.estado === "ok" && p.foto.archivo),
    ranking: g.phase === "final" ? ranking(g).map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, detalle: `${j.aciertos} aciertos · ${j.pasados} pasados · ${j.fallados} fallados` })) : null,
  };
}
