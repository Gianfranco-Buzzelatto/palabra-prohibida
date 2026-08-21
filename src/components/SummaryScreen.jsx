import { styles } from "../styles";
import { Scoreboard } from "./Scoreboard";

export function SummaryScreen({
  player,
  team,
  teams,
  currentTeamIdx,
  turnResults,
  turnDelta,
  deckEmpty,
  targetScore,
  roundOutcome,
  okCount,
  passCount,
  onNext,
}) {
  const icons = { ok: "✅", pass: "⏭" };
  const nextLabel = roundOutcome.uniqueWinner
    ? "🏆 VER GANADOR"
    : roundOutcome.tiebreak
      ? "⚡ DESEMPATE ▶"
      : roundOutcome.nextPlayer
        ? `SIGUIENTE: ${roundOutcome.nextPlayer.name.toUpperCase()} ▶`
        : "SIGUIENTE RONDA ▶";
  return (
    <div style={styles.centerCol} className="fade-in">
      <div style={{ fontSize: 56 }}>⏰</div>
      <h2 style={styles.teamName}>¡SE ACABÓ EL TIEMPO!</h2>
      {deckEmpty && (
        <div style={{ ...styles.subtitle, color: "#FBBF24" }}>
          Se terminaron las palabras nuevas: se re mezcló el mazo
        </div>
      )}
      <div
        style={{
          ...styles.targetNumber,
          color: turnDelta > 0 ? "#34D399" : turnDelta < 0 ? "#FF3D7F" : "#F2B705",
        }}
      >
        {turnDelta > 0 ? `+${turnDelta}` : turnDelta}
      </div>
      <div style={styles.miniStats}>
        ✅ {okCount} &nbsp;·&nbsp; ⏭ {passCount}
      </div>
      <div style={styles.subtitle}>
        {player?.name} metió {okCount} en este turno para {team?.emoji} {team?.name}. Van{" "}
        <b>{team?.score}</b> puntos
      </div>

      <Scoreboard teams={teams} currentTeamIdx={currentTeamIdx} targetScore={targetScore} />

      {turnResults.length > 0 && (
        <div style={styles.resultsList}>
          {turnResults.map((r, i) => (
            <div key={i} style={styles.resultRow}>
              <span>{icons[r.result]}</span>
              <span>{r.card.w}</span>
            </div>
          ))}
        </div>
      )}

      <button style={styles.primaryBtn} onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}
