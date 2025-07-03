import React, { useEffect, useMemo, useState } from "react";
import type { Word } from "../../data/words.cn";
import bank from "../../data/words.cn";

/* how many Qs; pull from full bank so it can be reused any time */
const QUESTION_CT = 10;

export const QuizPage: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  /* -------- make a random sample of words -------- */
  const questions = useMemo<Word[]>(() => {
    const shuffled = [...bank];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, QUESTION_CT);
  }, []);

  /* -------- state -------- */
    const [selected, setSelected] = useState<string | null>(null);
    const [score,    setScore]    = useState(0);
    const [idx,      setIdx]      = useState(0);

    /* -------- options (1 right + 3 wrong) -------- */
    const options = useMemo(() => {
    const wrong = bank.filter(w => w.en !== questions[idx].en);
    const picks = wrong.sort(() => 0.5 - Math.random()).slice(0, 3);
    return [...picks, questions[idx]].sort(() => 0.5 - Math.random());
    }, [idx, questions]);

    /* -------- click handler -------- */
    const handleClick = (en: string) => {
    setSelected(en);
    if (en === questions[idx].en) setScore(s => s + 1);
    };

    /* -------- render -------- */
    return (
    <div className="flex flex-col items-center gap-8">
        <h2 className="text-3xl font-extrabold text-indigo-700">
        Quiz {idx + 1} / {questions.length}
        </h2>

        <p className="text-6xl font-bold">{questions[idx].hanzi}</p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {options.map(opt => {
            const correct = selected !== null && opt.en === questions[idx].en;
            const wrong   = selected === opt.en && opt.en !== questions[idx].en;
            return (
            <button
                key={opt.en}
                disabled={selected !== null}
                onClick={() => handleClick(opt.en)}
                className={
                "rounded-xl px-4 py-2 font-semibold shadow transition " +
                (selected === null
                    ? "bg-white hover:bg-gray-100"
                    : correct
                    ? "bg-lime-500 text-white"
                    : wrong
                    ? "bg-rose-500 text-white"
                    : "bg-gray-200 text-gray-600")
                }
            >
                {opt.en}
            </button>
            );
        })}
        </div>

        {selected !== null && (
        <button
            onClick={() =>
            idx + 1 < questions.length
                ? (setIdx(i => i + 1), setSelected(null))
                : onDone()
            }
            className="rounded-full bg-indigo-600 px-8 py-3 text-white font-semibold shadow hover:bg-indigo-700"
        >
            {idx + 1 < questions.length
            ? "Next"
            : `Finish (${score}/${questions.length})`}
        </button>
        )}
    </div>
    );
};
