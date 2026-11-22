import { C, ui } from "./ui.js";
import { useNow } from "./hooks.js";
import { remainingMs, fmtClock } from "./timer.js";
import { openDisplayWindow } from "./sync.js";
import { winnersText } from "./format.js";

export function TopBar({ onMenu, confirmMenu, title, tv, onToggleTv, showScreenBtn = true }) {
  const back = () => {
    if (!confirmMenu || window.confirm("¿Volver al menú? La partida queda guardada y podés retomarla.")) onMenu();
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto", width: "100%", maxWidth: 860, margin: "0 auto" }}>
      <button style={ui.text} onClick={back}>← Menú</button>
      <div style={{ flex: 1, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, color: C.dim, fontSize: 18 }}>{title}</div>
      {showScreenBtn && (
        <button
          style={ui.text}
          onClick={() => {
            if (!openDisplayWindow()) window.alert("El navegador bloqueó la ventana. Permití ventanas emergentes para este sitio.");
          }}
        >
          🖥 Abrir pantalla
        </button>
      )}
      <button style={{ ...ui.text, color: tv ? C.yellow : C.soft }} onClick={onToggleTv}>📺 Modo TV</button>
    </div>
  );
}

export function Stepper({ label, value, onChange, min = 0, max = 999, step = 1, suffix = "", hint }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, v)));
  const b = { width: 48, height: 48, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: C.ink, fontSize: 24, fontWeight: 800 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", padding: "6px 0" }}>
      <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: "clamp(15px, 1.9vw, 19px)" }}>{label}</div>
        {hint && <div style={{ color: C.dim, fontSize: 13 }}>{hint}</div>}
      </div>
      <button style={b} aria-label={`Menos ${label}`} onClick={() => set(value - step)} disabled={value <= min}>−</button>
      <div style={{ minWidth: 64, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: C.yellow }}>{value}{suffix}</div>
      <button style={b} aria-label={`Más ${label}`} onClick={() => set(value + step)} disabled={value >= max}>+</button>
    </div>
  );
}

// options: [{ value, label }]. multi: value es un array.
export function Pills({ options, value, onChange, multi = false, small = false }) {
  const isOn = (v) => (multi ? value.includes(v) : value === v);
  const toggle = (v) => {
    if (!multi) return onChange(v);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div style={ui.pillRow}>
      {options.map((o) => (
        <button
          key={o.value}
          aria-pressed={isOn(o.value)}
          style={{ ...ui.pill, ...(small ? { padding: "8px 12px", fontSize: 15 } : {}), ...(isOn(o.value) ? ui.pillOn : {}) }}
          onClick={() => toggle(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div style={{ ...ui.card, marginBottom: 10 }}>
      <div style={ui.label}>{title}</div>
      {children}
    </div>
  );
}

// Cuenta regresiva a partir de un temporizador serializable { running, endsAt, remainingMs, totalMs }.
export function Clock({ timer, style }) {
  const now = useNow(!!timer?.running);
  if (!timer) return null;
  const ms = remainingMs(timer, now);
  const low = ms <= 10000 && ms > 0;
  return (
    <div className={low && timer.running ? "ticking" : ""} style={{ ...ui.timerNum, color: low ? C.pink : C.yellow, ...style }} aria-label="Tiempo restante">
      {fmtClock(ms)}
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];
export function FinalBoard({ rows, big = false }) {
  const top = rows[0]?.puntos;
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r, i) => (
        <div
          key={r.id ?? r.nombre + i}
          className="pop-in"
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: big ? "14px 18px" : "10px 14px", textAlign: "left", borderRadius: 16,
            background: r.puntos === top ? "rgba(242,183,5,0.16)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${r.puntos === top ? C.yellow : "rgba(255,255,255,0.12)"}`, animationDelay: `${i * 0.08}s`,
          }}
        >
          <div style={{ fontSize: big ? 34 : 26, minWidth: 44, textAlign: "center" }}>{MEDALS[i] || `${i + 1}º`}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: big ? 26 : 19, color: r.color || C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nombre}</div>
            {r.detalle && <div style={{ color: C.soft, fontSize: big ? 16 : 13 }}>{r.detalle}</div>}
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: big ? 44 : 32, color: C.yellow }}>{r.puntos}</div>
        </div>
      ))}
    </div>
  );
}

export function FinalScreen({ rows, extra, onRematch, onNew, onMenu }) {
  return (
    <div style={ui.col} className="screen-fit fade-in">
      <div className="screen-body" style={{ justifyContent: "flex-start", gap: 8 }}>
        <div style={ui.eyebrow}>🏆 {rows.filter((r) => r.puntos === rows[0]?.puntos).length > 1 ? "EMPATE EN LA CIMA" : "GANADOR"}</div>
        <h1 style={{ ...ui.title, fontSize: "clamp(34px, 6vw, 54px)" }}>{winnersText(rows)}</h1>
        <FinalBoard rows={rows} />
        {extra}
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
        <button style={ui.primary} onClick={onRematch}>🔄 REVANCHA (mismos jugadores)</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={ui.secondary} onClick={onNew}>⚙️ Configurar de nuevo</button>
          <button style={ui.secondary} onClick={onMenu}>🏠 Volver al menú</button>
        </div>
      </div>
    </div>
  );
}
