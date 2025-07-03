import React, { useState } from "react";
import { FlashCard } from "./FlashCard";
import type { Word } from "../../data/words.cn";

export const LessonPractice: React.FC<{
  words: Word[];
  lessonNum: number;
  totalLessons: number;
  perPage?: number;           // NEW
  onDone: () => void;
}> = ({ words, lessonNum, totalLessons, perPage = 6, onDone }) => {
  const [page, setPage] = useState(0);
  const totalPages      = Math.ceil(words.length / perPage);
  const slice           = words.slice(page * perPage, (page + 1) * perPage);

  const next = () =>
    page + 1 < totalPages ? setPage(p => p + 1) : onDone();

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-3xl font-extrabold text-indigo-700">
        Lesson {lessonNum} / {totalLessons}
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6">
        {slice.map(w => <FlashCard key={w.hanzi} word={w} />)}
      </div>

      <button
        onClick={next}
        className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow hover:bg-indigo-700">
        {page + 1 < totalPages ? "Next page" : "Finish lesson"}
      </button>

      {totalPages > 1 && (
        <p className="text-sm text-gray-500">
          Page {page + 1} / {totalPages}
        </p>
      )}
    </div>
  );
};
