import { TEAM_META } from "./data";

export function filledNames(names) {
  return names.map((n) => n.trim()).filter(Boolean);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createDraftTeam(index) {
  const meta = TEAM_META[index % TEAM_META.length];
  return {
    name: meta.name,
    emoji: meta.emoji,
    playerNames: ["", ""],
    count: 4,
  };
}

export function buildNamedTeams(drafts) {
  return drafts.map((d, i) => {
    const meta = TEAM_META[i % TEAM_META.length];
    const names = filledNames(d.playerNames || []);
    return {
      name: (d.name || "").trim() || meta.name,
      emoji: d.emoji || meta.emoji,
      score: 0,
      counted: false,
      players: names.map((name, n) => ({
        id: `${i}-${n}-${name}`,
        name,
        teamIdx: i,
        anonymous: false,
      })),
    };
  });
}

export function buildCountedTeams(drafts) {
  return drafts.map((d, i) => {
    const meta = TEAM_META[i % TEAM_META.length];
    const count = Math.max(2, Math.min(20, Number(d.count) || 2));
    return {
      name: (d.name || "").trim() || meta.name,
      emoji: d.emoji || meta.emoji,
      score: 0,
      counted: true,
      players: Array.from({ length: count }, (_, n) => ({
        id: `${i}-${n}`,
        name: `Turno ${n + 1}`,
        teamIdx: i,
        anonymous: true,
      })),
    };
  });
}

export function setupReady(mode, drafts) {
  if (!drafts || drafts.length < 2) {
    return { ok: false, reason: "Mínimo 2 equipos" };
  }
  if (mode === "named") {
    const short = drafts.find((d) => filledNames(d.playerNames || []).length < 2);
    if (short) return { ok: false, reason: "Cada equipo necesita al menos 2 nombres" };
    return { ok: true };
  }
  const short = drafts.find((d) => Number(d.count) < 2);
  if (short) return { ok: false, reason: "Cada equipo necesita al menos 2 participantes" };
  return { ok: true };
}

export function turnLabel(player, teams) {
  if (!player) return "";
  const team = teams[player.teamIdx];
  if (player.anonymous) {
    return `${team?.name || "Equipo"} · ${player.name}`;
  }
  return player.name;
}

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

export function teammatesOf(player, teams) {
  if (!player) return [];
  return (teams[player.teamIdx]?.players || []).filter((p) => p.id !== player.id);
}

export function buzz(ms = 180) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    /* ignore */
  }
}

export function getLeaders(teams) {
  if (!teams.length) return { max: 0, leaders: [] };
  const max = Math.max(...teams.map((t) => t.score));
  return { max, leaders: teams.filter((t) => t.score === max) };
}

const USED_WORDS_KEY = "palabra-prohibida:used-words";

export function wordKey(word) {
  return String(word || "")
    .trim()
    .toLowerCase();
}

export function loadUsedWords() {
  try {
    const raw = localStorage.getItem(USED_WORDS_KEY);
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(wordKey).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function saveUsedWords(used) {
  try {
    localStorage.setItem(USED_WORDS_KEY, JSON.stringify([...used]));
  } catch {
    /* quota / private mode */
  }
}

export function clearUsedWords() {
  try {
    localStorage.removeItem(USED_WORDS_KEY);
  } catch {
    /* ignore */
  }
  return new Set();
}
