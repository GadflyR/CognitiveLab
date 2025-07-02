import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import { useInterval } from "../hooks/useInterval";
  import { ProgressBar } from "./ProgressBar";
  import { GameSettings } from "../types";
  
  /**
   * 2‑Back game component (35 % forced matches).
   * Emits a full stats object on finish → { hits, missed, attempts, accuracy }.
   */
  export interface GameStats {
    hits: number;
    missed: number;
    attempts: number;
    accuracy: number; // hits / attempts  (0 when no attempts)
  }
  
  export interface NBackGameProps {
    settings: GameSettings;
    onFinish: (stats: GameStats) => void;
  }
  
  interface Stimulus {
    id: number;
    letter: string;
  }
  
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const MATCH_RATE = 0.35;
  
  export const NBackGame: React.FC<NBackGameProps> = ({ settings, onFinish }) => {
    /* ───────────── local state ───────────── */
    const [idx, setIdx] = useState(-1);
    const [attempts, setAttempts] = useState(0);
    const [hits, setHits] = useState(0);
    const [missed, setMissed] = useState(0);
    const pressed = useRef<Set<number>>(new Set());
    const [flash, setFlash] = useState<"none" | "press" | "hit" | "miss">("none");
  
    /* ───────────── build sequence once ───────────── */
    const stream = useMemo<Stimulus[]>(() => {
      const out: Stimulus[] = [];
      for (let i = 0; i < settings.total; i++) {
        if (i < settings.n) {
          out.push({ id: i, letter: ALPHABET[Math.floor(Math.random() * ALPHABET.length)] });
          continue;
        }
        if (Math.random() < MATCH_RATE) {
          out.push({ id: i, letter: out[i - settings.n].letter });
        } else {
          let letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          while (letter === out[i - settings.n].letter) {
            letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          }
          out.push({ id: i, letter });
        }
      }
      return out;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    /* ───────────── ticker ───────────── */
    useInterval(() => setIdx((i) => i + 1), idx < settings.total ? settings.paceMs : null);
  
    /* ───────────── mark missed matches ───────────── */
    useEffect(() => {
      const prev = idx - 1;
      if (prev < settings.n) return;
      if (prev >= 0 && prev < stream.length) {
        const wasMatch = stream[prev].letter === stream[prev - settings.n].letter;
        if (wasMatch && !pressed.current.has(prev)) {
          setMissed((m) => m + 1);
        }
      }
    }, [idx, settings.n, stream]);
  
    /* ───────────── speech synthesis ───────────── */
    useEffect(() => {
      if (!settings.useAudio) return;
      if (idx < 0 || idx >= stream.length) return;
      const utter = new SpeechSynthesisUtterance(stream[idx].letter);
      utter.lang = "en-US";
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    }, [idx, settings.useAudio, stream]);
  
    /* ───────────── flash fade reset ───────────── */
    useEffect(() => {
      if (flash === "none") return;
      const t = setTimeout(() => setFlash("none"), 200);
      return () => clearTimeout(t);
    }, [flash]);
  
    /* ───────────── key handler ───────────── */
    const handleKey = useCallback(
      (e: KeyboardEvent) => {
        if (e.code !== "Space") return;
        if (idx < settings.n) {
          setFlash("press");
          return;
        }
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
      [idx, settings.n, stream]
    );
  
    useEffect(() => {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [handleKey]);
  
    /* ───────────── finish & emit stats ───────────── */
    useEffect(() => {
      if (idx === settings.total) {
        // account for last stimulus miss
        const last = idx - 1;
        if (last >= settings.n) {
          const wasMatch = stream[last].letter === stream[last - settings.n].letter;
          if (wasMatch && !pressed.current.has(last)) {
            setMissed((m) => m + 1);
          }
        }
        const accuracy = attempts ? hits / attempts : 0;
        onFinish({ hits, missed, attempts, accuracy });
      }
    }, [idx, settings, attempts, hits, missed, onFinish, stream]);
  
    /* ───────────── helpers ───────────── */
    const currentLetter = idx >= 0 && idx < stream.length ? stream[idx].letter : "–";
  
    const ringCls =
      flash === "hit"
        ? "ring-8 ring-lime-400 ring-offset-2"
        : flash === "miss"
        ? "ring-8 ring-rose-400 ring-offset-2"
        : "";
    const pressCls = flash === "press" ? "scale-90" : "scale-100";
  
    /* ───────────── UI ───────────── */
    return (
      <div className="glass-card w-full max-w-xl space-y-8">
        <p className="text-center text-sm text-gray-600">
          Hit <kbd className="kbd">Space</kbd> when the current letter equals the one <b>n = 2</b> back.
        </p>
  
        <div className={`flex items-center justify-center transition-transform duration-150 ${pressCls} ${ringCls}`}>
          <span className="select-none text-[10rem] font-extrabold tracking-widest bg-gradient-to-br from-indigo-500 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(99,102,241,0.45)] animate-pulse">
            {currentLetter}
          </span>
        </div>
  
        <ProgressBar value={Math.min(idx + 1, settings.total) / settings.total} />
  
        <div className="grid grid-cols-4 gap-6 text-center">
          <Stat label="Hits" value={hits} />
          <Stat label="Missed" value={missed} />
          <Stat label="Attempts" value={attempts} />
          <Stat label="Index" value={Math.max(idx + 1, 0)} />
        </div>
      </div>
    );
  };
  
  const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
  