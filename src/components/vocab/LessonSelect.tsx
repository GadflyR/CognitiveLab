import React from "react";
import lessons from "../../data/lessons.cn.json";

export const LessonSelect: React.FC<{ onPick: (id: string) => void }> = ({
  onPick,
}) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-6">
    {lessons.map((l) => (
      <button
        key={l.id}
        onClick={() => onPick(l.id)}
        className="rounded-3xl bg-white/80 p-6 shadow-lg hover:shadow-xl flex flex-col items-center gap-3"
      >
        <span className="text-3xl">{l.title.match(/^[^ ]+/)}</span>
        <span className="text-sm text-gray-600">
          {l.vocab.length} words
        </span>
      </button>
    ))}
  </div>
);

export default lessons;
