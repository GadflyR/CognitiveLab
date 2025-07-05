import React, { useState, useRef } from "react";

interface Slide { title: string; body: string; }

const SLIDES: Slide[] = [
  { title: "Working Memory",        body: "Working memory is the mental workspace where we temporarily hold and manipulate information—like remembering a phone number just long enough to dial it." },
  { title: "Selective Attention",   body: "Selective attention allows us to focus on what matters and filter out distractions—for example, hearing your name in a noisy room." },
  { title: "Sustained Attention",   body: "Sustained attention keeps us on-task during long or repetitive activities, such as proofreading or monitoring a radar screen." },
  { title: "Cognitive Load",        body: "Cognitive load refers to the amount of working-memory resources in use. Overload can lead to errors and slows learning." },
  { title: "The Role of Sleep",     body: "During sleep, memories are consolidated. REM and deep-sleep stages both strengthen different aspects of learning." },
  { title: "Mind-Wandering",        body: "When the mind drifts, performance drops. Brief mindfulness breaks can reduce mind-wandering and improve focus." },
  { title: "Practice & Plasticity", body: "Repeated practice literally rewires synaptic connections, strengthening the neural circuits responsible for a skill." },
  { title: "Take-away",             body: "Balanced workload, rest, and deliberate practice together maximise both short-term performance and long-term growth." }
];

/* ---------------- stats interface ---------------- */
export interface SlideStats {
  times: number[];
  score: number;   // 0-100 after reading-time penalty
}

export const SlideShowTask: React.FC<{ onFinish: (s: SlideStats) => void }> = ({ onFinish }) => {
  const [idx,  setIdx]  = useState(0);
  const [done, setDone] = useState<SlideStats | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const startRef = useRef(performance.now());
  const timesRef = useRef<number[]>([]);

  const MIN_TIME_THRESHOLD = 1000; // 1 second

  /* -------- next / finish -------- */
  const next = () => {
    const now = performance.now();
    timesRef.current.push(now - startRef.current);
    startRef.current = now;

    if (idx + 1 < SLIDES.length) {
      setIdx(i => i + 1);
    } else {                              /* ----- compute score ----- */
      const t = timesRef.current;
      const mid = Math.floor(t.length / 2);
      const avg = (a:number[]) => a.reduce((s,v)=>s+v,0)/a.length;

      /* consistency component */
      const delta = avg(t.slice(mid)) - avg(t.slice(0, mid));
      const consist = Math.max(0, Math.min(100, 100 - delta / 4)); // 0-100

      /* reading-time penalty */
      const mean   = avg(t);               // overall mean dwell
      const factor =
        mean >= 2000 ? 1
        : mean <= 1000 ? 0.2               // ≤1 s keeps only 20 % of score
        : 0.2 + 0.8 * ((mean - 1000) / 1000);  // linear 1-2 s

      // New: Apply penalty if any slide is read too quickly
      const penalty = t.some(time => time < MIN_TIME_THRESHOLD) ? 0.5 : 1;

      const score = Math.round(consist * factor * penalty); // Apply penalty if any slide is rushed
      setDone({ times: t, score });
    }
  };

  /* -------- Tutorial overlay -------- */
  const TutorialModal = () => (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur">
      <div className="relative w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-2xl">
        <button
          onClick={() => setShowTutorial(false)}
          className="absolute right-4 top-4 text-xl font-bold text-gray-400 hover:text-gray-600">
          ×
        </button>

        <div className="text-center space-y-4">
          <div className="text-5xl">🖼️</div>
          <h3 className="text-2xl font-bold text-indigo-700">Attention Test</h3>
          <p className="text-gray-700">In this task, you will read a series of slides. Focus on each slide and try to maintain your attention throughout the task.</p>
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setShowTutorial(false)}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
            Start
          </button>
        </div>
      </div>
    </div>
  );

  /* -------- render -------- */
  if (done) {
    return (
      <div className="flex flex-col items-center gap-8 max-w-xl bg-white/80 p-10 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-extrabold text-indigo-700">Attention Score</h2>
        <p className="text-5xl font-bold text-indigo-600">{done.score}</p>

        <table className="text-sm text-left">
          <thead><tr><th className="pr-4">Slide</th><th>Time&nbsp;(ms)</th></tr></thead>
          <tbody>
            {done.times.map((ms,i)=>(<tr key={i}><td className="pr-4">{i+1}</td><td>{Math.round(ms)}</td></tr>))}
          </tbody>
        </table>

        <button
          onClick={()=>onFinish(done)}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
          Back to menu
        </button>
      </div>
    );
  }

  const s = SLIDES[idx];
  return (
    <div className="flex flex-col items-center gap-12 max-w-xl bg-white/80 p-10 rounded-3xl shadow-lg">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-indigo-700">{s.title}</h2>
        <p className="leading-relaxed text-gray-800">{s.body}</p>
      </div>

      <button
        onClick={next}
        className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
        {idx + 1 < SLIDES.length ? "Next" : "Finish"}
      </button>

      <p className="text-sm text-gray-500">
        Slide {idx + 1} / {SLIDES.length}
      </p>

      {/* Show tutorial if user hasn't started the task yet */}
      {showTutorial && <TutorialModal />}
    </div>
  );
};
