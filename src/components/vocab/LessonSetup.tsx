import React, { useState } from "react";
import bank, { Word } from "../../data/words.cn";  // flat word list

interface Props {
  onStart: (lessons: Word[][]) => void;
}

export const LessonSetup: React.FC<Props> = ({ onStart }) => {
  const MAX = Math.min(bank.length, 30);          // cap slider if desired
  const [size, setSize] = useState(10);

  /* shuffle + chunk helper */
  const buildLessons = (chunk: number): Word[][] => {
    const arr = [...bank];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const out: Word[][] = [];
    for (let i = 0; i < arr.length; i += chunk) out.push(arr.slice(i, i + chunk));
    return out;
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-extrabold text-indigo-700">Words per lesson</h2>

      <input
        type="range"
        min={3}
        max={MAX}
        value={size}
        onChange={(e) => setSize(+e.target.value)}
        className="w-64"
      />
      <p className="text-lg font-mono">{size}</p>

      <button
        onClick={() => onStart(buildLessons(size))}
        className="rounded-full bg-indigo-600 px-10 py-3 font-semibold text-white shadow transition hover:bg-indigo-700">
        Start course
      </button>

      <p className="text-sm text-gray-500 mt-4">
        Total words: {bank.length}
      </p>
    </div>
  );
};
