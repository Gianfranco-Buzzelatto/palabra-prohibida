// Temporizador basado en marcas de tiempo: sobrevive a recargas y se puede sincronizar
// con otra ventana enviando solo { running, endsAt, remainingMs }.
export const mkTimer = (ms) => ({ running: false, endsAt: null, remainingMs: ms, totalMs: ms });

export const startTimer = (t, now) =>
  t.running ? t : { ...t, running: true, endsAt: now + t.remainingMs };

export const pauseTimer = (t, now) =>
  t.running ? { ...t, running: false, endsAt: null, remainingMs: Math.max(0, t.endsAt - now) } : t;

export const remainingMs = (t, now) =>
  t.running ? Math.max(0, t.endsAt - now) : t.remainingMs;

export const elapsedMs = (t, now) => t.totalMs - remainingMs(t, now);

// Fija el tiempo restante manteniendo el estado de marcha.
export const setRemaining = (t, ms, now) => {
  const remaining = Math.max(0, Math.min(t.totalMs, ms));
  return t.running ? { ...t, endsAt: now + remaining, remainingMs: remaining } : { ...t, remainingMs: remaining };
};

export const fmtClock = (ms) => {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
