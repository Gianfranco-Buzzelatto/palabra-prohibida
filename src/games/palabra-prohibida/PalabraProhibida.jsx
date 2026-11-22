import { useState, useEffect, useRef, useMemo } from "react";
import { CARDS, TEAM_META } from "./data";
import {
  shuffle,
  buildNamedTeams,
  buildCountedTeams,
  setupReady,
  createDraftTeam,
  teammatesOf,
  buzz,
  getLeaders,
  wordKey,
  loadUsedWords,
  saveUsedWords,
  clearUsedWords,
} from "./utils";
import { buildRoundQueue } from "./turns";
import { styles } from "./styles";
import { SetupScreen } from "./components/SetupScreen";
import { TurnIntroScreen } from "./components/TurnIntroScreen";
import { PlayingScreen } from "./components/PlayingScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { FinalScreen } from "./components/FinalScreen";

export default function PalabraProhibida({ onMenu }) {
  const [screen, setScreen] = useState("setup");
  const [rosterMode, setRosterMode] = useState("named");
  const [draftTeams, setDraftTeams] = useState(() => [createDraftTeam(0), createDraftTeam(1)]);
  const [selectedCats, setSelectedCats] = useState(
    new Set(["general", "argentina", "comida", "animales", "famosos", "deportes"])
  );
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [targetScore, setTargetScore] = useState(20);
  const [fairTurns, setFairTurns] = useState(true);

  const [teams, setTeams] = useState([]);
  const [turnQueue, setTurnQueue] = useState([]);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [isTiebreak, setIsTiebreak] = useState(false);
  const [deckPool, setDeckPool] = useState([]);
  const excludedRef = useRef(new Set());
  const passedRef = useRef(new Set());
  const lastGameUsedRef = useRef(new Set());
  const usedWordsRef = useRef(loadUsedWords());
  const [usedCount, setUsedCount] = useState(() => usedWordsRef.current.size);

  const [currentCard, setCurrentCard] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [turnResults, setTurnResults] = useState([]);
  const [turnDelta, setTurnDelta] = useState(0);
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [winner, setWinner] = useState(null);

  const intervalRef = useRef(null);
  const currentPlayer = turnQueue[currentTurnIdx] || null;
  const currentTeamIdx = currentPlayer ? currentPlayer.teamIdx : 0;

  const toggleCat = (cat) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat);
      } else next.add(cat);
      return next;
    });
  };

  const pickCard = (pool) => {
    const used = usedWordsRef.current;
    let avail = pool.filter((c) => !used.has(wordKey(c.w)));
    let recycled = false;
    if (avail.length === 0) {
      for (const c of pool) used.delete(wordKey(c.w));
      avail = [...pool];
      recycled = true;
      excludedRef.current = new Set();
    }
    if (avail.length === 0) return { card: null, recycled };
    const card = avail[Math.floor(Math.random() * avail.length)];
    used.add(wordKey(card.w));
    saveUsedWords(used);
    setUsedCount(used.size);
    return { card, recycled };
  };

  const updateDraftTeam = (idx, patch) => {
    setDraftTeams((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const addDraftTeam = () => {
    setDraftTeams((prev) => {
      if (prev.length >= TEAM_META.length) return prev;
      return [...prev, createDraftTeam(prev.length)];
    });
  };

  const removeDraftTeam = (idx) => {
    setDraftTeams((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const startGame = () => {
    const check = setupReady(rosterMode, draftTeams);
    if (!check.ok) return;
    const built =
      rosterMode === "named" ? buildNamedTeams(draftTeams) : buildCountedTeams(draftTeams);
    setTeams(built);
    const catFiltered = CARDS.filter((c) => selectedCats.has(c.cat));
    const unused = catFiltered.filter((c) => !usedWordsRef.current.has(wordKey(c.w)));
    const pool = shuffle(unused.length > 0 ? unused : catFiltered);
    setDeckPool(pool);
    excludedRef.current = new Set();
    passedRef.current = new Set();
    setTurnQueue(buildRoundQueue(built, 1, fairTurns));
    setCurrentTurnIdx(0);
    setRound(1);
    setIsTiebreak(false);
    setWinner(null);
    setScreen("turnIntro");
  };

  const beginTurn = () => {
    passedRef.current = new Set();
    setTurnResults([]);
    setTurnDelta(0);
    setDeckEmpty(false);
    const { card, recycled } = pickCard(deckPool);
    if (recycled) setDeckEmpty(true);
    setCurrentCard(card);
    setTimeLeft(timerSeconds);
    setScreen("playing");
  };

  useEffect(() => {
    if (screen !== "playing") return;
    if (timeLeft <= 0) {
      buzz([80, 40, 180]);
      setScreen("summary");
      return;
    }
    intervalRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(intervalRef.current);
  }, [screen, timeLeft]);

  const drawNext = () => {
    const { card, recycled } = pickCard(deckPool);
    if (recycled) setDeckEmpty(true);
    if (!card) {
      setDeckEmpty(true);
      setCurrentCard(null);
      setScreen("summary");
      return;
    }
    setCurrentCard(card);
  };

  const onAcerto = () => {
    if (!currentCard || screen !== "playing") return;
    excludedRef.current.add(currentCard.id);
    setTurnResults((r) => [...r, { card: currentCard, result: "ok" }]);
    setTurnDelta((d) => d + 1);
    setTeams((prev) => {
      const next = [...prev];
      next[currentTeamIdx] = {
        ...next[currentTeamIdx],
        score: next[currentTeamIdx].score + 1,
      };
      return next;
    });
    drawNext();
  };

  const onPasar = () => {
    if (!currentCard || screen !== "playing") return;
    passedRef.current.add(currentCard.id);
    setTurnResults((r) => [...r, { card: currentCard, result: "pass" }]);
    drawNext();
  };

  const roundOutcome = useMemo(() => {
    const lastOfRotation = turnQueue.length > 0 && currentTurnIdx === turnQueue.length - 1;
    const { max, leaders } = getLeaders(teams);
    const reached = max >= targetScore;
    return {
      lastOfRotation,
      uniqueWinner: lastOfRotation && reached && leaders.length === 1 ? leaders[0] : null,
      tiebreak: lastOfRotation && reached && leaders.length > 1,
      nextPlayer: lastOfRotation ? null : turnQueue[currentTurnIdx + 1],
    };
  }, [currentTurnIdx, turnQueue, teams, targetScore]);

  const afterSummary = () => {
    if (roundOutcome.uniqueWinner) {
      lastGameUsedRef.current = new Set(excludedRef.current);
      setWinner(roundOutcome.uniqueWinner);
      setScreen("final");
      return;
    }

    if (roundOutcome.lastOfRotation) {
      setRound((r) => r + 1);
      if (roundOutcome.tiebreak) setIsTiebreak(true);
      setTurnQueue(buildRoundQueue(teams, round + 1, fairTurns));
      setCurrentTurnIdx(0);
    } else {
      setCurrentTurnIdx((i) => i + 1);
    }
    setScreen("turnIntro");
  };

  const resetUsedWords = () => {
    usedWordsRef.current = clearUsedWords();
    setUsedCount(0);
  };

  const restart = () => {
    setScreen("setup");
    setTeams([]);
    setTurnQueue([]);
    setCurrentTurnIdx(0);
    setRound(1);
    setIsTiebreak(false);
    setWinner(null);
    setCurrentCard(null);
    setTurnResults([]);
  };

  const okCount = turnResults.filter((r) => r.result === "ok").length;
  const passCount = turnResults.filter((r) => r.result === "pass").length;

  const ranking = useMemo(() => [...teams].sort((a, b) => b.score - a.score), [teams]);

  return (
    <div style={styles.appRoot} className="app-root">
      {screen !== "playing" && (
        <div style={{ flex: "0 0 auto" }}>
          <button
            style={{ ...styles.textBtn, marginTop: 0, padding: "4px 2px" }}
            onClick={() => {
              const enCurso = screen === "turnIntro" || screen === "summary";
              if (!enCurso || window.confirm("¿Volver al menú? Se pierde la partida en curso.")) onMenu();
            }}
          >
            ← Menú
          </button>
        </div>
      )}
      {screen === "setup" && (
        <SetupScreen
          rosterMode={rosterMode}
          setRosterMode={setRosterMode}
          draftTeams={draftTeams}
          updateDraftTeam={updateDraftTeam}
          addDraftTeam={addDraftTeam}
          removeDraftTeam={removeDraftTeam}
          selectedCats={selectedCats}
          toggleCat={toggleCat}
          timerSeconds={timerSeconds}
          setTimerSeconds={setTimerSeconds}
          targetScore={targetScore}
          setTargetScore={setTargetScore}
          fairTurns={fairTurns}
          setFairTurns={setFairTurns}
          usedCount={usedCount}
          remainingCount={
            CARDS.filter(
              (c) => selectedCats.has(c.cat) && !usedWordsRef.current.has(wordKey(c.w))
            ).length
          }
          onResetUsed={resetUsedWords}
          onContinue={startGame}
        />
      )}

      {screen === "turnIntro" && (
        <TurnIntroScreen
          player={currentPlayer}
          teammates={teammatesOf(currentPlayer, teams)}
          team={teams[currentTeamIdx]}
          teamIdx={currentTeamIdx}
          turnIdx={currentTurnIdx}
          totalTurns={turnQueue.length}
          timerSeconds={timerSeconds}
          round={round}
          isTiebreak={isTiebreak}
          teams={teams}
          targetScore={targetScore}
          onStart={beginTurn}
        />
      )}

      {screen === "playing" && (
        <PlayingScreen
          timeLeft={timeLeft}
          timerSeconds={timerSeconds}
          currentCard={currentCard}
          onAcerto={onAcerto}
          onPasar={onPasar}
        />
      )}

      {screen === "summary" && (
        <SummaryScreen
          player={currentPlayer}
          team={teams[currentTeamIdx]}
          teams={teams}
          currentTeamIdx={currentTeamIdx}
          turnResults={turnResults}
          turnDelta={turnDelta}
          deckEmpty={deckEmpty}
          targetScore={targetScore}
          roundOutcome={roundOutcome}
          okCount={okCount}
          passCount={passCount}
          onNext={afterSummary}
        />
      )}

      {screen === "final" && (
        <FinalScreen ranking={ranking} winner={winner} onRestart={restart} />
      )}
    </div>
  );
}
