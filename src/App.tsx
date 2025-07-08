import React, { useState } from "react";
import { ProgressBar } from "./components/ProgressBar";
import { NBackGame, GameStats } from "./components/NBackGame";
import { PVTTask, PVTStats } from "./components/PVTTask";
import { GameSettings } from "./types";

import { LessonSetup } from "./components/vocab/LessonSetup";
import { LessonPractice } from "./components/vocab/LessonPractice";
import { QuizPage, QuizResult } from "./components/vocab/QuizPage";
import { SlideShowTask } from "./components/attention/SlideShowTask";
import allWords, { Word } from "./data/words.cn";

function mapPerformanceToChunk(n: number, v: number, s: number) {
  // average the three
  const avg = (n + v + s) / 3
  // linearly scale that into a word-per-page range, e.g. 8–20
  const minWords = 8, maxWords = 20
  return Math.round(minWords + (avg/100) * (maxWords - minWords))
}
/* ───────── helpers ───────── */
const shuffle = <T,>(arr: ReadonlyArray<T>): T[] => {
  const a = [...arr] as T[];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const makeLessons = (chunk: number): Word[][] => {
  const src = shuffle(allWords);
  const out: Word[][] = [];
  for (let i = 0; i < src.length; i += chunk) {
    out.push(src.slice(i, i + chunk));
  }
  return out;
};

/* ───────── routing types ───────── */
type VocabFlow = { lessons: Word[][]; idx: number };
type FullFlow = {
  mode: "adaptive" | "control";
  fullStage: number; // 0–6
  lessons: Word[][];
  idx: number;
  nScore?: number;
  vScore?: number;
  sScore?: number;
};
type Page =
  | "menu"
  | "nback"
  | "pvt"
  | "slideshow"
  | "vocab-setup"
  | "quiz"
  | VocabFlow
  | FullFlow;

/* ───────── constants ───────── */
const NBACK_CFG: GameSettings = {
  n: 2,
  total: 30,
  paceMs: 1500,
  useAudio: false,
};
const ADAPT_LESSON = 12;
const CTRL_LESSON = 10;

/* ================================================================== */
export default function App() {
  /* derive initial page from hash/path */
  const path = window.location.pathname;
  const hash = window.location.hash;
  const isFull =
    hash === "#fulltest" || /\/fulltest$/.test(path);
  const isCtrl =
    hash === "#fulltestcontrol" || /\/fulltestcontrol$/.test(path);

  const initialPage: Page = isFull
    ? { mode:"adaptive", fullStage:0, lessons:[], idx:0 }
    : isCtrl
    ? { mode: "control", fullStage: 0, lessons: makeLessons(CTRL_LESSON), idx: 0 }
    : "menu";

  const [page, setPage] = useState<Page>(initialPage);
  const [overlay, setOverlay] = useState<null | "nback" | "pvt">(null);
  const [nStats, setNStats] = useState<GameStats | null>(null);
  const [pvtStats, setPvtStats] = useState<PVTStats | null>(null);

  const startFullAdaptive = () =>
    setPage({ mode:"adaptive", fullStage:0, lessons:[], idx:0 });
  const startFullControl = () =>
    setPage({ mode: "control", fullStage: 0, lessons: makeLessons(CTRL_LESSON), idx: 0 });

  const isFullFlow = typeof page === "object" && "fullStage" in page;

  return (
    <>
      {/* ─── MASTER full-test progress (top) ─── */}
      {isFullFlow && (
        <div className="fixed top-0 left-0 w-full h-2 z-50 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
            style={{ width: `${(page.fullStage / 6) * 100}%` }}
          />
        </div>
      )}

      <div
        className="min-h-screen p-8 flex flex-col items-center justify-center
                    bg-gradient-to-br from-rose-50 via-indigo-50 to-sky-100"
      >
        {/* ─── MENU ─── */}
        {page === "menu" && (
          <Menu
            nStats={nStats}
            pvtStats={pvtStats}
            onNBack={() => setOverlay("nback")}
            onPVT={() => setOverlay("pvt")}
            onSlide={() => setPage("slideshow")}
            onVocab={() => setPage("vocab-setup")}
            onQuiz={() => setPage("quiz")}
            onFullAdaptive={startFullAdaptive}
            onFullControl={startFullControl}
          />
        )}

        {/* ─── stand-alone tasks ─── */}
        {page === "nback" && (
          <NBackGame
            settings={NBACK_CFG}
            onFinish={(s) => {
              setNStats(s);
              setPage("menu");
            }}
          />
        )}
        {page === "pvt" && (
          <PVTTask
            onFinish={(s) => {
              setPvtStats(s);
              setPage("menu");
            }}
          />
        )}
        {page === "slideshow" && <SlideShowTask onFinish={() => setPage("menu")} />}

        {/* ─── **NEW** vocab flow ─── */}
        {typeof page === "object" &&
         "lessons" in page &&
         "idx" in page &&
         !("fullStage" in page) && (
          <LessonPractice
            words={page.lessons[page.idx]}
            lessonNum={page.idx + 1}
            totalLessons={page.lessons.length}
            onDone={() => {
              const next = page.idx + 1;
              next < page.lessons.length
                ? setPage({ lessons: page.lessons, idx: next })
                : setPage("menu");
            }}
          />
        )}

        {page === "vocab-setup" && (
          <LessonSetup onStart={(chunks) => setPage({ lessons: chunks, idx: 0 })} />
        )}

        {page === "quiz" && <QuizPage onDone={() => setPage("menu")} />}

        {/* ─── FULL TEST flow ─── */}
        {isFullFlow &&
          (() => {
            switch (page.fullStage) {
              case 0:
                return (
                  <TutorialModal
                    task="nback"
                    onClose={() => setPage("menu")}
                    onStart={() => setPage({ ...page, fullStage: 1 })}
                  />
                );
              case 1:
                return (
                  <NBackGame
                    settings={NBACK_CFG}
                    onFinish={(s) =>
                      setPage({ ...page, fullStage: 2, nScore: s.accuracy * 100 })
                    }
                  />
                );
              case 2:
                return (
                  <TutorialModal
                    task="pvt"
                    onClose={() => setPage("menu")}
                    onStart={() => setPage({ ...page, fullStage: 3 })}
                  />
                );
              case 3:
                return (
                  <PVTTask
                    onFinish={(s: PVTStats) => {
                      const half = Math.floor(s.rts.length / 2);
                      const meanOf = (xs: number[]) => xs.reduce((t, v) => t + v, 0) / xs.length;
                      const meanOverall = meanOf(s.rts);
                      // 1) consistency score (0–100)
                      const delta = meanOf(s.rts.slice(half)) - meanOf(s.rts.slice(0, half));
                      const consistency = Math.max(
                        0,
                        Math.min(100, 100 - (delta / meanOverall) * 200)
                      );
                      // 2) speed score (0–100), assume 200 ms is floor, 500 ms is ceiling
                      const speedScore = Math.max(
                        0,
                        Math.min(
                          100,
                          ((500 - meanOverall) / (500 - 200)) * 100
                        )
                      );
                      // 3) false start penalty score (0–100)
                      const falsePenalty = Math.max(
                        0,
                        100 - (s.falseStarts / s.trials) * 100
                      );
                      // composite: give consistency the most weight
                      const vScore = Math.round(
                        0.6 * consistency +
                        0.3 * speedScore +
                        0.1 * falsePenalty
                      );
              
                      setPage({ ...page, fullStage: 4, vScore });
                    }}
                  />
                );
              case 4:
                return (
                  <SlideShowTask
                    hideScore      /* new flag to suppress its results page */
                    onFinish={s => {
                      const withSlide = { ...page, fullStage: 5, sScore: s.score };
              
                      if (page.mode === "adaptive") {
                        // compute chunk from all three
                        const chunk = mapPerformanceToChunk(
                          page.nScore!,
                          page.vScore!,
                          s.score
                        );
                        // build your lessons now
                        const lessons = makeLessons(chunk);
                        setPage({ ...withSlide, lessons, idx: 0 });
                      } else {
                        // control group already has lessons
                        setPage(withSlide);
                      }
                    }}
                  />
                );
              case 5:
                return (
                  <LessonPractice
                    words={page.lessons[page.idx]}
                    lessonNum={page.idx+1}
                    totalLessons={page.lessons.length}
                    onDone={() => {
                      const next = page.idx + 1
                      if (next < page.lessons.length) {
                        setPage({ ...page, idx: next })
                      } else {
                        setPage({ ...page, fullStage:6 })
                      }
                    }}
                  />
                )
              case 6:
                return (
                  <QuizPage
                    onDone={(results: QuizResult[]) => {
                      // assemble everything
                      const numPages    = page.lessons.length;
                      const wordsPerPage = page.lessons.map(p => p.length);
                      const payload = {
                        mode: page.mode,
                        nBack: page.nScore,
                        pvt: page.vScore,
                        slide: page.sScore,
                        vocab: {
                          numPages,
                          wordsPerPage
                        },
                        quiz: results,
                      };

                      // trigger download
                      const blob = new Blob(
                        [JSON.stringify(payload, null, 2)],
                        { type: "application/json" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "cognitive_lab_results.json";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);

                      // (no need to navigate back to menu)
                    }}
                  />
                );
              default:
                return null;
            }
          })()}

        {/* ─── standalone tutorial overlay ─── */}
        {overlay && (
          <TutorialModal
            task={overlay}
            onClose={() => setOverlay(null)}
            onStart={() => {
              setOverlay(null);
              setPage(overlay);
            }}
          />
        )}
      </div>
    </>
  );
}

/* ---------------- Menu ---------------- */
const btn =
  "rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-indigo-700";

const Menu: React.FC<{
  nStats: GameStats | null;
  pvtStats: PVTStats | null;
  onNBack: () => void;
  onPVT: () => void;
  onSlide: () => void;
  onVocab: () => void;
  onQuiz: () => void;
  onFullAdaptive: () => void;
  onFullControl: () => void;
}> = ({
  nStats,
  pvtStats,
  onNBack,
  onPVT,
  onSlide,
  onVocab,
  onQuiz,
  onFullAdaptive,
  onFullControl,
}) => (
  <div className="space-y-8 text-center">
    <h1 className="text-4xl font-extrabold text-indigo-700">
      Cognitive Lab
    </h1>
    <div className="flex flex-col gap-4 max-w-xs mx-auto">
      <button onClick={onNBack} className={btn}>
        Play 2-Back
      </button>
      <button onClick={onPVT} className={btn}>
        Vigilance Test
      </button>
      <button onClick={onSlide} className={btn}>
        🖼️ Slide Attention
      </button>
      <button onClick={onVocab} className={btn}>
        📚 Toki Pona Vocab
      </button>
      <button onClick={onQuiz} className={btn}>
        ❓ Meaning Quiz
      </button>
      <button onClick={onFullAdaptive} className={btn}>
        🧩 Full Test (adaptive)
      </button>
      <button onClick={onFullControl} className={btn}>
        🧩 Full Test (control)
      </button>
    </div>

    {nStats && (
      <Summary title="2-Back result">
        <p>Hits: {nStats.hits}</p>
        <p>Missed: {nStats.missed}</p>
        <p>Attempts: {nStats.attempts}</p>
        <p>
          Accuracy: {(nStats.accuracy * 100).toFixed(1)}%
        </p>
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

const Summary: React.FC<React.PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => (
  <div className="mx-auto max-w-xs rounded-2xl bg-white/60 p-4 shadow space-y-1">
    <h2 className="text-lg font-bold text-indigo-700">{title}</h2>
    <div className="text-sm text-gray-700 space-y-1">{children}</div>
  </div>
);

/* ───────── TutorialModal (unchanged) ───────── */
interface TutProps {
  task: "nback" | "pvt";
  onClose: () => void;
  onStart: () => void;
}

const slides: Record<"nback" | "pvt", { title: string; body: string; emoji: string }[]> = {
  nback: [
    {
      title: "1st Game: Match 2-Back",
      emoji: "🔠",
      body: "N-back is a widely recognized cognitive test for measuring working memory capacity.\nA letter appears on the screen every 1.5 s.\nPress <Space> when it matches the one two steps before.",
    },
    {
      title: "Scoring",
      emoji: "🎯",
      body: "Hits = correct presses.\nMisses = no press on a match.\nStay focused!\nHere is a short tutorial to get you familiar with the gameplay.",
    },
  ],
  pvt: [
    {
      title: "2nd Game: React Fast!",
      emoji: "🟢",
      body: "This is a game measuring your vigilance.\nWait until the green circle lights up,\nthen tap or hit <Space> once as fast as you can.",
    },
    {
      title: "Avoid False Starts",
      emoji: "⛔",
      body: "Pressing early resets the trial\nand counts as a false start.",
    },
  ],
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
          className="absolute right-4 top-4 text-xl font-bold text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
        <div className="text-center space-y-4">
          <div className="text-5xl">{f.emoji}</div>
          <h3 className="text-2xl font-bold text-indigo-700">{f.title}</h3>
          {f.body.split("\n").map((l, k) => (
            <p key={k} className="text-gray-700">
              {l}
            </p>
          ))}
        </div>
        <div className="flex justify-between pt-4">
          <button
            disabled={i === 0}
            onClick={() => setI((v) => v - 1)}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
          >
            Back
          </button>
          {last ? (
            <button onClick={onStart} className={btn}>
              Start
            </button>
          ) : (
            <button onClick={() => setI((v) => v + 1)} className={btn}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
