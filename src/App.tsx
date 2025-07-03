import React, { useState } from "react";
import { NBackGame, GameStats } from "./components/NBackGame";
import { PVTTask,  PVTStats }  from "./components/PVTTask";
import { GameSettings }        from "./types";

/* 📚 vocabulary */
import { LessonSetup }    from "./components/vocab/LessonSetup";
import { LessonPractice } from "./components/vocab/LessonPractice";
import type { Word }      from "./data/words.cn";

/* ------------------------------------------------------------------ */
/*  Pages                                                             */
/* ------------------------------------------------------------------ */
type Page =
  | "menu"
  | "nback"
  | "pvt"
  | "vocab-setup"
  | { lessons: Word[][]; idx: number };   // idx = which lesson we’re on

export default function App() {
  const [page,     setPage]     = useState<Page>("menu");
  const [tutorial, setTutorial] = useState<null | "nback" | "pvt">(null);

  const nbackCfg: GameSettings = { n: 2, total: 30, paceMs: 1500, useAudio: false };

  const [nStats,  setNStats]  = useState<GameStats | null>(null);
  const [pvtStats,setPvtStats]= useState<PVTStats | null>(null);

  /* helpers */
  const backToMenu = () => setPage("menu");
  const launchTask = (t: "nback" | "pvt") => setTutorial(t);
  const startTask  = (t: "nback" | "pvt") => { setTutorial(null); setPage(t); };

  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center
                    bg-gradient-to-br from-rose-50 via-indigo-50 to-sky-100">

      {/* ───────── Menu ───────── */}
      {page === "menu" && (
        <Menu
          nStats={nStats}
          pvtStats={pvtStats}
          onNBack={() => launchTask("nback")}
          onPVT={()   => launchTask("pvt")}
          onVocab={() => setPage("vocab-setup")}
        />
      )}

      {/* ───────── 2-Back ───────── */}
      {page === "nback" && (
        <NBackGame
          settings={nbackCfg}
          onFinish={s => { setNStats(s); backToMenu(); }}
        />
      )}

      {/* ───────── Vigilance ───────── */}
      {page === "pvt" && (
        <PVTTask
          onFinish={s => { setPvtStats(s); backToMenu(); }}
        />
      )}

      {/* ───────── Vocab setup ───────── */}
      {page === "vocab-setup" && (
        <LessonSetup
          onStart={chunks => setPage({ lessons: chunks, idx: 0 })}
        />
      )}

      {/* ───────── Vocab practice ───────── */}
      {typeof page === "object" && "lessons" in page && (
        <LessonPractice
          words={page.lessons[page.idx]}            /* <- idx */
          lessonNum={page.idx + 1}                  /* <- idx */
          totalLessons={page.lessons.length}
          onDone={() => {
            const next = page.idx + 1;              /* <- idx */
            next < page.lessons.length
              ? setPage({ lessons: page.lessons, idx: next })  /* <- idx */
              : setPage("menu");
          }}
        />
      )}

      {/* ───────── Tutorial overlay ───────── */}
      {tutorial && (
        <TutorialModal
          task={tutorial}
          onClose={() => setTutorial(null)}
          onStart={() => startTask(tutorial)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Menu                                                              */
/* ------------------------------------------------------------------ */
const btn =
  "rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg " +
  "transition hover:bg-indigo-700";

const Menu: React.FC<{
  nStats:  GameStats | null;
  pvtStats: PVTStats | null;
  onNBack: () => void;
  onPVT:   () => void;
  onVocab: () => void;
}> = ({ nStats, pvtStats, onNBack, onPVT, onVocab }) => (
  <div className="space-y-8 text-center">
    <h1 className="text-4xl font-extrabold text-indigo-700">Cognitive Lab</h1>

    <div className="flex flex-col gap-4 max-w-xs mx-auto">
      <button onClick={onNBack} className={btn}>Play 2-Back</button>
      <button onClick={onPVT}  className={btn}>Vigilance Test</button>
      <button onClick={onVocab} className={btn}>📚 Chinese Vocab</button>
    </div>

    {nStats && (
      <Summary title="2-Back result">
        <p>Hits: {nStats.hits}</p>
        <p>Missed: {nStats.missed}</p>
        <p>Attempts: {nStats.attempts}</p>
        <p>Accuracy: {(nStats.accuracy * 100).toFixed(1)}%</p>
      </Summary>
    )}

    {pvtStats && (
      <Summary title="PVT result">
        <p>Mean RT: {pvtStats.meanRt} ms</p>
        <p>Median RT: {pvtStats.medianRt} ms</p>
        <p>Lapses &gt;500 ms: {pvtStats.lapses}</p>
        <p>False starts: {pvtStats.falseStarts}</p>
      </Summary>
    )}
  </div>
);

const Summary: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div className="mx-auto w-full max-w-xs space-y-2 rounded-2xl bg-white/60 p-4 shadow">
    <h2 className="text-lg font-bold text-indigo-700">{title}</h2>
    <div className="space-y-1 text-sm text-gray-700">{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Tutorial modal (unchanged)                                        */
/* ------------------------------------------------------------------ */
interface TutProps {
  task: "nback" | "pvt";
  onClose: () => void;
  onStart: () => void;
}

const slides: Record<
  "nback" | "pvt",
  { title: string; body: string; emoji: string }[]
> = {
  nback: [
    {
      title: "Match 2-Back",
      emoji: "🔠",
      body: "A letter appears every 1.5 s.\nPress <Space> when the current letter matches the one two steps before."
    },
    {
      title: "Scoring",
      emoji: "🎯",
      body: "Hits = correct presses.\nMisses = no press on a match.\nStay focused!"
    }
  ],
  pvt: [
    {
      title: "React Fast!",
      emoji: "🟢",
      body: "Wait until the green circle lights up,\nthen tap or hit <Space> as fast as you can."
    },
    {
      title: "Avoid False Starts",
      emoji: "⛔",
      body: "Pressing early resets the trial\nand counts as a false start."
    }
  ]
};

const TutorialModal: React.FC<TutProps> = ({ task, onClose, onStart }) => {
  const [i, setI] = useState(0);
  const f = slides[task][i];
  const last = i === slides[task].length - 1;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
      <div className="relative w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-2xl">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl font-bold text-gray-400 hover:text-gray-600">
          ×
        </button>

        <div className="text-center space-y-4">
          <div className="text-5xl">{f.emoji}</div>
          <h3 className="text-2xl font-bold text-indigo-700">{f.title}</h3>
          {f.body.split("\n").map((line, k) => (
            <p key={k} className="text-gray-700">{line}</p>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            disabled={i === 0}
            onClick={() => setI(v => v - 1)}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40">
            Back
          </button>
          {last ? (
            <button onClick={onStart} className={btn}>Start</button>
          ) : (
            <button onClick={() => setI(v => v + 1)} className={btn}>Next</button>
          )}
        </div>
      </div>
    </div>
  );
};
