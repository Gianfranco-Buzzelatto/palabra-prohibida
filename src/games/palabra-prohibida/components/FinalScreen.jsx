import { styles } from "../styles";

export function FinalScreen({ ranking, winner, onRestart }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={styles.centerCol} className="screen-fit final-fit fade-in">
      <div className="screen-body">
        <div style={styles.eyebrow}>🏆 GANADOR</div>
        <h1 style={{ ...styles.title, fontSize: 40 }}>
          {winner?.emoji} {winner?.name}
        </h1>
        {winner?.players?.length > 0 && (
          <div style={styles.subtitle}>{winner.players.map((p) => p.name).join(" · ")}</div>
        )}

        <div style={styles.confettiWrap}>
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${(i * 7.2) % 100}%`,
                top: -20,
                fontSize: 18,
                animation: `confettiFall ${1.6 + (i % 5) * 0.3}s ease-in ${i * 0.08}s infinite`,
              }}
            >
              {["🎉", "🎊", "⭐", "🥳"][i % 4]}
            </span>
          ))}
        </div>

        <div style={styles.rankList}>
          {ranking.map((t, i) => (
            <div
              key={t.name + i}
              className="pop-in"
              style={{
                ...styles.rankRow,
                ...(i === 0 ? styles.rankFirst : {}),
                animationDelay: `${i * 0.12}s`,
              }}
            >
              <div style={styles.rankMedal}>{medals[i] || `${i + 1}º`}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.rankName}>
                  {t.emoji} {t.name}
                </div>
                <div style={styles.rankSub}>
                  {t.score} puntos · {(t.players || []).map((p) => p.name).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button style={styles.primaryBtn} onClick={onRestart}>
        🔄 NUEVA PARTIDA
      </button>
    </div>
  );
}
