import React from "react";
import { FlashCard } from "./FlashCard";
import type { Word } from "../../data/words.cn";

export const LessonPractice: React.FC<{
  words: Word[];
  lessonNum: number;
  totalLessons: number;
  onDone: () => void;
}> = ({ words, lessonNum, totalLessons, onDone }) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-3xl font-extrabold text-indigo-700">
        Lesson {lessonNum} / {totalLessons}
      </h2>

      {/* 🟢  now stretches full width and wraps nicely */}
      <div className="grid w-full max-w-7xl gap-8
                      grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {words.map(w => <FlashCard key={w.hanzi} word={w} />)}
      </div>

      <button
        onClick={onDone}
        className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
        Finish lesson
      </button>
    </div>
  );
};