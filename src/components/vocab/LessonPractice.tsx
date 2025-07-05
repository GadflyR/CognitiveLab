import React, { useState, useEffect } from "react";
import { FlashCard } from "./FlashCard";
import type { Word } from "../../data/words.cn";

export const LessonPractice: React.FC<{
  words: Word[];
  lessonNum: number;
  totalLessons: number;
  onDone: () => void;
}> = ({ words, lessonNum, totalLessons, onDone }) => {
  const [phase, setPhase] = useState<"learn" | "break">("learn");
  const [count, setCount] = useState(10);

  /* ---------- countdown when phase === "break" ---------- */
  useEffect(() => {
    if (phase !== "break") return;

    const id = setInterval(() =>
      setCount(c => {
        if (c <= 1) {
          clearInterval(id);
          /* reset for potential future use */
          setPhase("learn");
          setCount(10);
          onDone();                      // advance parent
          return 10;
        }
        return c - 1;
      })
    , 1000);

    return () => clearInterval(id);
  }, [phase, onDone]);

  /* ---------- learning screen ---------- */
  if (phase === "learn") {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
        <h2 className="text-3xl font-extrabold text-indigo-700">
          Lesson {lessonNum} / {totalLessons}
        </h2>

        <div className="grid w-full max-w-7xl gap-8
                        grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {words.map(w => <FlashCard key={w.hanzi} word={w} />)}
        </div>

        <button
          onClick={() => { setPhase("break"); setCount(10); }}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
          Finish lesson
        </button>
      </div>
    );
  }

  /* ---------- 10-s break screen ---------- */
  const subtitle =
    lessonNum === totalLessons
      ? "Quiz begins in"
      : "Next lesson begins in";

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
      <h2 className="text-4xl font-extrabold text-indigo-700">Break</h2>
      <p className="text-lg text-gray-700">{subtitle}</p>
      <p className="text-6xl font-bold text-indigo-600">{count}</p>
    </div>
  );
};
