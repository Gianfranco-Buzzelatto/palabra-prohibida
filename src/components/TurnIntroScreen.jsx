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
    <div style={styles.centerCol} className="screen-fit intro-fit fade-in">
      <div className="screen-body">
        <div style={styles.eyebrow}>
          RONDA {round} · TURNO {turnIdx + 1} DE {totalTurns}
        </div>
        {isTiebreak && <div style={styles.tiebreakBanner}>⚡ DESEMPATE</div>}
        <div style={styles.wordLabel}>
          {player?.anonymous ? "LE TOCA AL EQUIPO" : "LE TOCA ADIVINAR A"}
        </div>
        <h2 style={styles.teamName}>{player?.anonymous ? team?.name : player?.name}</h2>
        <div style={styles.describerTeam}>
          {player?.anonymous
            ? `${player.name} de ${team?.players?.length || 0}`
            : `${team?.emoji} ${team?.name}`}
        </div>
        <div style={styles.subtitle}>
          {player?.anonymous ? (
            <>
              Elijan quién se da vuelta en <b>{team?.name}</b>. El resto del equipo mira la pantalla y
              tira pistas sueltas, sin decir la palabra. En {timerSeconds} segundos, la mayor cantidad
              posible.
            </>
          ) : (
            <>
              <b>{player?.name}</b> se pone de espaldas a la pantalla.{" "}
              {guessers
                ? `${guessers} miran la palabra y tiran pistas sueltas, sin decirla.`
                : "El equipo mira la palabra y tira pistas sueltas, sin decirla."}{" "}
              En {timerSeconds} segundos, la mayor cantidad posible.
            </>
          )}
        </div>
        <Scoreboard teams={teams} currentTeamIdx={teamIdx} targetScore={targetScore} />
        <div className="big-timer" style={styles.bigTimerPreview}>{timerSeconds}s</div>
      </div>
      <button style={styles.primaryBtn} onClick={onStart}>
        ▶ EMPEZAR TURNO
      </button>
    </div>
  );
}
