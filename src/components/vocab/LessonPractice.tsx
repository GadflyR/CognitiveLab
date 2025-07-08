// src/components/vocab/LessonPractice.tsx
import React, { useState, useEffect } from "react";
import { FlashCard } from "./FlashCard";
import type { Word } from "../../data/words.cn";

export const LessonPractice: React.FC<{
  words: Word[];
  lessonNum: number;
  totalLessons: number;
  onDone: () => void;
}> = ({ words, lessonNum, totalLessons, onDone }) => {
  // three phases: intro → learn → break
  const [phase, setPhase] = useState<"intro" | "learn" | "break">("intro");
  const [count, setCount] = useState(10);

  // countdown during break
  useEffect(() => {
    if (phase !== "break") return;
    const id = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(id);
          // reset for next
          setPhase("learn");
          setCount(10);
          onDone();           // advance parent
          return 10;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, onDone]);

  // --------------- intro screen ---------------
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[60vh] px-6">
        <h2 className="text-3xl font-extrabold text-indigo-700">
          Lesson {lessonNum} of {totalLessons}
        </h2>
        <div className="max-w-2xl text-gray-700 space-y-4 text-center">
          <p>You will be seeing vocabulary from Toki Pona, an extremely simplistic language created in 2001.</p>
          <p>Try your best to memorize the words. It's okay if you can't recall them all.</p>
          <p>
            The vocabulary is split into several pages. You must finish each page
            before moving on—you won’t be able to go back.
          </p>
          <p>
            After the last page, there will be a quiz on everything you've learned.
          </p>
          <p>Between each page (and before the quiz) there will be a 10-second break.</p>
        </div>
        <button
          onClick={() => setPhase("learn")}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700"
        >
          Start Lesson {lessonNum}
        </button>
      </div>
    );
  }

  // --------------- learning screen ---------------
  if (phase === "learn") {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
        <h2 className="text-3xl font-extrabold text-indigo-700">
          Lesson {lessonNum} / {totalLessons}
        </h2>

        <div
          className="grid w-full max-w-7xl gap-8
             grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
        >
          {words.map(w => (
            <FlashCard key={w.hanzi} word={w} />
          ))}
        </div>

        <button
          onClick={() => {
            setPhase("break");
            setCount(10);
          }}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700"
        >
          Finish Lesson
        </button>
      </div>
    );
  }

  // --------------- break screen ---------------
  const subtitle =
    lessonNum === totalLessons ? "Quiz begins in" : "Next lesson begins in";

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
      <h2 className="text-4xl font-extrabold text-indigo-700">Break</h2>
      <p className="text-lg text-gray-700">{subtitle}</p>
      <p className="text-6xl font-bold text-indigo-600">{count}</p>
    </div>
  );
};
