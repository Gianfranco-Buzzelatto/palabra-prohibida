// Sorteo sin repetidos y pesado por dificultad. Funciones puras (rng inyectable para tests).
export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Peso de cada nivel de dificultad según la dificultad elegida.
// "todas" no filtra; las demás priorizan su nivel y relegan al resto al final del orden.
export const DIF_WEIGHTS = {
  todas: { facil: 1, media: 1, dificil: 1 },
  facil: { facil: 1, media: 0, dificil: 0 },
  media: { facil: 1, media: 3, dificil: 0 },
  dificil: { facil: 0, media: 1, dificil: 3 },
};

export function weightFor(dificultadElegida, dificultadItem) {
  const w = DIF_WEIGHTS[dificultadElegida] || DIF_WEIGHTS.todas;
  return w[dificultadItem] ?? 0;
}

// Devuelve TODOS los items en orden de sorteo, sin repetir.
// Primero salen (al azar, ponderados) los que tienen peso > 0; al final, el resto mezclado.
// Así la dificultad cambia el orden real y la partida nunca se queda sin personajes/canciones.
export function orderByDifficulty(items, dificultad, rng = Math.random) {
  const preferred = [];
  const rest = [];
  for (const it of items) (weightFor(dificultad, it.dificultad) > 0 ? preferred : rest).push(it);
  const bag = [...preferred];
  const order = [];
  while (bag.length) {
    const total = bag.reduce((s, it) => s + weightFor(dificultad, it.dificultad), 0);
    let r = rng() * total;
    let idx = 0;
    for (; idx < bag.length - 1; idx++) {
      r -= weightFor(dificultad, bag[idx].dificultad);
      if (r < 0) break;
    }
    order.push(bag.splice(idx, 1)[0]);
  }
  return { order: [...order, ...shuffle(rest, rng)], preferidos: preferred.length };
}
