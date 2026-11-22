import { styles } from "../styles";

export function Scoreboard({ teams, currentTeamIdx, targetScore }) {
  if (!teams.length) return null;
  return (
    <div style={styles.scoreBoard}>
      {teams.map((t, i) => (
        <div
          key={t.name + i}
          style={{
            ...styles.scoreChip,
            ...(i === currentTeamIdx ? styles.scoreChipActive : {}),
          }}
        >
          <div style={styles.scoreChipName}>
            {t.emoji} {t.name}
          </div>
          <div style={styles.scoreChipPts}>
            {t.score}
            <span style={styles.scoreChipGoal}>/{targetScore}</span>
          </div>
          <div style={styles.scoreChipPlayers}>
            {t.counted
              ? `${(t.players || []).length} participantes`
              : (t.players || []).map((p) => p.name).join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}
