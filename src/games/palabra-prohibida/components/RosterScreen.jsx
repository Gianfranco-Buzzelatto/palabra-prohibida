import { TEAM_META } from "../data";
import { styles } from "../styles";

export function RosterScreen({ teams, onReshuffle, onRenameTeam, onBack, onConfirm }) {
  return (
    <div style={styles.centerCol} className="fade-in">
      <div style={styles.eyebrow}>REPARTO ALEATORIO</div>
      <h2 style={styles.teamName}>Así quedaron los equipos</h2>
      <p style={styles.subtitle}>
        Podés cambiar el nombre de cada equipo. Si no te cierra el reparto, mezclá de nuevo.
      </p>
      <div style={styles.rosterList}>
        {teams.map((t, i) => (
          <div key={i} style={styles.rosterCard}>
            <div style={styles.playerRow}>
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <input
                value={t.name}
                onChange={(e) => onRenameTeam(i, e.target.value)}
                placeholder={TEAM_META[i].name}
                style={{ ...styles.input, flex: 1 }}
                maxLength={22}
              />
            </div>
            <div style={{ ...styles.rosterPlayers, marginTop: 10 }}>
              {t.players.map((p) => (
                <span key={p.id} style={styles.playerChip}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={onReshuffle} style={styles.secondaryBtn}>
        🔀 VOLVER A MEZCLAR
      </button>
      <button style={styles.primaryBtn} onClick={onConfirm}>
        ▶ ASÍ ESTÁ, JUGAR
      </button>
      <button type="button" onClick={onBack} style={styles.textBtn}>
        ← Cambiar jugadores
      </button>
    </div>
  );
}
