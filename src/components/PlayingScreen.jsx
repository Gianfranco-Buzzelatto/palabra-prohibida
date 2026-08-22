import { styles } from "../styles";

export function PlayingScreen({
  timeLeft,
  timerSeconds,
  currentCard,
  onAcerto,
  onPasar,
}) {
  const urgent = timeLeft <= 10;
  const pct = Math.max(0, (timeLeft / Math.max(timerSeconds, 1)) * 100);
  return (
    <div style={styles.centerCol} className="screen-fit play-fit fade-in">
      <div
        className={urgent ? "ticking" : ""}
        style={{ ...styles.timerBadge, color: urgent ? "#FF3D7F" : "#F2B705" }}
      >
        ⏱ {timeLeft}s
      </div>
      <div style={styles.timerTrack}>
        <div
          style={{
            ...styles.timerFill,
            width: `${pct}%`,
            background: urgent ? "#FF3D7F" : "#F2B705",
          }}
        />
      </div>

      <div className="play-word" style={styles.wordCard}>
        <div className="word-text" style={styles.wordText}>
          {currentCard ? currentCard.w : "—"}
        </div>
        {currentCard?.hint && (
          <div style={styles.wordHint}>{currentCard.hint}</div>
        )}
      </div>

      <div style={styles.actionRow}>
        <button style={{ ...styles.actionBtn, ...styles.goBtn }} onClick={onAcerto}>
          ✅ ACERTÓ
        </button>
        <button style={{ ...styles.actionBtn, ...styles.passBtn }} onClick={onPasar}>
          ⏭ SALTAR
        </button>
      </div>
    </div>
  );
}
