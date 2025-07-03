import React, { useState } from "react";

interface Word {
  hanzi:   string;
  pinyin:  string;
  en:      string;
  pos?:    string;
  note?:   string;
  example?: string;
}

export const FlashCard: React.FC<{ word: Word }> = ({ word }) => {
  const [show, setShow] = useState(false);

  return (
    <button
      onClick={() => setShow((v) => !v)}
      className="w-48 sm:w-56 rounded-3xl bg-white p-6 shadow-xl
                 transition hover:shadow-2xl flex flex-col items-center gap-2"
    >
      <p className="text-4xl font-bold tracking-widest">{word.hanzi}</p>

      {show ? (
        <>
          <p className="text-base text-indigo-600">{word.pinyin}</p>
          <p className="text-gray-800">{word.en}</p>
          {word.pos && <p className="text-xs text-gray-500">[{word.pos}]</p>}
          {word.example && (
            <p className="text-xs text-gray-600 text-left whitespace-pre-wrap">
              {word.example}
            </p>
          )}
          {word.note && (
            <p className="text-xs text-amber-600 italic">{word.note}</p>
          )}
        </>
      ) : (
        <p className="mt-4 text-xs text-gray-400">tap to reveal</p>
      )}
    </button>
  );
};
