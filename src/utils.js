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

export function buildTeams(playerNames, numTeams, teamNames = []) {
  const players = shuffle(
    filledNames(playerNames).map((name, i) => ({ id: `${i}-${name}`, name }))
  );
  const teams = Array.from({ length: numTeams }, (_, i) => {
    const custom = (teamNames[i] || "").trim();
    return {
      name: custom || TEAM_META[i].name,
      emoji: TEAM_META[i].emoji,
      score: 0,
      players: [],
    };
  });
  players.forEach((p, i) => {
    const teamIdx = i % numTeams;
    teams[teamIdx].players.push({ ...p, teamIdx });
  });
  return teams;
}

export function buildTurnQueue(teams) {
  return shuffle(teams.flatMap((t) => t.players));
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
