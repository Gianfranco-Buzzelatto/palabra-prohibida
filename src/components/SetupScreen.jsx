import { useState } from "react";
import { CAT_INFO, TEAM_META } from "../data";
import { filledNames } from "../utils";
import { styles } from "../styles";
import { PlayerListEditor } from "./PlayerListEditor";

export function SetupScreen({
  numTeams,
  setNumTeams,
  teamNames,
  setTeamNames,
  playerNames,
  setPlayerNames,
  selectedCats,
  toggleCat,
  timerSeconds,
  setTimerSeconds,
  targetScore,
  setTargetScore,
  usedCount,
  remainingCount,
  onResetUsed,
  onContinue,
}) {
  const [showRules, setShowRules] = useState(false);
  const minPlayers = numTeams * 2;
  const ready = filledNames(playerNames).length >= minPlayers;
  return (
    <div style={styles.centerCol} className="fade-in">
      <div style={styles.eyebrow}>UN MINUTO, LA MAYOR CANTIDAD</div>
      <h1 style={styles.title}>PALABRA PROHIBIDA</h1>
      <p style={styles.subtitle}>
        Quien adivina se da vuelta. El equipo mira la pantalla y tira pistas sueltas,
        sin decir la palabra.
      </p>

      <div style={styles.card}>
        <div style={styles.label}>Jugadores</div>
        <PlayerListEditor
          playerNames={playerNames}
          setPlayerNames={setPlayerNames}
          minPlayers={minPlayers}
        />

        <div style={{ ...styles.label, marginTop: 22 }}>¿Cuántos equipos?</div>
        <div style={styles.pillRow}>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setNumTeams(n)}
              style={{ ...styles.pill, ...(numTeams === n ? styles.pillActive : {}) }}
            >
              {n}
            </button>
          ))}
        </div>

        <div style={{ ...styles.label, marginTop: 22 }}>Nombre de los equipos</div>
        <div style={styles.namesGrid}>
          {Array.from({ length: numTeams }, (_, i) => (
            <div key={i} style={styles.playerRow}>
              <span style={{ fontSize: 20, width: 28 }}>{TEAM_META[i].emoji}</span>
              <input
                value={teamNames[i] ?? TEAM_META[i].name}
                onChange={(e) => {
                  const next = [...teamNames];
                  next[i] = e.target.value;
                  setTeamNames(next);
                }}
                placeholder={TEAM_META[i].name}
                style={{ ...styles.input, flex: 1 }}
                maxLength={22}
              />
            </div>
          ))}
        </div>

        <div style={{ ...styles.label, marginTop: 22 }}>Categorías</div>
        <div style={styles.catGrid}>
          {Object.entries(CAT_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => toggleCat(key)}
              style={{
                ...styles.catPill,
                ...(selectedCats.has(key) ? styles.catPillActive : {}),
              }}
            >
              {info.emoji} {info.label}
            </button>
          ))}
        </div>

        <div style={{ ...styles.label, marginTop: 22 }}>Tiempo por turno</div>
        <div style={styles.pillRow}>
          {[30, 60, 90].map((s) => (
            <button
              key={s}
              onClick={() => setTimerSeconds(s)}
              style={{ ...styles.pill, ...(timerSeconds === s ? styles.pillActive : {}) }}
            >
              {s}s
            </button>
          ))}
        </div>

        <div style={{ ...styles.label, marginTop: 22 }}>Puntaje para ganar</div>
        <div style={styles.pillRow}>
          {[15, 20, 30].map((s) => (
            <button
              key={s}
              onClick={() => setTargetScore(s)}
              style={{ ...styles.pill, ...(targetScore === s ? styles.pillActive : {}) }}
            >
              {s} pts
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setShowRules((v) => !v)} style={styles.rulesToggle}>
          {showRules ? "▾ Cómo se juega" : "▸ Cómo se juega"}
        </button>
        {showRules && (
          <div style={styles.rulesBox}>
            <p>Se anotan todas las personas. El juego reparte equipos al azar.</p>
            <p>
              En cada turno, una persona se pone de espaldas a la pantalla. El resto de su equipo
              mira la palabra.
            </p>
            <p>
              El equipo tira palabras sueltas (pistas), sin decir la que está en pantalla. Quien está
              de espaldas trata de adivinarla.
            </p>
            <p>✅ Acertó: +1 y sale otra. ⏭ Saltar: sin límite, si no sale se salta.</p>
            <p>El turno dura un minuto: hay que meter la mayor cantidad posible.</p>
            <p>Todos adivinan al menos una vez. Si hay empate, hay desempate.</p>
          </div>
        )}

        <div style={styles.rulesNote}>
          👀 de espaldas · pistas sueltas · ⏭ saltos ilimitados · ⏱ un minuto
        </div>

        <div style={styles.rulesNote}>
          {usedCount > 0
            ? `Ya salieron ${usedCount} palabras en este dispositivo. Quedan ${remainingCount} en las categorías elegidas.`
            : `Mazo limpio. ${remainingCount} palabras en las categorías elegidas.`}
        </div>
        {usedCount > 0 && (
          <button type="button" onClick={onResetUsed} style={styles.textBtn}>
            ↺ Volver a usar todas las palabras
          </button>
        )}

        <button
          style={{
            ...styles.primaryBtn,
            ...(ready ? {} : styles.btnDisabled),
          }}
          onClick={onContinue}
          disabled={!ready}
        >
          {ready ? "🎲 ARMAR EQUIPOS AL AZAR" : `Faltan jugadores (mín. ${minPlayers})`}
        </button>
      </div>
    </div>
  );
}
