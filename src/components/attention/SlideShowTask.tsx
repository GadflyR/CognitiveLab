import React, { useState, useRef } from "react";

/* ---------- slide data (longer bodies) ---------- */
interface Slide { title: string; body: string; }

const SLIDES: Slide[] = [
  {
    title: "Working Memory",
    body:
      "Working memory is the brain’s temporary scratch-pad. It stores and " +
      "manipulates small chunks of information, such as the digits you hold in " +
      "mind while dialling a phone number or the first half of a sentence you " +
      "are still finishing reading. Because capacity is limited to only a few " +
      "items, efficient chunking and rehearsal strategies are essential for " +
      "complex reasoning and problem-solving."
  },
  {
    title: "Selective Attention",
    body:
      "Selective attention allows us to filter out a sea of irrelevant stimuli " +
      "and focus on what matters right now—like hearing your name across a noisy " +
      "room or spotting the one red apple among green pears. This is achieved by " +
      "boosting the neural representation of relevant features while actively " +
      "suppressing distractors, a dance performed by frontal and parietal " +
      "networks in concert."
  },
  {
    title: "Sustained Attention",
    body:
      "Sustained attention, or vigilance, keeps us on task for extended periods. " +
      "Air-traffic controllers, proof-readers, and competitive gamers all rely on " +
      "this capacity to maintain performance despite monotony. Mental fatigue, " +
      "circadian rhythms, and motivation sharply influence how long vigilance " +
      "can be maintained without lapses."
  },
  {
    title: "Cognitive Load",
    body:
      "Every mental operation consumes working-memory resources; the total " +
      "demand is called cognitive load. When that demand approaches capacity, " +
      "errors and slow-downs erupt. Instructional designers therefore break " +
      "complex material into smaller segments so the learner’s limited buffer is " +
      "never overwhelmed."
  },
  {
    title: "The Role of Sleep",
    body:
      "Sleep is not idle time. During slow-wave sleep the hippocampus replays the " +
      "day’s experiences, consolidating factual memories, while REM sleep " +
      "strengthens procedural skills and emotional regulation. Chronically " +
      "shortening sleep deprives the brain of these phases, eroding learning, " +
      "attention, and mood."
  },
  {
    title: "Mind-Wandering",
    body:
      "Mind-wandering—when thoughts drift from the task at hand—occupies up to " +
      "half of our waking life. Although it can seed creativity, frequent " +
      "mind-wandering during demanding tasks predicts lower comprehension and " +
      "increased error rates. Brief mindfulness breaks have been shown to reduce " +
      "unintentional mind-wandering and restore focus."
  },
  {
    title: "Practice & Plasticity",
    body:
      "Deliberate practice physically remodels synapses. Repetition strengthens " +
      "connections through long-term potentiation, while unused pathways prune " +
      "away. Over time the brain reallocates grey matter to support the specific " +
      "skills being honed—taxi drivers grow a larger spatial-navigation map in " +
      "the hippocampus, and musicians refine motor and auditory regions."
  },
  {
    title: "Take-away",
    body:
      "Peak cognitive performance emerges from the interaction of efficient " +
      "working-memory strategies, well-managed cognitive load, adequate sleep, " +
      "focused attention, and sustained practice. Cultivating each area in " +
      "balance yields the greatest short-term gains and long-term neuroplastic " +
      "benefits."
  }
];

/* ---------- helper: 5-number summary ---------- */
const fiveNumber = (arr: number[]) => {
  const a = [...arr].sort((x, y) => x - y);
  const q = (p: number) => {
    const idx = (a.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (idx - lo);
  };
  return { min: a[0], q1: q(0.25), med: q(0.5), q3: q(0.75), max: a[a.length-1] };
};

/* ---------- component ---------- */
export interface SlideStats { times: number[]; score: number; }

export const SlideShowTask: React.FC<{ onFinish: (s: SlideStats) => void }> = ({ onFinish }) => {
  const [idx, setIdx]   = useState(0);
  const [done, setDone] = useState<SlideStats | null>(null);
  const [showTut, setShowTut] = useState(true);

  const timesRef = useRef<number[]>([]);
  const startRef = useRef(performance.now());

  const MIN_CLICK = 1000;                      // ms – too-rushed threshold

  /* ---------- advance / finish ---------- */
  const next = () => {
    const now = performance.now();
    timesRef.current.push(now - startRef.current);
    startRef.current = now;

    if (idx + 1 < SLIDES.length) {
      setIdx(i => i + 1);
    } else {
      const t   = timesRef.current;
      const mid = Math.floor(t.length / 2);
      const avg = (xs:number[]) => xs.reduce((s,v)=>s+v,0) / xs.length;

      const mean   = avg(t);
      const delta  = avg(t.slice(mid)) - avg(t.slice(0, mid));
      const rel    = delta / mean;                   // proportion slower
      const consist= Math.max(0, Math.min(100, 100 - rel * 120)); // gentler

      const factor =
        mean >= 2000 ? 1 :
        mean <= 1000 ? 0.2 :
        0.2 + 0.8 * ((mean - 1000) / 1000);

      const penalty = t.some(ms => ms < MIN_CLICK) ? 0.5 : 1;
      const score   = Math.round(consist * factor * penalty);

      setDone({ times: t, score });
    }
  };

  /* ---------- RESULT SCREEN ---------- */
  if (done) {
    const stats = fiveNumber(done.times);
    return (
      <div className="flex flex-col items-center gap-8 max-w-2xl bg-white/80 p-10 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-extrabold text-indigo-700">Attention Score</h2>
        <p className="text-5xl font-bold text-indigo-600">{done.score}</p>

        <table className="text-sm text-left">
          <thead>
            <tr><th className="pr-4">Slide</th><th>Time (ms)</th></tr>
          </thead>
          <tbody>
            {done.times.map((ms,i)=>(
              <tr key={i}><td className="pr-4">{i+1}</td><td>{Math.round(ms)}</td></tr>
            ))}
          </tbody>
        </table>

        {/* 5-number summary */}
        <div className="mt-6 w-full max-w-sm">
          <h3 className="font-semibold text-indigo-700 mb-2">5-Number Summary</h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {["Min","Q1","Median","Q3","Max"].map(lbl=>(
              <span key={lbl} className="font-medium">{lbl}</span>
            ))}
            {[
              stats.min, stats.q1, stats.med, stats.q3, stats.max
            ].map((v,i)=>(<span key={i}>{Math.round(v)}</span>))}
          </div>
        </div>

        <button
          onClick={()=>onFinish(done)}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
          Back to menu
        </button>
      </div>
    );
  }

  /* ---------- TUTORIAL OVERLAY ---------- */
  const Tutorial = () => (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur">
      <div className="relative w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-2xl">
        <button onClick={()=>setShowTut(false)}
          className="absolute right-4 top-4 text-xl font-bold text-gray-400 hover:text-gray-600">×</button>

        <div className="text-center space-y-4">
          <div className="text-5xl">🖼️</div>
          <h3 className="text-2xl font-bold text-indigo-700">Slide-Show Attention</h3>
          <p className="text-gray-700">
            Read each slide carefully. Your score rewards <em>consistent time</em>{' '}
            across slides and penalises rushed clicks.
          </p>
        </div>

        <button
          onClick={()=>setShowTut(false)}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
          Start
        </button>
      </div>
    </div>
  );

  /* ---------- SLIDE VIEW ---------- */
  const slide = SLIDES[idx];
  return (
    <div className="flex flex-col items-center gap-12 max-w-2xl bg-white/80 p-10 rounded-3xl shadow-lg">
      <div className="space-y-6 text-left">
        <h2 className="text-2xl font-bold text-indigo-700">{slide.title}</h2>
        <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">{slide.body}</p>
      </div>

      <button
        onClick={next}
        className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
        {idx + 1 < SLIDES.length ? "Next" : "Finish"}
      </button>

      <p className="text-sm text-gray-500">
        Slide {idx + 1} / {SLIDES.length}
      </p>

      {showTut && <Tutorial />}
    </div>
  );
};
