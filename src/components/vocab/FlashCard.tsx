import React, { useState } from "react";

interface CardProps {
  word: { hanzi: string; pinyin: string; en: string };
  onAnswer: (correct: boolean) => void;
}

export const FlashCard: React.FC<CardProps> = ({ word, onAnswer }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="w-72 rounded-3xl bg-white shadow-xl p-8 space-y-6 text-center">
      <p className="text-5xl font-bold tracking-widest">{word.hanzi}</p>

      {revealed && (
        <>
          <p className="text-xl text-indigo-600">{word.pinyin}</p>
          <p className="text-lg text-gray-700">{word.en}</p>
        </>
      )}

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="btn w-full"
        >
          Show meaning
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => onAnswer(false)}
            className="btn w-1/2 bg-rose-500 hover:bg-rose-600"
          >
            ❌ Oops
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="btn w-1/2 bg-lime-500 hover:bg-lime-600"
          >
            ✅ Got it
          </button>
        </div>
      )}
    </div>
  );
};

/* Tailwind shortcut; or import from your existing helpers */
const btn =
  "rounded-xl py-2 font-semibold text-white transition shadow hover:shadow-lg";
