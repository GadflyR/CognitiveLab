/* NBackGame.tsx ----------------------------------------------------- */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import { ProgressBar } from "./ProgressBar";
import { GameSettings } from "../types";

/* ---------- types ---------- */
export interface GameStats {
  hits: number;
  missed: number;
  attempts: number;
  accuracy: number;
}
export interface NBackGameProps {
  settings: GameSettings;
  onFinish: (s: GameStats) => void;
}
interface Stimulus {
  id: number;
  letter: string;
}

/* ---------- constants ---------- */
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MATCH_RATE = 0.35;
const TUTORIAL = ["R", "A", "R", "E", "E"] as const; // 5-letter demo
const TUT_PACE_MS = 5000;

type Phase = "tut" | "confirm" | "ready" | "game";

export const NBackGame: React.FC<NBackGameProps> = ({ settings, onFinish }) => {
  /* --------------- phase & indices --------------- */
  const [phase, setPhase] = useState<Phase>("tut");
  const [tIdx, setTIdx] = useState(-1);
  const [idx, setIdx] = useState(-1);
  const [readyCnt, setReadyCnt] = useState(3);

  /* --------------- game stats --------------- */
  const [hits, setHits] = useState(0);
  const [missed, setMissed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const pressed = useRef<Set<number>>(new Set());
  const [flash, setFlash] = useState<"none" | "press" | "hit" | "miss">("none");

  /* tutorial feedback bubble */
  const [tutFb, setTutFb] = useState<null | { msg: string; color: "green" | "red" }>(null);
  useEffect(() => {
    if (!tutFb) return;
    const t = setTimeout(() => setTutFb(null), 600);
    return () => clearTimeout(t);
  }, [tutFb]);

  /* --------------- build random stream --------------- */
  const stream = useMemo<Stimulus[]>(() => {
    const out: Stimulus[] = [];
    for (let i = 0; i < settings.total; i++) {
      if (i < settings.n) {
        out.push({ id: i, letter: ALPHA[Math.floor(Math.random() * ALPHA.length)] });
      } else if (Math.random() < MATCH_RATE) {
        out.push({ id: i, letter: out[i - settings.n].letter });
      } else {
        let l = ALPHA[Math.floor(Math.random() * ALPHA.length)];
        while (l === out[i - settings.n].letter) {
          l = ALPHA[Math.floor(Math.random() * ALPHA.length)];
        }
        out.push({ id: i, letter: l });
      }
    }
    return out;
  }, [settings.total, settings.n]);

  /* --------------- ticker (tut or game) --------------- */
  useInterval(
    () => {
      if (phase === "tut") setTIdx((i) => i + 1);
      else if (phase === "game") setIdx((i) => i + 1);
    },
    phase === "tut" && tIdx < TUTORIAL.length
      ? TUT_PACE_MS
      : phase === "game" && idx < settings.total
      ? settings.paceMs
      : null
  );

  /* --------------- tutorial → confirm --------------- */
  useEffect(() => {
    if (phase === "tut" && tIdx === TUTORIAL.length) {
      setPhase("confirm");
      setReadyCnt(3);
    }
  }, [phase, tIdx]);

  /* --------------- ready countdown → game --------------- */
  useInterval(
    () => {
      setReadyCnt((c) => {
        if (c <= 1) {
          setPhase("game");
          setIdx(-1);
          return 0;
        }
        return c - 1;
      });
    },
    phase === "ready" ? 1000 : null
  );

  /* --------------- speech synthesis --------------- */
  const say = (l: string) => {
    if (!settings.useAudio) return;
    const u = new SpeechSynthesisUtterance(l);
    u.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  useEffect(() => {
    if (phase === "tut" && tIdx >= 0 && tIdx < TUTORIAL.length) say(TUTORIAL[tIdx]);
    if (phase === "game" && idx >= 0 && idx < stream.length) say(stream[idx].letter);
  }, [phase, tIdx, idx, settings.useAudio, stream]);

  /* --------------- detect missed in game --------------- */
  useEffect(() => {
    if (phase !== "game") return;
    const p = idx - 1;
    if (p >= settings.n && stream[p].letter === stream[p - settings.n].letter && !pressed.current.has(p)) {
      setMissed((m) => m + 1);
    }
  }, [phase, idx, settings.n, stream]);

  /* --------------- flash reset --------------- */
  useEffect(() => {
    if (flash === "none") return;
    const t = setTimeout(() => setFlash("none"), 200);
    return () => clearTimeout(t);
  }, [flash]);

  /* --------------- key handler --------------- */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.code !== "Space") return;

      if (phase === "tut") {
        // tutorial logic
        if (tIdx < settings.n) {
          setFlash("miss");
          setTutFb({ msg: "Too early – just watch!", color: "red" });
        } else {
          const isMatch = TUTORIAL[tIdx] === TUTORIAL[tIdx - settings.n];
          setFlash(isMatch ? "hit" : "miss");
          setTutFb(
            isMatch
              ? { msg: "✅ Correct!", color: "green" }
              : { msg: "❌ Not a match", color: "red" }
          );
        }
        return;
      }

      // real game: ignore repeated presses per letter
      if (idx < settings.n) {
        setFlash("press");
        return;
      }
      if (pressed.current.has(idx)) {
        setFlash("press");
        return;
      }

      // first press this letter
      pressed.current.add(idx);
      setAttempts((a) => a + 1);
      const match = stream[idx].letter === stream[idx - settings.n].letter;
      if (match) {
        setHits((h) => h + 1);
        setFlash("hit");
      } else {
        setFlash("miss");
      }
    },
    [phase, idx, tIdx, settings.n, stream]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* --------------- finish & emit --------------- */
  useEffect(() => {
    if (phase !== "game" || idx !== settings.total) return;
    // final miss check
    const last = idx - 1;
    if (last >= settings.n && stream[last].letter === stream[last - settings.n].letter && !pressed.current.has(last)) {
      setMissed((m) => m + 1);
    }
    const accuracy = attempts ? hits / attempts : 0;
    onFinish({ hits, missed, attempts, accuracy });
  }, [phase, idx, settings, hits, missed, attempts, onFinish, stream]);

  /* --------------- helpers --------------- */
  const curLetter =
    phase === "tut"
      ? tIdx >= 0 && tIdx < TUTORIAL.length
        ? TUTORIAL[tIdx]
        : "–"
      : idx >= 0 && idx < stream.length
      ? stream[idx].letter
      : "–";

  const ringCls =
    flash === "hit"
      ? "ring-8 ring-lime-400 ring-offset-2"
      : flash === "miss"
      ? "ring-8 ring-rose-400 ring-offset-2"
      : "";
  const pressCls = flash === "press" ? "scale-90" : "scale-100";

  let tutText: string | null = null;
  if (phase === "tut" && tIdx >= 0 && tIdx < TUTORIAL.length) {
    if (tIdx < settings.n) tutText = "Watch carefully. No key press yet.";
    else if (TUTORIAL[tIdx] === TUTORIAL[tIdx - settings.n])
      tutText = `Press Space now, because the letter is ${TUTORIAL[tIdx]} and two steps back it was also ${TUTORIAL[tIdx]}!`;
    else tutText = "Do not press – this is not a match.";
  }

  return (
    <div className="glass-card w-full max-w-xl space-y-8">
      {/* header */}
      <p className="text-center text-sm text-gray-600">
        {phase === "tut"
          ? "Tutorial – n = 2"
          : phase === "ready"
          ? "Get ready…"
          : (
            <>Hit <kbd className="kbd">Space</kbd> when the current letter equals the one <b>n = 2</b> back.</>
          )}
      </p>

      {/* current (and queue in tut) */}
      <div
        className={`flex items-center justify-center gap-8 transition-transform duration-150 ${pressCls} ${ringCls}`}
      >
        {phase === "tut" && (
          <div className="flex flex-col items-center mr-2">
            <p className="text-xs text-gray-500 mb-1 tracking-wide">previous letters</p>
            <ul className="flex space-x-2">
              {TUTORIAL.slice(0, Math.max(tIdx, 0)).map((l, i) => (
                <li
                  key={i}
                  className="w-10 h-10 flex items-center justify-center
                             rounded-md bg-gray-100 font-semibold text-lg
                             text-indigo-700 shadow"
                >
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}
        <span
          className="select-none text-[10rem] font-extrabold tracking-widest
                     bg-gradient-to-br from-indigo-500 to-fuchsia-600 bg-clip-text
                     text-transparent drop-shadow-[0_5px_15px_rgba(99,102,241,0.45)]
                     animate-pulse"
        >
          {curLetter}
        </span>
      </div>

      {/* INTERNAL progress bar */}
      <ProgressBar
        value={
          phase === "tut"
            ? (Math.min(tIdx + 1, TUTORIAL.length) / TUTORIAL.length) * 0.2
            : phase === "ready"
            ? 0.2
            : 0.2 + (Math.min(idx + 1, settings.total) / settings.total) * 0.8
        }
      />

      {/* tutorial hint or bubble */}
      {phase === "tut" && (
        <>
          {tutText && (
            <p className="text-center text-indigo-700 font-bold text-xl md:text-2xl">
              {tutText}
            </p>
          )}
          {tutFb && (
            <p
              className={`text-3xl font-extrabold ${
                tutFb.color === "green" ? "text-lime-600" : "text-rose-600"
              }`}
            >
              {tutFb.msg}
            </p>
          )}
        </>
      )}

      {/* confirm overlay */}
      {phase === "confirm" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl p-6 space-y-6">
          <h3 className="text-2xl font-extrabold text-indigo-700">Tutorial finished!</h3>
          <p className="text-center text-gray-700 max-w-xs">
            In the real test the letters will appear <b>much faster&nbsp;(1.5&nbsp;s)</b> and the queue of "previous numbers" will{" "}
            <b>disappear</b>.<br />
            Would you like to play the tutorial again or start the real test?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTIdx(-1);
                setPhase("tut");
              }}
              className="rounded-full bg-gray-200 px-6 py-3 font-semibold text-gray-700 shadow"
            >
              Play tutorial again
            </button>
            <button
              onClick={() => {
                setReadyCnt(3);
                setPhase("ready");
              }}
              className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700"
            >
              Start real test
            </button>
          </div>
        </div>
      )}

      {/* ready overlay */}
      {phase === "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl">
          <p className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">
            Real test starts in
          </p>
          <p className="text-7xl md:text-8xl font-extrabold text-fuchsia-600">{readyCnt}</p>
        </div>
      )}

      {/* final stats (game) */}
      {phase === "game" && (
        <div className="grid grid-cols-4 gap-6 text-center">
          <Stat label="Hits" value={hits} />
          <Stat label="Missed" value={missed} />
          <Stat label="Attempts" value={attempts} />
          <Stat label="Index" value={Math.max(idx + 1, 0)} />
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
);
