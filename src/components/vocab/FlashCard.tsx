import React, { useState } from "react";
import type { Word } from "../../data/words.cn";

export const FlashCard: React.FC<{ word: Word }> = ({ word }) => {
  /* use “flipped” now, not “show” */
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      onClick={() => setFlipped(v => !v)}
      className="relative h-64 w-48 sm:w-56 [perspective:1200px] focus:outline-none"
    >
      <div
        className={`absolute inset-0 rounded-3xl shadow-xl transition-transform duration-500
                    [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3
                        bg-white rounded-3xl backface-hidden">
          <p className="text-4xl font-bold tracking-widest">{word.hanzi}</p>
          <p className="text-xs text-gray-400">tap to reveal</p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
                        bg-indigo-50 rounded-3xl backface-hidden [transform:rotateY(180deg)]">
          <p className="text-base font-semibold text-indigo-700">{word.pinyin}</p>
          <p className="text-gray-800">{word.en}</p>
          {word.pos && <p className="text-xs text-gray-500">[{word.pos}]</p>}
          {word.example && (
            <p className="text-xs text-gray-600 whitespace-pre-wrap text-left px-4">
              {word.example}
            </p>
          )}
          {word.note && <p className="text-xs italic text-amber-600">{word.note}</p>}
        </div>
      </div>
    </button>
  );
};
