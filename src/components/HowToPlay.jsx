import { useState } from "react";
import { styles } from "../styles";

const STEPS = [
  {
    title: "De espaldas",
    line: "Una persona se da vuelta. No mira la pantalla.",
  },
  {
    title: "El equipo mira",
    line: "Los demás ven la palabra. Esa no se puede decir.",
  },
  {
    title: "Tirá pistas",
    line: "Palabras sueltas. Probá tocar una pista… y no toques la prohibida.",
  },
  {
    title: "Un minuto",
    line: "La mayor cantidad. Acertó suma. Si no sale, se salta.",
  },
];

export function HowToPlay({ onClose }) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  const next = () => {
    if (last) onClose();
    else setStep((s) => s + 1);
  };

  return (
    <div style={styles.howOverlay} className="fade-in">
      <div style={styles.howCard}>
        <div style={styles.howTop}>
          <div style={styles.eyebrow}>CÓMO SE JUEGA</div>
          <button type="button" onClick={onClose} style={styles.howSkip}>
            Saltar
          </button>
        </div>

        <div key={step} className="fade-in" style={styles.howStage}>
          {step === 0 && <SceneBack />}
          {step === 1 && <SceneLook />}
          {step === 2 && <SceneHints />}
          {step === 3 && <SceneTimer />}
        </div>

        <h2 style={styles.howTitle}>{current.title}</h2>
        <p style={styles.howLine}>{current.line}</p>

        <div style={styles.howDots}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Paso ${i + 1}`}
              onClick={() => setStep(i)}
              style={{
                ...styles.howDot,
                ...(i === step ? styles.howDotActive : {}),
              }}
            />
          ))}
        </div>

        {step !== 3 && (
          <button type="button" onClick={next} style={styles.primaryBtn}>
            Siguiente
          </button>
        )}
        {step === 3 && (
          <button type="button" onClick={onClose} style={styles.primaryBtn}>
            ¡Listo, a jugar!
          </button>
        )}
      </div>
    </div>
  );
}

function SceneBack() {
  return (
    <div className="how-scene">
      <div className="how-screen how-screen-dim">?</div>
      <div className="how-person how-person-back">🧍</div>
      <div className="how-label how-label-left">no mira</div>
    </div>
  );
}

function SceneLook() {
  return (
    <div className="how-scene">
      <div className="how-screen how-screen-lit flip-in">MATE</div>
      <div className="how-row">
        <span className="how-person">👀</span>
        <span className="how-person">👀</span>
      </div>
      <div className="how-label">el equipo ve esto</div>
    </div>
  );
}

function SceneHints() {
  const [said, setSaid] = useState(null);
  const [oops, setOops] = useState(false);

  const say = (word) => {
    setOops(false);
    setSaid(word);
  };

  const boom = () => {
    setSaid(null);
    setOops(true);
  };

  return (
    <div className="how-scene">
      <div className={`how-screen how-screen-lit ${oops ? "shaking" : ""}`}>MATE</div>
      <div className="how-hints">
        {["yerba", "caliente", "bombilla"].map((w) => (
          <button
            key={w}
            type="button"
            className={`how-chip ${said === w ? "how-chip-on" : ""}`}
            onClick={() => say(w)}
          >
            {w}
          </button>
        ))}
        <button type="button" className="how-chip how-chip-no" onClick={boom}>
          mate
        </button>
      </div>
      <div className="how-label">
        {oops ? "¡Esa no! Es la palabra." : said ? `Pista: “${said}”` : "Tocá una pista"}
      </div>
    </div>
  );
}

function SceneTimer() {
  const [ok, setOk] = useState(false);

  return (
    <div className="how-scene">
      <div className="how-timer ticking">⏱ 0:47</div>
      <div className={`how-screen how-screen-lit ${ok ? "pop-in" : ""}`}>
        {ok ? "✅ +1" : "MATE"}
      </div>
      <div className="how-actions">
        <button type="button" className="how-act how-act-ok" onClick={() => setOk(true)}>
          ✅ Acertó
        </button>
        <button type="button" className="how-act how-act-skip" onClick={() => setOk(false)}>
          ⏭ Saltar
        </button>
      </div>
    </div>
  );
}
