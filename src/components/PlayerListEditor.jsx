import { filledNames } from "../utils";
import { styles } from "../styles";

export function PlayerListEditor({ playerNames, setPlayerNames, minPlayers }) {
  const addPlayer = () => setPlayerNames((prev) => [...prev, ""]);
  const removePlayer = (idx) => {
    setPlayerNames((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
  };
  const filled = filledNames(playerNames).length;
  return (
    <>
      <div style={styles.namesGrid}>
        {playerNames.map((name, i) => (
          <div key={i} style={styles.playerRow}>
            <input
              value={name}
              onChange={(e) => {
                const next = [...playerNames];
                next[i] = e.target.value;
                setPlayerNames(next);
              }}
              placeholder={`Jugador ${i + 1}`}
              style={{ ...styles.input, flex: 1 }}
              maxLength={18}
            />
            {playerNames.length > 2 && (
              <button type="button" onClick={() => removePlayer(i)} style={styles.removeBtn}>
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={addPlayer} style={styles.addPlayerBtn}>
        + Agregar jugador
      </button>
      <div style={styles.rulesNote}>
        {filled} jugador{filled === 1 ? "" : "es"} · mínimo {minPlayers} (2 por equipo)
      </div>
    </>
  );
}
