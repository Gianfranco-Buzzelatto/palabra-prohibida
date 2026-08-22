import { useState } from "react";
import { CAT_INFO, TEAM_META } from "../data";
import { filledNames } from "../utils";
import { styles } from "../styles";
import { PlayerListEditor } from "./PlayerListEditor";
import { HowToPlay } from "./HowToPlay";

const STEPS = ["welcome", "mode", "teams", "roster", "cats", "play"];

export function SetupScreen({
  rosterMode,
  setRosterMode,
  draftTeams,
  updateDraftTeam,
  addDraftTeam,
  removeDraftTeam,
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
  const [showHow, setShowHow] = useState(false);
  const [step, setStep] = useState("welcome");
  const [rosterIdx, setRosterIdx] = useState(0);

  const stepIndex = STEPS.indexOf(step);
  const team = draftTeams[rosterIdx];

  const rosterOk =
    rosterMode === "named"
      ? filledNames(team?.playerNames || []).length >= 2
      : Number(team?.count) >= 2;

  const goNext = () => {
    if (step === "welcome") setStep("mode");
    else if (step === "mode") setStep("teams");
    else if (step === "teams") {
      setRosterIdx(0);
      setStep("roster");
    } else if (step === "roster") {
      if (rosterIdx < draftTeams.length - 1) setRosterIdx(rosterIdx + 1);
      else setStep("cats");
    } else if (step === "cats") setStep("play");
    else onContinue();
  };

  const goBack = () => {
    if (step === "mode") setStep("welcome");
    else if (step === "teams") setStep("mode");
    else if (step === "roster") {
      if (rosterIdx > 0) setRosterIdx(rosterIdx - 1);
      else setStep("teams");
    } else if (step === "cats") {
      setRosterIdx(draftTeams.length - 1);
      setStep("roster");
    } else if (step === "play") setStep("cats");
  };

  const nextDisabled =
    (step === "roster" && !rosterOk) || (step === "cats" && selectedCats.size < 1);

  const nextLabel =
    step === "play"
      ? "▶ EMPEZAR"
      : step === "roster" && rosterIdx < draftTeams.length - 1
        ? "Siguiente equipo ▶"
        : "Siguiente ▶";

  return (
    <div style={styles.centerCol} className="screen-fit setup-fit fade-in">
      {showHow && <HowToPlay onClose={() => setShowHow(false)} />}

      <div style={styles.eyebrow}>
        {step === "welcome" ? "CONFIGURACIÓN" : `PASO ${stepIndex} DE ${STEPS.length - 1}`}
      </div>

      <div className="setup-card" style={{ ...styles.card, width: "100%", flex: 1, minHeight: 0 }}>
        {step === "welcome" && (
          <WelcomeStep onHow={() => setShowHow(true)} />
        )}
        {step === "mode" && (
          <ModeStep rosterMode={rosterMode} setRosterMode={setRosterMode} />
        )}
        {step === "teams" && (
          <TeamsStep
            draftTeams={draftTeams}
            updateDraftTeam={updateDraftTeam}
            addDraftTeam={addDraftTeam}
            removeDraftTeam={removeDraftTeam}
          />
        )}
        {step === "roster" && team && (
          <RosterStep
            team={team}
            index={rosterIdx}
            total={draftTeams.length}
            rosterMode={rosterMode}
            updateDraftTeam={updateDraftTeam}
          />
        )}
        {step === "cats" && (
          <CatsStep selectedCats={selectedCats} toggleCat={toggleCat} />
        )}
        {step === "play" && (
          <PlayStep
            timerSeconds={timerSeconds}
            setTimerSeconds={setTimerSeconds}
            targetScore={targetScore}
            setTargetScore={setTargetScore}
            usedCount={usedCount}
            remainingCount={remainingCount}
            onResetUsed={onResetUsed}
          />
        )}
      </div>

      <div style={styles.wizardNav} className="wizard-nav">
        {step !== "welcome" && (
          <button type="button" onClick={goBack} style={styles.wizardBack}>
            ← Atrás
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={nextDisabled}
          style={{
            ...styles.primaryBtn,
            marginTop: 0,
            flex: 1,
            ...(nextDisabled ? styles.btnDisabled : {}),
          }}
        >
          {nextDisabled && step === "roster"
            ? "Mínimo 2 por equipo"
            : nextLabel}
        </button>
      </div>
    </div>
  );
}

function WelcomeStep({ onHow }) {
  return (
    <div className="wizard-body">
      <h1 style={styles.title}>ADIVINA LA PALABRA</h1>
      <p style={styles.subtitle}>
        Quien adivina se da vuelta. El equipo mira la pantalla y tira pistas sueltas, sin decir la
        palabra.
      </p>
      <button type="button" onClick={onHow} style={{ ...styles.secondaryBtn, marginTop: 8 }}>
        ▶ Cómo se juega
      </button>
    </div>
  );
}

function ModeStep({ rosterMode, setRosterMode }) {
  return (
    <div className="wizard-body">
      <h2 style={styles.teamName}>¿Cómo armamos los equipos?</h2>
      <button
        type="button"
        onClick={() => setRosterMode("named")}
        style={{
          ...styles.choiceCard,
          ...(rosterMode === "named" ? styles.choiceCardActive : {}),
        }}
      >
        <div style={styles.choiceTitle}>Por nombres</div>
        <div style={styles.choiceSub}>Anotás quién va en cada equipo.</div>
      </button>
      <button
        type="button"
        onClick={() => setRosterMode("counted")}
        style={{
          ...styles.choiceCard,
          ...(rosterMode === "counted" ? styles.choiceCardActive : {}),
        }}
      >
        <div style={styles.choiceTitle}>Por cantidad</div>
        <div style={styles.choiceSub}>Solo cuántos juegan en cada equipo.</div>
      </button>
    </div>
  );
}

function TeamsStep({ draftTeams, updateDraftTeam, addDraftTeam, removeDraftTeam }) {
  return (
    <div className="wizard-body">
      <h2 style={styles.teamName}>Los equipos</h2>
      <p style={styles.subtitle}>Nombre de cada uno. Después cargamos a la gente.</p>
      <div className="setup-teams">
        {draftTeams.map((team, i) => (
          <div key={i} style={{ ...styles.playerRow, marginBottom: 10 }}>
            <span style={{ fontSize: 22, width: 30 }}>{team.emoji}</span>
            <input
              value={team.name}
              onChange={(e) => updateDraftTeam(i, { name: e.target.value })}
              placeholder={TEAM_META[i % TEAM_META.length].name}
              style={{ ...styles.input, flex: 1 }}
              maxLength={22}
            />
            {draftTeams.length > 2 && (
              <button type="button" onClick={() => removeDraftTeam(i)} style={styles.removeBtn}>
                ✕
              </button>
            )}
          </div>
        ))}
        {draftTeams.length < TEAM_META.length && (
          <button type="button" onClick={addDraftTeam} style={styles.addPlayerBtn}>
            + Agregar equipo
          </button>
        )}
      </div>
    </div>
  );
}

function RosterStep({ team, index, total, rosterMode, updateDraftTeam }) {
  return (
    <div className="wizard-body">
      <h2 style={styles.teamName}>
        {team.emoji} {team.name}
      </h2>
      <p style={styles.subtitle}>
        Equipo {index + 1} de {total}.{" "}
        {rosterMode === "named" ? "Anotá los nombres." : "¿Cuántos juegan?"}
      </p>
      <div className="setup-teams">
        {rosterMode === "named" ? (
          <PlayerListEditor
            playerNames={team.playerNames}
            setPlayerNames={(updater) => {
              const next = typeof updater === "function" ? updater(team.playerNames) : updater;
              updateDraftTeam(index, { playerNames: next });
            }}
            minPlayers={2}
          />
        ) : (
          <div style={{ ...styles.pillRow, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
            <button
              type="button"
              style={{ ...styles.pill, fontSize: 28, padding: "16px 22px" }}
              onClick={() =>
                updateDraftTeam(index, { count: Math.max(2, (Number(team.count) || 2) - 1) })
              }
            >
              −
            </button>
            <div style={{ ...styles.pill, ...styles.pillActive, minWidth: 90, fontSize: 32 }}>
              {team.count}
            </div>
            <button
              type="button"
              style={{ ...styles.pill, fontSize: 28, padding: "16px 22px" }}
              onClick={() =>
                updateDraftTeam(index, { count: Math.min(20, (Number(team.count) || 2) + 1) })
              }
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CatsStep({ selectedCats, toggleCat }) {
  return (
    <div className="wizard-body">
      <h2 style={styles.teamName}>Categorías</h2>
      <p style={styles.subtitle}>Elegí al menos una.</p>
      <div style={styles.catGrid}>
        {Object.entries(CAT_INFO).map(([key, info]) => (
          <button
            key={key}
            onClick={() => toggleCat(key)}
            style={{
              ...styles.catPill,
              fontSize: 16,
              padding: "12px 16px",
              ...(selectedCats.has(key) ? styles.catPillActive : {}),
            }}
          >
            {info.emoji} {info.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlayStep({
  timerSeconds,
  setTimerSeconds,
  targetScore,
  setTargetScore,
  usedCount,
  remainingCount,
  onResetUsed,
}) {
  return (
    <div className="wizard-body">
      <h2 style={styles.teamName}>Tiempo y puntaje</h2>
      <div style={{ ...styles.label, textAlign: "center" }}>Tiempo por turno</div>
      <div style={{ ...styles.pillRow, justifyContent: "center" }}>
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
      <div style={{ ...styles.label, textAlign: "center", marginTop: 18 }}>Puntaje para ganar</div>
      <div style={{ ...styles.pillRow, justifyContent: "center" }}>
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
      <div style={{ ...styles.rulesNote, textAlign: "center" }}>
        {usedCount > 0
          ? `Ya salieron ${usedCount} palabras. Quedan ${remainingCount}.`
          : `${remainingCount} palabras en el mazo.`}
      </div>
      {usedCount > 0 && (
        <button type="button" onClick={onResetUsed} style={styles.textBtn}>
          ↺ Volver a usar todas las palabras
        </button>
      )}
    </div>
  );
}
