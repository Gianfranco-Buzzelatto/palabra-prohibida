export function winnersText(rows) {
  if (!rows.length) return "";
  const top = rows[0].puntos;
  const w = rows.filter((r) => r.puntos === top);
  return w.length === 1 ? w[0].nombre : `Empate: ${w.map((x) => x.nombre).join(", ")}`;
}

