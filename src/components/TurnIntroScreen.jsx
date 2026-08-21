import { styles } from "../styles";
import { Scoreboard } from "./Scoreboard";

export function TurnIntroScreen({
  player,
  teammates,
  team,
  teamIdx,
  turnIdx,
  totalTurns,
  timerSeconds,
  round,
  isTiebreak,
  teams,
  targetScore,
  onStart,
}) {
  const guessers = teammates.map((p) => p.name).join(", ");
  return (
    <div style={styles.centerCol} className="fade-in">
      <div style={styles.eyebrow}>
        RONDA {round} · TURNO {turnIdx + 1} DE {totalTurns}
      </div>
      {isTiebreak && <div style={styles.tiebreakBanner}>⚡ DESEMPATE</div>}
      <div style={styles.wordLabel}>LE TOCA ADIVINAR A</div>
      <h2 style={styles.teamName}>{player?.name}</h2>
      <div style={styles.describerTeam}>
        {team?.emoji} {team?.name}
      </div>
      <div style={styles.subtitle}>
        <b>{player?.name}</b> se pone de espaldas a la pantalla.{" "}
        {guessers
          ? `${guessers} miran la palabra y tiran pistas sueltas, sin decirla.`
          : "El equipo mira la palabra y tira pistas sueltas, sin decirla."}{" "}
        En {timerSeconds} segundos, la mayor cantidad posible.
      </div>
      <Scoreboard teams={teams} currentTeamIdx={teamIdx} targetScore={targetScore} />
      <div style={styles.bigTimerPreview}>{timerSeconds}s</div>
      <button style={styles.primaryBtn} onClick={onStart}>
        ▶ EMPEZAR TURNO
      </button>
    </div>
  );
}
