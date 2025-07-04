import React, { useEffect, useRef, useState } from "react";

/**
 * Psychomotor Vigilance Task (PVT‑Lite)
 * -------------------------------------------------
 * – 20 trials (default)
 * – Random fore‑period 2–7 s
 * – React with spacebar or click when the green circle appears
 * – Reaction time (RT) is now displayed **immediately after the click** and
 *   persists on screen between trials ("Last RT" panel).
 */
export interface PVTStats {
  trials: number;
  meanRt: number;   // ms
  medianRt: number; // ms
  lapses: number;   // RT > 500 ms
  falseStarts: number;
  rts: number[];
}

interface Props {
  onFinish: (stats: PVTStats) => void;
  totalTrials?: number;
}

const FORE_MIN = 2000; // 2 s
const FORE_MAX = 7000; // 7 s

export const PVTTask: React.FC<Props> = ({ onFinish, totalTrials = 20 }) => {
  /* ───────────── trial state ───────────── */
  const [trial, setTrial] = useState(0);
  const [phase, setPhase] = useState<"waiting" | "stim" | "feedback">("waiting");

  const [lastRt, setLastRt] = useState<number | null>(null); // persists across trials
  const [rts, setRts] = useState<number[]>([]);
  const [lapses, setLapses] = useState(0);
  const [falseStarts, setFalseStarts] = useState(0);

  const stimTsRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ───────────── scheduling ───────────── */
  const scheduleStimulus = () => {
    setPhase("waiting");
    const delay = FORE_MIN + Math.random() * (FORE_MAX - FORE_MIN);
    timeoutRef.current = setTimeout(() => {
      stimTsRef.current = performance.now();
      setPhase("stim");
    }, delay);
  };

  // start first trial
  useEffect(() => {
    scheduleStimulus();
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────────── input handler ───────────── */
  useEffect(() => {
    const handler = () => {
      if (phase === "waiting") {
        // false start
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setFalseStarts((f) => f + 1);
        scheduleStimulus();
      } else if (phase === "stim") {
        const rt = performance.now() - stimTsRef.current;
        setLastRt(rt);
        setRts((arr) => [...arr, rt]);
        if (rt > 500) setLapses((l) => l + 1);
        setPhase("feedback");
        setTimeout(() => advance(rt), 600); // brief 600 ms feedback
      }
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("mousedown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("mousedown", handler);
    };
  }, [phase, trial]);

  /* ───────────── trial advance / finish ───────────── */
  const advance = (recentRt: number) => {
    if (trial + 1 === totalTrials) {
      finish([...rts, recentRt]);
    } else {
      setTrial((t) => t + 1);
      scheduleStimulus();
    }
  };

  const finish = (all: number[]) => {
    const sorted = [...all].sort((a, b) => a - b);
    const mean = all.reduce((s, v) => s + v, 0) / all.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    onFinish({
      trials: totalTrials,
      meanRt: Math.round(mean),
      medianRt: Math.round(median),
      lapses,
      falseStarts,
      rts
    });
  };

  /* ───────────── UI ───────────── */
  const progress = trial / totalTrials;

  return (
    <div className="flex flex-col items-center justify-center gap-10 min-h-[60vh]">
      <h2 className="text-3xl font-extrabold text-indigo-700">Vigilance Test</h2>

      {/* central stimulus / feedback */}
      {phase === "waiting" && <p className="text-xl text-gray-400">Wait…</p>}
      {phase === "stim" && (
        <div className="h-32 w-32 animate-pulse rounded-full bg-lime-500" />
      )}
      {phase === "feedback" && (
        <p className="text-5xl font-mono text-indigo-700">{lastRt?.toFixed(0)} ms</p>
      )}

      {/* persistent RT panel */}
      <div className="rounded-xl bg-white/70 backdrop-blur p-3 shadow-lg">
        <p className="text-sm text-gray-600">Last RT</p>
        <p className="text-2xl font-mono text-gray-800 min-w-[6ch] text-center">
          {lastRt !== null ? `${lastRt.toFixed(0)} ms` : "-- ms"}
        </p>
      </div>

      {/* progress bar */}
      <div className="w-64 bg-gray-200/60 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-500">Trial {trial + 1} / {totalTrials}</p>
      {falseStarts > 0 && (
        <p className="text-sm text-rose-500">False starts: {falseStarts}</p>
      )}
    </div>
  );
};
