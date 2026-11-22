// Orden de turnos. Sin dependencias: testeable con node --test.
export function buildTurnQueue(teams) {
  const lists = teams.map((t) => t.players || []);
  const max = Math.max(0, ...lists.map((p) => p.length));
  const queue = [];
  for (let i = 0; i < max; i++) {
    for (const players of lists) {
      if (players[i]) queue.push(players[i]);
    }
  }
  return queue;
}

// Turnos equitativos: en cada ronda juega UN turno por equipo y los jugadores de cada equipo
// rotan por separado (ronda 1 -> jugador 1, ronda 2 -> jugador 2, ...). Así, al cerrar cualquier
// ronda, todos los equipos jugaron exactamente la misma cantidad de turnos, sin importar su tamaño.
// Con fair = false se mantiene la rotación anterior (todo el roster por ronda).
export function buildRoundQueue(teams, round, fair = true) {
  if (!fair) return buildTurnQueue(teams);
  const queue = [];
  for (const t of teams) {
    const players = t.players || [];
    if (players.length) queue.push(players[(round - 1) % players.length]);
  }
  return queue;
}
