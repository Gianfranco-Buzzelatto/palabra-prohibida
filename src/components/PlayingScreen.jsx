import { CAT_INFO } from "../data";
import { styles } from "../styles";
import { Scoreboard } from "./Scoreboard";

export function PlayingScreen({
  player,
  team,
  teams,
  currentTeamIdx,
  targetScore,
  timeLeft,
  timerSeconds,
  currentCard,
  okCount,
  passCount,
  onAcerto,
  onPasar,
}) {
  const urgent = timeLeft <= 10;
  const pct = Math.max(0, (timeLeft / Math.max(timerSeconds, 1)) * 100);
  const cat = currentCard ? CAT_INFO[currentCard.cat] : null;
  return (
    <div style={styles.centerCol} className="fade-in">
      <div style={styles.playHeader}>
        <div>
          <div style={styles.eyebrow}>ADIVINA: {player?.name}</div>
          <div style={styles.playTeamSub}>
            {team?.emoji} {team?.name} · de espaldas a la pantalla
          </div>
        </div>
        <div
          className={urgent ? "ticking" : ""}
          style={{ ...styles.timerBadge, color: urgent ? "#FF3D7F" : "#F2B705" }}
        >
          ⏱ {timeLeft}s
        </div>
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

      <Scoreboard teams={teams} currentTeamIdx={currentTeamIdx} targetScore={targetScore} />

      {currentCard ? (
        <div key={currentCard.id} className="flip-in" style={styles.wordCard}>
          {cat && (
            <div style={styles.catTag}>
              {cat.emoji} {cat.label}
            </div>
          )}
          <div style={styles.wordLabel}>NO DIGAN ESTA PALABRA</div>
          <div style={styles.wordText}>{currentCard.w}</div>
          <div style={styles.forbiddenLabel}>Tiren pistas sueltas. Quien adivina está de espaldas.</div>
        </div>
      ) : (
        <div style={styles.wordCard}>Sin más palabras disponibles</div>
      )}

      <div style={styles.miniStats}>
        ✅ {okCount} aciertos &nbsp;·&nbsp; ⏭ {passCount} saltos
      </div>

      <div style={styles.actionCol}>
        <button style={{ ...styles.actionBtnFull, ...styles.goBtn }} onClick={onAcerto}>
          ✅ ACERTÓ
        </button>
        <button style={{ ...styles.actionBtnFull, ...styles.passBtn }} onClick={onPasar}>
          ⏭ SALTAR
        </button>
      </div>
    </div>
  );
}
